import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDefaultVariableLabel } from '@/lib/contract-defaults'

type ColRow = { column_name: string }

function isSkipColumn(col: string): boolean {
  if (col === 'id') return true
  if (col === 'createdAt' || col === 'created_at') return true
  if (col === 'updatedAt' || col === 'updated_at') return true
  if (col.endsWith('Id')) return true   // customerId, contractTemplateId, partyId
  if (col.endsWith('_id')) return true  // customer_id, contract_template_id
  return false
}

const CONTRATO_KEYS = ['contrato_valor', 'contrato_status_pagamento', 'contrato_informacoes_adicionais']

export async function GET() {
  const [customerCols, partyCols] = await Promise.all([
    prisma.$queryRaw<ColRow[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'customers'
      ORDER BY ordinal_position
    `,
    prisma.$queryRaw<ColRow[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'parties'
      ORDER BY ordinal_position
    `,
  ])

  const clienteCols = customerCols.filter(({ column_name }) => !isSkipColumn(column_name))
  const festaCols   = partyCols.filter(({ column_name }) => !isSkipColumn(column_name))

  return NextResponse.json({
    cliente: clienteCols.map(({ column_name }) => ({
      key:      `cliente_${column_name}`,
      variable: `{{cliente_${column_name}}}`,
      label:    getDefaultVariableLabel(`cliente_${column_name}`),
    })),
    festa: festaCols.map(({ column_name }) => ({
      key:      `festa_${column_name}`,
      variable: `{{festa_${column_name}}}`,
      label:    getDefaultVariableLabel(`festa_${column_name}`),
    })),
    contrato: CONTRATO_KEYS.map((key) => ({
      key,
      variable: `{{${key}}}`,
      label: getDefaultVariableLabel(key),
    })),
  })
}
