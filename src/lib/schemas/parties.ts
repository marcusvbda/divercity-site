import { z } from "zod";

export const CustomerSchema = z.object({
  cpf: z
    .string()
    .length(11, "CPF deve ter 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const ContractTemplateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  body: z.string().min(1, "Conteúdo é obrigatório"),
  isDefault: z.boolean().optional(),
});

export const PartySchema = z.object({
  customerId: z.number().int().positive(),
  contractTemplateId: z.number().int().positive(),
  date: z.string().datetime(),
  dateEnd: z.string().datetime().optional().nullable(),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
});

export const ContractFieldValuesSchema = z.record(z.string(), z.string());

export const UpdateContractSchema = z.object({
  fieldValues: ContractFieldValuesSchema,
  status: z
    .enum(["draft", "pending", "in_review", "signed", "completed", "cancelled"])
    .optional(),
});

export const PartyPaymentOptionSchema = z.enum(["salon_only", "salon_and_passports"]);

export const PartyBudgetReservationSchema = CustomerSchema.extend({
  date: z.string().datetime(),
  childrenCount: z.number().int().min(0, "Quantidade de crianças inválida"),
  adultsCount: z.number().int().min(0, "Quantidade de adultos inválida"),
  totalParticipants: z
    .number()
    .int()
    .min(1, "Quantidade total de participantes inválida")
    .max(50, "Máximo de 50 participantes no total"),
  paymentOption: PartyPaymentOptionSchema,
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, "É necessário aceitar os termos e condições"),
})
  .refine((data) => data.totalParticipants === data.childrenCount + data.adultsCount, {
    message:
      "totalParticipants deve ser igual à soma de childrenCount e adultsCount",
    path: ["totalParticipants"],
  })
  .refine((data) => new Date(data.date).getTime() > Date.now(), {
    message: "A data da reserva deve ser no futuro",
    path: ["date"],
  });

export type CustomerInput = z.infer<typeof CustomerSchema>;
export type ContractTemplateInput = z.infer<typeof ContractTemplateSchema>;
export type PartyInput = z.infer<typeof PartySchema>;
export type ContractFieldValues = z.infer<typeof ContractFieldValuesSchema>;
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;
export type PartyPaymentOption = z.infer<typeof PartyPaymentOptionSchema>;
export type PartyBudgetReservationInput = z.infer<typeof PartyBudgetReservationSchema>;
