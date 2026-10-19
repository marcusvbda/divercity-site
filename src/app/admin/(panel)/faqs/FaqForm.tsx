'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/admin/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/admin/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/admin/ui/field'
import { Switch } from '@/components/admin/ui/switch'
import { Textarea } from '@/components/admin/ui/textarea'
import {
  FAQ_ANSWER_MAX_LENGTH,
  FAQ_QUESTION_MAX_LENGTH,
} from '@/lib/schemas/faqs'

export type FaqFormValues = {
  question: string
  answer: string
  published: boolean
}

export type FaqFieldErrors = {
  question?: string
  answer?: string
}

export class FaqApiError extends Error {
  fieldErrors: FaqFieldErrors

  constructor(message: string, fieldErrors: FaqFieldErrors = {}) {
    super(message)
    this.fieldErrors = fieldErrors
  }
}

export async function parseFaqResponse<T>(
  res: Response,
  fallback: string
): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (res.ok) return body as T
  const error = body?.error
  if (typeof error === 'string') throw new FaqApiError(error)
  if (error && typeof error === 'object') {
    const fields = (error.fieldErrors ?? {}) as Record<string, string[]>
    const fieldErrors: FaqFieldErrors = {
      question: fields.question?.[0],
      answer: fields.answer?.[0],
    }
    const message =
      fieldErrors.question ??
      fieldErrors.answer ??
      (error.formErrors as string[] | undefined)?.[0] ??
      fallback
    throw new FaqApiError(message, fieldErrors)
  }
  throw new FaqApiError(fallback)
}

type Props = {
  mode: 'create' | 'edit'
  title: string
  description?: string
  defaultValues?: Partial<FaqFormValues>
  fieldErrors?: FaqFieldErrors
  onSubmit: (data: FaqFormValues) => void
  isLoading?: boolean
}

export function FaqForm({
  mode,
  title,
  description,
  defaultValues,
  fieldErrors,
  onSubmit,
  isLoading,
}: Props) {
  const isEdit = mode === 'edit'
  const [question, setQuestion] = useState(defaultValues?.question ?? '')
  const [answer, setAnswer] = useState(defaultValues?.answer ?? '')
  const [published, setPublished] = useState(defaultValues?.published ?? false)
  const [errors, setErrors] = useState<FaqFieldErrors>({})

  const hasAnswer = answer.trim() !== ''
  const shownErrors: FaqFieldErrors = { ...fieldErrors, ...errors }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: FaqFieldErrors = {}
    if (!isEdit) {
      if (!question.trim()) newErrors.question = 'Pergunta é obrigatória'
      else if (question.trim().length > FAQ_QUESTION_MAX_LENGTH)
        newErrors.question = `Pergunta deve ter no máximo ${FAQ_QUESTION_MAX_LENGTH} caracteres`
    }
    if (answer.trim().length > FAQ_ANSWER_MAX_LENGTH) {
      newErrors.answer = `Resposta deve ter no máximo ${FAQ_ANSWER_MAX_LENGTH} caracteres`
    } else if (isEdit && published && !hasAnswer) {
      newErrors.answer = 'Para apagar a resposta, despublique a FAQ antes'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onSubmit({
      question: question.trim(),
      answer: answer.trim(),
      published,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {isEdit ? (
              <Field>
                <FieldLabel>Pergunta</FieldLabel>
                <p className="text-sm break-words whitespace-pre-wrap">
                  {question}
                </p>
              </Field>
            ) : (
              <Field data-invalid={!!shownErrors.question}>
                <FieldLabel htmlFor="question">Pergunta</FieldLabel>
                <Textarea
                  id="question"
                  rows={3}
                  maxLength={FAQ_QUESTION_MAX_LENGTH}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  aria-invalid={!!shownErrors.question}
                />
                {shownErrors.question && (
                  <FieldError>{shownErrors.question}</FieldError>
                )}
              </Field>
            )}

            <Field data-invalid={!!shownErrors.answer}>
              <FieldLabel htmlFor="answer">
                {isEdit ? 'Resposta' : 'Resposta (opcional)'}
              </FieldLabel>
              <Textarea
                id="answer"
                rows={6}
                maxLength={FAQ_ANSWER_MAX_LENGTH}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                aria-invalid={!!shownErrors.answer}
              />
              {shownErrors.answer && (
                <FieldError>{shownErrors.answer}</FieldError>
              )}
            </Field>

            {isEdit && (
              <Field orientation="horizontal">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                  disabled={!hasAnswer && !published}
                />
                <div className="flex flex-col gap-1">
                  <FieldLabel htmlFor="published">Publicada</FieldLabel>
                  {!hasAnswer && (
                    <FieldDescription>
                      Escreva uma resposta para poder publicar.
                    </FieldDescription>
                  )}
                </div>
              </Field>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/faqs" />}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar FAQ'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
