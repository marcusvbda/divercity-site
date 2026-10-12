import { z } from 'zod'
import { CONTENT_ENTITIES, paginationSchema } from '@/lib/content-api/entities'
import type { ContentEntity } from '@/lib/content-api/entities'

type JsonObject = Record<string, unknown>

const SCHEMA_NAMES: Record<string, string> = {
  prices: 'Price',
  hours: 'Hour',
}

const PARAM_DESCRIPTIONS: Record<string, string> = {
  type: 'Filtra pela origem do item: "salao" (salão de festas) ou "passaportes".',
  name: 'Busca por trecho do nome, sem diferenciar maiúsculas de minúsculas.',
  key: 'Filtra pela chave exata.',
  label: 'Busca por trecho do rótulo, sem diferenciar maiúsculas de minúsculas.',
  page: 'Número da página (a partir de 1).',
  perPage: 'Itens por página (de 1 a 100).',
}

const ID_DESCRIPTIONS: Record<string, { query: string; path: string }> = {
  prices: {
    query:
      'Filtra pelo identificador (texto): número do item do salão, ex.: "12", ou "<passportId>:child" / "<passportId>:companion".',
    path: 'Identificador do registro (texto): número do item do salão, ex.: "12", ou "<passportId>:child" / "<passportId>:companion".',
  },
  hours: {
    query: 'Filtra pelo identificador (inteiro de 1 a 2147483647).',
    path: 'Identificador do registro (inteiro de 1 a 2147483647).',
  },
}

function idJsonSchema(entity: ContentEntity): JsonObject {
  const schema = z.toJSONSchema(entity.idSchema, { io: 'input' }) as JsonObject
  delete schema.$schema
  return schema
}

function errorResponse(description: string, ref = '#/components/schemas/Error'): JsonObject {
  return {
    description,
    content: { 'application/json': { schema: { $ref: ref } } },
  }
}

function queryParameters(entity: ContentEntity): JsonObject[] {
  const filters = z.toJSONSchema(entity.filtersSchema, { io: 'input' }) as JsonObject
  const pagination = z.toJSONSchema(paginationSchema, { io: 'input' }) as JsonObject
  const properties: Record<string, JsonObject> = {
    ...(filters.properties as Record<string, JsonObject>),
    ...(pagination.properties as Record<string, JsonObject>),
  }
  return Object.entries(properties).map(([name, schema]) => ({
    name,
    in: 'query',
    required: false,
    description:
      name === 'id' ? ID_DESCRIPTIONS[entity.name]?.query : PARAM_DESCRIPTIONS[name],
    schema: name === 'id' ? idJsonSchema(entity) : schema,
  }))
}

function recordSchema(entity: ContentEntity): JsonObject {
  const properties: Record<string, JsonObject> = {}
  for (const field of entity.fields) {
    properties[field.name] = {
      type: field.type,
      ...(field.enum ? { enum: [...field.enum] } : {}),
      ...(field.nullable ? { nullable: true } : {}),
      description: field.description,
    }
  }
  return {
    type: 'object',
    properties,
    required: entity.fields.map((field) => field.name),
  }
}

export function buildOpenApiDocument() {
  const paths: Record<string, JsonObject> = {}
  const schemas: Record<string, JsonObject> = {
    Pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1 },
        perPage: { type: 'integer', minimum: 1, maximum: 100 },
        total: { type: 'integer', minimum: 0 },
        totalPages: { type: 'integer', minimum: 0 },
      },
      required: ['page', 'perPage', 'total', 'totalPages'],
    },
    Error: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
    ValidationError: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: {
          type: 'object',
          properties: {
            formErrors: { type: 'array', items: { type: 'string' } },
            fieldErrors: {
              type: 'object',
              additionalProperties: { type: 'array', items: { type: 'string' } },
            },
          },
          required: ['formErrors', 'fieldErrors'],
        },
      },
      required: ['error', 'details'],
    },
  }

  for (const [entityName, entity] of Object.entries(CONTENT_ENTITIES) as [string, ContentEntity][]) {
    const name = SCHEMA_NAMES[entityName]
    const basePath = `/api/v1/content/${entityName}`

    schemas[name] = recordSchema(entity)
    schemas[`${name}List`] = {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: `#/components/schemas/${name}` } },
        pagination: { $ref: '#/components/schemas/Pagination' },
      },
      required: ['data', 'pagination'],
    }
    schemas[`${name}Item`] = {
      type: 'object',
      properties: { data: { $ref: `#/components/schemas/${name}` } },
      required: ['data'],
    }

    paths[basePath] = {
      get: {
        operationId: `list${name}s`,
        summary: `Lista ${entityName}`,
        description: entity.description,
        tags: [entityName],
        parameters: queryParameters(entity),
        responses: {
          '200': {
            description: entity.listDescription,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${name}List` },
              },
            },
          },
          '400': errorResponse('Parâmetros inválidos.', '#/components/schemas/ValidationError'),
          '401': errorResponse('Token inválido.'),
          '404': errorResponse('Entidade não encontrada.'),
        },
      },
    }

    paths[`${basePath}/{id}`] = {
      get: {
        operationId: `get${name}`,
        summary: `Busca um registro de ${entityName} pelo id`,
        description: entity.description,
        tags: [entityName],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: ID_DESCRIPTIONS[entity.name]?.path,
            schema: idJsonSchema(entity),
          },
        ],
        responses: {
          '200': {
            description: 'Registro encontrado.',
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${name}Item` },
              },
            },
          },
          '400': errorResponse('Id inválido.'),
          '401': errorResponse('Token inválido.'),
          '404': errorResponse('Entidade ou registro não encontrado.'),
        },
      },
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Divercity Content API',
      version: '1.0.0',
      description:
        'API somente leitura de conteúdo do Divercity Park. Autenticação por token Bearer criado em Configurações > API tokens.',
    },
    servers: [{ url: '/' }],
    security: [{ bearerAuth: [] }],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
      },
      schemas,
    },
  }
}
