import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email address is too long.")
  .email("Enter a valid email address.");
export const newPasswordSchema = z
  .string()
  .min(10, "Use at least 10 characters for your password.")
  .max(128, "Use no more than 128 characters.");
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(128, "Use no more than 128 characters."),
});
export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name (at least 2 characters).")
      .max(100, "Use no more than 100 characters.")
      .regex(
        /^[\p{L}\p{M}][\p{L}\p{M}\s.'’\-]*$/u,
        "Use letters, spaces, apostrophes or hyphens for your name.",
      ),
    phone: z
      .string()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        "Enter 8–15 digits, with an optional leading + for the country code.",
      ),
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export const verificationSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
