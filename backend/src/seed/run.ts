/**
 * Seed script — run AFTER Strapi is started:
 *   STRAPI_TOKEN=<full-access-token> npx tsx src/seed/run.ts
 */
import fs from 'fs'
import path from 'path'
import {
  SEED_SITE_METADATA,
  SEED_CONFIGURACAO,
  SEED_ATRACOES,
  SEED_BENEFICIOS,
  SEED_PRECOS,
  SEED_PRICE_DISCLAIMERS,
  SEED_DEPOIMENTOS,
} from './data'

const BASE_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const TOKEN = process.env.STRAPI_TOKEN ?? process.env.STRAPI_API_TOKEN ?? ''

// Imagens ficam em frontend/public/ (relativo ao backend/)
const IMAGES_DIR = path.resolve('..', 'frontend', 'public')

type ApiResponse = Record<string, unknown> | null

async function api(path: string, method = 'GET', body?: unknown): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify({ data: body }) : undefined,
  })
  const json = await res.json() as ApiResponse
  if (!res.ok) {
    console.error(`❌ ${method} ${path}`, (json as Record<string, unknown>)?.error ?? json)
    return null
  }
  return json
}

/** Faz upload de uma imagem para o Strapi e retorna o ID do media */
async function uploadImage(filename: string): Promise<number | null> {
  const filePath = path.join(IMAGES_DIR, filename)
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Image not found: ${filePath}`)
    return null
  }

  // Verifica se já existe no media library pelo nome
  const existing = await fetch(`${BASE_URL}/api/upload/files?filters[name][$contains]=${path.parse(filename).name}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (existing.ok) {
    const existingData = await existing.json() as Array<{ id: number; name: string }>
    const match = existingData.find((f) => f.name.startsWith(path.parse(filename).name))
    if (match) {
      console.log(`⏭  Image "${filename}" already uploaded (id: ${match.id})`)
      return match.id
    }
  }

  const form = new FormData()
  const fileBuffer = fs.readFileSync(filePath)
  const blob = new Blob([fileBuffer], { type: 'image/png' })
  form.append('files', blob, filename)

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  })

  if (!res.ok) {
    console.error(`❌ Upload failed for ${filename}:`, await res.text())
    return null
  }

  const data = await res.json() as Array<{ id: number }>
  const id = data[0]?.id ?? null
  console.log(`✅ Uploaded "${filename}" → id: ${id}`)
  return id
}

async function seedSingleType(path: string, data: unknown, label: string) {
  const existing = await api(path) as Record<string, unknown> | null
  if (existing?.data) {
    console.log(`⏭  ${label} already exists — skipping`)
    return
  }
  const result = await api(path, 'PUT', data)
  console.log(result ? `✅ ${label} seeded` : `❌ ${label} failed`)
}

async function seedCollection(path: string, items: unknown[], label: string, uniqueField: string) {
  const existing = await api(`${path}?pagination[pageSize]=100`) as Record<string, unknown> | null
  const existingValues = new Set(
    ((existing?.data ?? []) as Record<string, unknown>[]).map(
      (i) => i[uniqueField] ?? (i.attributes as Record<string, unknown>)?.[uniqueField]
    )
  )
  let created = 0
  for (const item of items) {
    const record = item as Record<string, unknown>
    const val = record[uniqueField]
    if (existingValues.has(val)) {
      console.log(`⏭  ${label} "${val}" exists — skipping`)
      continue
    }
    const result = await api(path, 'POST', { ...record, publishedAt: new Date().toISOString() })
    if (result) { console.log(`✅ ${label} "${val}" created`); created++ }
    else console.log(`❌ ${label} "${val}" failed`)
  }
  if (created === 0 && items.length > 0) console.log(`⏭  All ${label} already seeded`)
}

// Mapa: nome da atração → arquivo de imagem
const ATRACAO_IMAGE_MAP: Record<string, string> = {
  'Arena de Camas Elásticas': 'cama-elastica.png',
  'Guerreiro Ninja': 'guerreiro-ninja.png',
  'Parede de Escalada': 'parede-escalada.png',
  'Salão de Festas': 'salao-de-festas.png',
  'Desafio Radical': 'desafio-radical.png',
  'Pula-Pulas': 'pula-pulas.png',
  'Bar e Petiscaria': 'bar.png',
}

