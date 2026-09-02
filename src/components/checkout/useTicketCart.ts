'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'

import {
  TicketOrderCreateSchema,
  type TicketOrderCreateInput,
  type TicketChildInput,
  type TicketCompanionInput,
} from '@/lib/schemas/tickets'
import type {
  CheckoutSuccessResponse,
  PassportTypeDto,
  PassportTypesResponse,
  QuoteResponse,
} from './types'
import { extractApiErrorMessage, isCompanionEligibleLocal, parseJsonSafe } from './utils'

const QUOTE_DEBOUNCE_MS = 500

function emptyChild(): TicketChildInput {
  return { name: '', birthDate: '', passportTypeId: '', isPNE: false }
}

function defaultValues(): TicketOrderCreateInput {
  return {
    visitDayType: 'weekday',
    children: [emptyChild()],
    companions: [],
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianWhatsapp: '',
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(extractApiErrorMessage(json, 'Não foi possível concluir a operação.'))
  }
  return json as T
}

export function useTicketCart() {
  const form = useForm<TicketOrderCreateInput>({
    // TicketOrderCreateSchema has fields with `.default(...)` (isPNE, companions), which makes
    // zodResolver's inferred input type diverge slightly (optional) from the exported z.infer
    // output type we use as our canonical form type everywhere else. Safe to cast: defaults are
    // always applied on parse, so shape at runtime always matches TicketOrderCreateInput.
    resolver: zodResolver(TicketOrderCreateSchema) as unknown as Resolver<TicketOrderCreateInput>,
    defaultValues: defaultValues(),
    mode: 'onBlur',
  })

  const { control, getValues, setValue } = form

  const childrenArray = useFieldArray({ control, name: 'children' })
  const companionsArray = useFieldArray({ control, name: 'companions' })

  const passportTypesQuery = useQuery<PassportTypesResponse>({
    queryKey: ['ticket-passport-types'],
    queryFn: async () => {
      const res = await fetch('/api/tickets/passport-types')
      if (!res.ok) throw new Error('Não foi possível carregar os tipos de passaporte.')
      return res.json() as Promise<PassportTypesResponse>
    },
    staleTime: 5 * 60 * 1000,
  })

  const passportTypes: PassportTypeDto[] = useMemo(
    () => passportTypesQuery.data?.data ?? [],
    [passportTypesQuery.data]
  )

  const quoteMutation = useMutation<
    QuoteResponse,
    Error,
    { visitDayType: TicketOrderCreateInput['visitDayType']; children: TicketChildInput[]; companions: TicketCompanionInput[] }
  >({
    mutationFn: (payload) => postJson<QuoteResponse>('/api/tickets/quote', payload),
  })

  const checkoutMutation = useMutation<CheckoutSuccessResponse, Error, TicketOrderCreateInput>({
    mutationFn: (payload) => postJson<CheckoutSuccessResponse>('/api/tickets/checkout', payload),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
  })

  const visitDayType = useWatch({ control, name: 'visitDayType' })
  const watchedChildren = useWatch({ control, name: 'children' })
  const watchedCompanions = useWatch({ control, name: 'companions' })

  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPayloadKey = useRef<string>('')

  const canQuote = useMemo(() => {
    const children = watchedChildren ?? []
    const companions = watchedCompanions ?? []
    if (children.length === 0) return false
    const childrenReady = children.every((c) => c?.name?.trim() && c?.birthDate && c?.passportTypeId)
    const companionsReady = companions.every((c) =>
      c?.linkedChildIndex !== undefined ? Boolean(c?.name?.trim()) : Boolean(c?.name?.trim() && c?.passportTypeId)
    )
    return childrenReady && companionsReady
  }, [watchedChildren, watchedCompanions])

  useEffect(() => {
    if (!canQuote) return
    const payload = {
      visitDayType: visitDayType ?? 'weekday',
      children: watchedChildren ?? [],
      companions: watchedCompanions ?? [],
    }
    const key = JSON.stringify(payload)
    if (key === lastPayloadKey.current) return

    if (quoteTimer.current) clearTimeout(quoteTimer.current)
    quoteTimer.current = setTimeout(() => {
      lastPayloadKey.current = key
      quoteMutation.mutate(payload)
    }, QUOTE_DEBOUNCE_MS)

    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuote, visitDayType, watchedChildren, watchedCompanions])

  const addChild = useCallback(() => {
    childrenArray.append(emptyChild())
  }, [childrenArray])

  const removeChildAt = useCallback(
    (index: number) => {
      const companions = getValues('companions') ?? []
      const remapped = companions
        .filter((c) => c.linkedChildIndex !== index)
        .map((c) =>
          c.linkedChildIndex !== undefined && c.linkedChildIndex > index
            ? { ...c, linkedChildIndex: c.linkedChildIndex - 1 }
            : c
        )
      companionsArray.replace(remapped)
      childrenArray.remove(index)
    },
    [childrenArray, companionsArray, getValues]
  )

  const setChildCompanion = useCallback(
    (childIndex: number, data: { name: string; phone?: string }) => {
      const companions = getValues('companions') ?? []
      const existingIndex = companions.findIndex((c) => c.linkedChildIndex === childIndex)
      if (existingIndex >= 0) {
        companionsArray.update(existingIndex, {
          name: data.name,
          phone: data.phone,
          linkedChildIndex: childIndex,
        })
      } else {
        companionsArray.append({ name: data.name, phone: data.phone, linkedChildIndex: childIndex })
      }
    },
    [companionsArray, getValues]
  )

  const clearChildCompanion = useCallback(
    (childIndex: number) => {
      const companions = getValues('companions') ?? []
      const existingIndex = companions.findIndex((c) => c.linkedChildIndex === childIndex)
      if (existingIndex >= 0) companionsArray.remove(existingIndex)
    },
    [companionsArray, getValues]
  )

  const addExtraCompanion = useCallback(() => {
    companionsArray.append({ name: '', phone: '', passportTypeId: '' })
  }, [companionsArray])

  const removeExtraCompanionAt = useCallback(
    (index: number) => {
      companionsArray.remove(index)
    },
    [companionsArray]
  )

  const setChildHasCompanion = useCallback(
    (childIndex: number, value: boolean | undefined) => {
      setValue(`children.${childIndex}.hasCompanion`, value, { shouldValidate: false })
      if (value !== true) {
        clearChildCompanion(childIndex)
      }
      if (value !== false) {
        setValue(`children.${childIndex}.unaccompaniedTermsAccepted`, undefined)
      }
    },
    [clearChildCompanion, setValue]
  )

  const extraCompanionEntries = useMemo(() => {
    const companions = watchedCompanions ?? []
    return companions
      .map((companion, index) => ({ companion, index }))
      .filter((entry) => entry.companion?.linkedChildIndex === undefined)
  }, [watchedCompanions])

  const childCompanionFor = useCallback(
    (childIndex: number) => {
      const companions = watchedCompanions ?? []
      return companions.find((c) => c?.linkedChildIndex === childIndex) ?? null
    },
    [watchedCompanions]
  )

  const eligibleChildrenWithoutDecision = useMemo(() => {
    const children = watchedChildren ?? []
    return children
      .map((child, index) => ({ child, index }))
      .filter(({ child }) => child?.birthDate && isCompanionEligibleLocal(child.birthDate))
      .filter(({ child }) => child?.hasCompanion === undefined)
  }, [watchedChildren])

  const childrenNeedingTerms = useMemo(() => {
    const children = watchedChildren ?? []
    return children.filter((child) => child?.hasCompanion === false && !child?.unaccompaniedTermsAccepted)
  }, [watchedChildren])

  const submitCheckout = useCallback(() => {
    checkoutMutation.mutate(getValues())
  }, [checkoutMutation, getValues])

  return {
    form,
    childrenArray,
    companionsArray,
    passportTypes,
    passportTypesQuery,
    quoteMutation,
    checkoutMutation,
    visitDayType,
    watchedChildren: watchedChildren ?? [],
    watchedCompanions: watchedCompanions ?? [],
    addChild,
    removeChildAt,
    setChildCompanion,
    clearChildCompanion,
    setChildHasCompanion,
    addExtraCompanion,
    removeExtraCompanionAt,
    extraCompanionEntries,
    childCompanionFor,
    eligibleChildrenWithoutDecision,
    childrenNeedingTerms,
    submitCheckout,
  }
}

export type TicketCart = ReturnType<typeof useTicketCart>
