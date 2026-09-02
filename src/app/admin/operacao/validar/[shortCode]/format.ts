/** Formata minutos como "2h 30min" (spec seções 15-18). */
export function formatMinutes(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '-' : ''
  const abs = Math.abs(Math.round(totalMinutes))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  if (h === 0) return `${sign}${m}min`
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h ${m}min`
}

/** Formata segundos como "H:MM:SS" (ou "MM:SS" com menos de 1h) para o contador ao vivo. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

/** Idade em anos/meses a partir de ageMonths (calculado no servidor via getAgeInMonths). */
export function formatAge(ageMonths: number): string {
  if (ageMonths < 12) return `${ageMonths} ${ageMonths === 1 ? 'mês' : 'meses'}`
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  const yearsLabel = `${years} ${years === 1 ? 'ano' : 'anos'}`
  if (months === 0) return yearsLabel
  return `${yearsLabel} e ${months} ${months === 1 ? 'mês' : 'meses'}`
}

export function formatDateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(value: string): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
