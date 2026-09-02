/** 0-4 anos (regra de acompanhante gratuito, spec seção 4): usar localmente só para decidir
 * se a pergunta "com/sem acompanhante" aparece na UI. O backend recalcula e valida tudo. */
const COMPANION_ELIGIBLE_MAX_AGE_MONTHS = 60

export function currency(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value
  return (Number.isFinite(num) ? num : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ageInMonthsLocal(birthDate: string, at: Date = new Date()): number | null {
  if (!birthDate) return null
  const d = new Date(birthDate)
  if (Number.isNaN(d.getTime())) return null
  let months = (at.getFullYear() - d.getFullYear()) * 12 + (at.getMonth() - d.getMonth())
  if (at.getDate() < d.getDate()) months -= 1
  return Math.max(months, 0)
}

export function isCompanionEligibleLocal(birthDate: string): boolean {
  const months = ageInMonthsLocal(birthDate)
  return months !== null && months < COMPANION_ELIGIBLE_MAX_AGE_MONTHS
}

export function formatAge(ageMonths: number): string {
  if (ageMonths < 12) return `${ageMonths} ${ageMonths === 1 ? 'mês' : 'meses'}`
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  const yearsLabel = `${years} ${years === 1 ? 'ano' : 'anos'}`
  if (months === 0) return yearsLabel
  return `${yearsLabel} e ${months} ${months === 1 ? 'mês' : 'meses'}`
}

export function formatPhoneInput(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function todayInputMax(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export async function parseJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export function extractApiErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const err = (body as { error: unknown }).error
    if (typeof err === 'string') return err
    if (err && typeof err === 'object') {
      const flattened = err as { formErrors?: string[]; fieldErrors?: Record<string, string[]> }
      const first =
        flattened.formErrors?.[0] ??
        Object.values(flattened.fieldErrors ?? {})
          .flat()
          .find(Boolean)
      if (first) return first
    }
  }
  return fallback
}
