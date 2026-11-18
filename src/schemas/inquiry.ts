import { z } from "zod";
import { BUDGET_VALUES } from "../data/navigation.ts";
import { SERVICE_SLUGS } from "../data/services.ts";

/**
 * Strips ASCII control characters and newlines from single-line inputs
 * to prevent email header injection (CRLF) and log forging.
 */
export function sanitizeSingleLine(value: string): string {
  return value
    .replace(/[\r\n\t\u0000-\u001F\u007F]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Sanitizes multi-line text while preserving intentional line breaks.
 */
export function sanitizeMultiLine(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .transform((val) => sanitizeSingleLine(val))
    .refine((val) => val.length <= maxLength, {
      message: `Must be ${maxLength} characters or fewer.`,
    })
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined));

/**
 * Validates optional reference URLs (moodboards, Google Drive, Vimeo, Instagram, etc.).
 * Strictly permits ONLY http: or https: protocols to prevent javascript:/data: XSS injection.
 */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export const inquirySchema = z.object({
  fullName: z
    .string()
    .transform(sanitizeSingleLine)
    .refine((val) => val.length >= 2, "Please enter your full name (at least 2 characters).")
    .refine((val) => val.length <= 120, "Name must be 120 characters or fewer."),

  email: z
    .string()
    .transform((val) => sanitizeSingleLine(val).toLowerCase())
    .refine((val) => val.length >= 5 && val.length <= 254, "Please enter a valid email address.")
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val),
      "Please enter a valid email address."
    ),

  phone: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeSingleLine(val) : ""))
    .refine((val) => val.length <= 40, "Phone number must be 40 characters or fewer.")
    .refine(
      (val) => !val || /^[+\d()\-\s.]{7,40}$/.test(val),
      "Please enter a valid phone number (digits, spaces, +, -, parentheses)."
    )
    .refine((val) => !val || val.replace(/\D/g, "").length >= 7, "Phone number must contain at least 7 digits.")
    .transform((val) => (val.length > 0 ? val : undefined)),

  companyName: optionalTrimmedString(140),

  selectedServices: z
    .array(z.enum(SERVICE_SLUGS))
    .min(1, "Select at least one creative service.")
    .max(11, "Maximum 11 services allowed.")
    .transform((items) => Array.from(new Set(items))),

  eventName: z
    .string()
    .transform(sanitizeSingleLine)
    .refine((val) => val.length >= 2, "Please enter your project or event name.")
    .refine((val) => val.length <= 160, "Project name must be 160 characters or fewer."),

  eventDate: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeSingleLine(val) : undefined))
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      "Please enter a valid date (YYYY-MM-DD)."
    ),

  eventLocation: optionalTrimmedString(160),

  budgetRange: z.enum(BUDGET_VALUES, {
    error: "Please select an estimated budget range.",
  }),

  projectDetails: z
    .string()
    .transform(sanitizeMultiLine)
    .refine(
      (val) => val.length >= 15,
      "Please describe your project or event vision (at least 15 characters)."
    )
    .refine(
      (val) => val.length <= 3000,
      "Project description must be 3,000 characters or fewer."
    ),

  referenceLink: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeSingleLine(val) : ""))
    .refine(
      (val) => val.length <= 500,
      "Reference link must be 500 characters or fewer."
    )
    .refine(
      (val) => !val || isSafeHttpUrl(val),
      "Please enter a valid https:// or http:// URL (e.g., moodboard, Drive, or Vimeo link)."
    )
    .transform((val) => (val.length > 0 ? val : undefined)),

  sourcePage: optionalTrimmedString(200),

  // Duplicate prevention & anti-bot fields
  idempotencyKey: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeSingleLine(val) : undefined))
    .refine(
      (val) => !val || /^[a-zA-Z0-9_-]{16,64}$/.test(val),
      "Invalid submission key."
    ),
  turnstileToken: z.string().max(4096).optional().default(""),
  websiteHoneypot: z.string().max(200).optional().default(""),
});

export type InquiryInput = z.input<typeof inquirySchema>;
export type ValidatedInquiry = z.output<typeof inquirySchema>;
