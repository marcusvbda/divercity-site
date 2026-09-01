import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.SUPABASE_URL!
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = process.env.RESET_USER_ID
const newPassword = process.env.RESET_USER_PASSWORD

if (!serviceRoleKey || !userId || !newPassword) {
  console.error(
    'Defina SUPABASE_SERVICE_ROLE_KEY, RESET_USER_ID e RESET_USER_PASSWORD no .env.local'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data, error } = await supabase.auth.admin.updateUserById(userId!, {
    password: newPassword,
  })

  if (error) {
    console.error('Erro ao atualizar senha:', error.message)
    process.exit(1)
  }

  console.log(`Senha atualizada para o usuário ${data.user.email} (${data.user.id})`)
}

main()
