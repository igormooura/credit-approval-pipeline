import { z } from "zod";

export const proposalSchema = z.object({
  CPF: z
    .string()
    .min(11, "CPF deve ter 11 dígitos")
    .max(11, "CPF deve ter 11 dígitos"),
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Invalid email address"),
  income: z.number().positive("Renda deve ser positiva"),
});

export type ProposalInput = z.infer<typeof proposalSchema>;
