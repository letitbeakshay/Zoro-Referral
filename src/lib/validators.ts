// src/lib/validators.ts
import { z } from "zod"

export const phoneSchema = z
  .string()
  .min(10, { message: "Phone number must be at least 10 digits" })
  .max(15, { message: "Phone number is too long" })
  .regex(/^\+?[1-9]\d{1,14}$|^[6-9]\d{9}$/, {
    message: "Please enter a valid phone number (e.g., 9876543210)",
  })

export const memberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(50),
  phone: phoneSchema,
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  membershipId: z.string().optional().or(z.literal("")),
})

export const leadFormSchema = z.object({
  referralCode: z
    .string()
    .min(3, { message: "Referral code must be at least 3 characters" })
    .transform((val) => val.toUpperCase().trim()),
  customerName: z.string().min(2, { message: "Name must be at least 2 characters" }).max(50),
  customerPhone: phoneSchema,
  customerEmail: z.string().email({ message: "Invalid email address" }),
  plan: z.enum(["monthly", "quarterly", "half_yearly", "yearly"]),
  preferredVisitDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid visit date",
  }),
})

export type MemberFormValues = z.infer<typeof memberFormSchema>
export type LeadFormValues = z.infer<typeof leadFormSchema>
