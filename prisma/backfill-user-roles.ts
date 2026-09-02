import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const rawUrl = process.env.SUPABASE_URL!
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('Defina SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const pool = new Pool({ connectionString: process.env.DIRECT_URL, max: 1 })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/**
 * Antes da role `operator` existir, todo usuário autenticado no Supabase tinha
 * acesso total ao admin. Este script cria a linha `User` (Prisma) para cada
 * usuário Supabase já existente com role `admin`, preservando o acesso atual.
 * Idempotente: nunca sobrescreve a role de um usuário já cadastrado.
 */
async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    console.error('Erro ao listar usuários do Supabase:', error.message)
    process.exit(1)
  }

  for (const u of data.users) {
    const existing = await prisma.user.findUnique({ where: { id: u.id } })
    if (existing) {
      console.log(`- ${u.email}: já cadastrado como ${existing.role}, mantido`)
      continue
    }

    const created = await prisma.user.create({
      data: {
        id: u.id,
        email: u.email!,
        name: (u.user_metadata?.name as string | undefined) ?? null,
        role: 'admin',
      },
    })
    console.log(`+ ${created.email}: criado como admin`)
  }
}

main().finally(() => pool.end())