// Imagens da seção Festas
const FESTAS_IMAGES = ['salao-de-festas.png', 'dbz.png', 'f1.png', 'futebol.png']

async function seedAtracoesWithImages() {
  console.log('\n📸 Uploading attraction images...')

  const existing = await api('/atracoes?pagination[pageSize]=100&populate=imagem') as Record<string, unknown> | null
  const existingAtracoes = ((existing?.data ?? []) as Record<string, unknown>[])

  for (const seed of SEED_ATRACOES) {
    const imageFile = ATRACAO_IMAGE_MAP[seed.nome]
    const existingItem = existingAtracoes.find(
      (a) => a.nome === seed.nome
    )

    if (existingItem) {
      // Já existe — só faz upload da imagem se ainda não tiver
      const hasImage = (existingItem.imagem as Record<string, unknown> | null)?.url
      if (!hasImage && imageFile) {
        const imageId = await uploadImage(imageFile)
        if (imageId && existingItem.documentId) {
          await api(`/atracoes/${existingItem.documentId}`, 'PUT', { imagem: imageId })
          console.log(`✅ Image linked to "${seed.nome}"`)
        }
      } else {
        console.log(`⏭  "${seed.nome}" already has image — skipping`)
      }
      continue
    }

    // Cria nova atração com imagem
    let imageId: number | null = null
    if (imageFile) imageId = await uploadImage(imageFile)

    const payload: Record<string, unknown> = {
      ...seed,
      publishedAt: new Date().toISOString(),
    }
    if (imageId) payload.imagem = imageId

    const result = await api('/atracoes', 'POST', payload)
    console.log(result ? `✅ Atracao "${seed.nome}" created with image` : `❌ Atracao "${seed.nome}" failed`)
  }
}

async function seedConfiguracaoWithImages() {
  console.log('\n📸 Uploading party images for configuracao-site...')

  const partyImageIds: number[] = []
  for (const filename of FESTAS_IMAGES) {
    const id = await uploadImage(filename)
    if (id) partyImageIds.push(id)
  }

  const existing = await api('/configuracao-site?populate=festas_imagens') as Record<string, unknown> | null
  const existingData = existing?.data as Record<string, unknown> | null

  if (!existingData) {
    // Criar com tudo
    const payload = {
      ...SEED_CONFIGURACAO,
      festas_imagens: partyImageIds,
    }
    const result = await api('/configuracao-site', 'PUT', payload)
    console.log(result ? '✅ configuracao-site seeded with images' : '❌ configuracao-site failed')
    return
  }

  // Já existe — atualiza imagens se não tiver
  const existingImages = (existingData.festas_imagens as unknown[] | null) ?? []
  if (existingImages.length === 0 && partyImageIds.length > 0) {
    await api('/configuracao-site', 'PUT', { festas_imagens: partyImageIds })
    console.log('✅ Party images linked to configuracao-site')
  } else {
    console.log('⏭  configuracao-site already has party images — skipping')
  }
}

async function main() {
  if (!TOKEN) {
    console.error('❌ Missing STRAPI_TOKEN or STRAPI_API_TOKEN env var')
    process.exit(1)
  }
  console.log(`🌱 Seeding Divercity Park CMS at ${BASE_URL}...\n`)

  await seedSingleType('/site-metadata', SEED_SITE_METADATA, 'site-metadata')
  await seedConfiguracaoWithImages()
  await seedCollection('/beneficios', SEED_BENEFICIOS, 'beneficio', 'titulo')
  await seedAtracoesWithImages()
  await seedCollection('/precos', SEED_PRECOS, 'preco', 'titulo')
  await seedCollection('/price-disclaimers', SEED_PRICE_DISCLAIMERS, 'price-disclaimer', 'titulo')
  await seedCollection('/depoimentos', SEED_DEPOIMENTOS, 'depoimento', 'nome')

  console.log('\n🎉 Seed complete!')
}

main().catch(console.error)
