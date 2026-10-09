import { isDefaultVariable } from '@/lib/contract-defaults'
import type { ContractVariableType } from '@/types/parties'

export const CONTRACT_VARIABLE_TYPE_LABELS: Record<ContractVariableType, string> = {
  text: 'Texto',
  time: 'Hora',
  number: 'Número',
  date: 'Data',
}

export function formatVariableValue(value: string, type?: ContractVariableType): string {
  if (!value) return ''
  if (type === 'date') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    return m ? `${m[3]}/${m[2]}/${m[1]}` : value
  }
  if (type === 'time') {
    const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value)
    return m ? `${m[1]}:${m[2]}` : value
  }
  if (type === 'number') {
    return /^-?\d+$/.test(value) ? String(Number(value)) : value
  }
  return value
}

export function renderContractBody(
  body: string,
  values: Record<string, string | undefined>,
  types: Record<string, ContractVariableType> | null | undefined,
  options: { highlightMissing: boolean },
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    const raw = values[key]
    if (raw == null || raw === '') {
      if (options.highlightMissing && !isDefaultVariable(key)) {
        return `<span class="bg-amber-100 text-amber-700 rounded px-1 font-mono text-xs">{{${key}}}</span>`
      }
      return ''
    }
    if (isDefaultVariable(key)) return raw
    return formatVariableValue(raw, types?.[key])
  })
}

const INPUT_FORMATS: Record<ContractVariableType, RegExp> = {
  text: /^[\s\S]*$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}$/,
  number: /^-?\d+$/,
}

export function getVariableInputProps(value: string, type: ContractVariableType = 'text') {
  const effective = value && !INPUT_FORMATS[type].test(value) ? 'text' : type
  return {
    type: effective,
    ...(effective === 'number' ? { step: 1, inputMode: 'numeric' as const } : {}),
  }
}
