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

export type CustomerInput = z.infer<typeof CustomerSchema>;
export type ContractTemplateInput = z.infer<typeof ContractTemplateSchema>;
export type PartyInput = z.infer<typeof PartySchema>;
export type ContractFieldValues = z.infer<typeof ContractFieldValuesSchema>;
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;
