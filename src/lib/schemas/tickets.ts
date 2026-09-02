import { z } from "zod";

export const PassportTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  durationMinutes: z.number().int().positive("Duração deve ser maior que zero"),
  weekdayChildPrice: z.number().min(0, "Valor inválido"),
  weekendChildPrice: z.number().min(0, "Valor inválido"),
  weekdayCompanionPrice: z.number().min(0, "Valor inválido"),
  weekendCompanionPrice: z.number().min(0, "Valor inválido"),
  active: z.boolean().optional(),
  sort: z.number().int().optional(),
});

export const VisitDayTypeSchema = z.enum(["weekday", "weekend"]);

export const TicketChildInputSchema = z.object({
  name: z.string().min(1, "Nome da criança é obrigatório"),
  birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Data de nascimento inválida"),
  passportTypeId: z.string().min(1, "Tipo de passaporte é obrigatório"),
  isPNE: z.boolean().default(false),
  hasCompanion: z.boolean().optional(),
  unaccompaniedTermsAccepted: z.boolean().optional(),
});

export const TicketCompanionInputSchema = z.object({
  name: z.string().min(1, "Nome do acompanhante é obrigatório"),
  phone: z.string().optional(),
  linkedChildIndex: z.number().int().min(0).optional(),
  passportTypeId: z.string().min(1).optional(),
});

export const TicketQuoteRequestSchema = z.object({
  visitDayType: VisitDayTypeSchema,
  children: z.array(TicketChildInputSchema).min(1, "Inclua ao menos uma criança"),
  companions: z.array(TicketCompanionInputSchema).default([]),
});

export const TicketOrderCreateSchema = TicketQuoteRequestSchema.extend({
  guardianName: z.string().min(1, "Nome do responsável é obrigatório"),
  guardianEmail: z.string().email("E-mail inválido"),
  guardianPhone: z.string().min(1, "Telefone é obrigatório"),
  guardianWhatsapp: z.string().min(1, "WhatsApp é obrigatório"),
});

export type PassportTypeInput = z.infer<typeof PassportTypeSchema>;
export type VisitDayType = z.infer<typeof VisitDayTypeSchema>;
export type TicketChildInput = z.infer<typeof TicketChildInputSchema>;
export type TicketCompanionInput = z.infer<typeof TicketCompanionInputSchema>;
export type TicketQuoteRequest = z.infer<typeof TicketQuoteRequestSchema>;
export type TicketOrderCreateInput = z.infer<typeof TicketOrderCreateSchema>;
