import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  password: z.string().min(1, { message: "Hasło jest wymagane" })
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Hasło musi mieć minimum 8 znaków" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  password: z.string().min(8, { message: "Hasło musi mieć minimum 8 znaków" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;