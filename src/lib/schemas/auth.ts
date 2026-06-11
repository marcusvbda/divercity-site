import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email obrigatório").email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const esqueciSenhaSchema = z.object({
  email: z.string().min(1, "Email obrigatório").email("Email inválido"),
});

export const redefinirSenhaSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter pelo menos um número"),
    confirmPassword: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type EsqueciSenhaFormData = z.infer<typeof esqueciSenhaSchema>;
export type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>;
