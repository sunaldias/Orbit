import "server-only";
import { Resend } from "resend";
import {
  buildBusinessInquiryEmail,
  buildClientConfirmationEmail,
} from "@/emails/inquiry-templates";
import { getServerEnv } from "@/lib/env";
import type { ValidatedInquiry } from "@/schemas/inquiry";

export interface EmailSendOutcome {
  businessEmailSent: boolean;
  clientAckSent: boolean;
  skipped?: boolean;
  errorMessage?: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Dispatches:
 * 1. Business notification email to the configured ORBIT business inbox (`INQUIRY_RECIPIENT_EMAIL`)
 * 2. Customer acknowledgment email to `inquiry.email`
 */
export async function dispatchInquiryEmails(
  inquiry: ValidatedInquiry,
  referenceCode: string
): Promise<EmailSendOutcome> {
  const env = getServerEnv();
  const resend = getResendClient();

  if (!resend) {
    if (env.NODE_ENV === "production") {
      return {
        businessEmailSent: false,
        clientAckSent: false,
        errorMessage: "RESEND_API_KEY is not configured in production.",
      };
    }
    return {
      businessEmailSent: true,
      clientAckSent: true,
      skipped: true,
    };
  }

  let businessEmailSent = false;
  let clientAckSent = false;
  let errorMessage: string | undefined;

  try {
    const businessEmail = buildBusinessInquiryEmail(inquiry, referenceCode);

    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: [env.INQUIRY_RECIPIENT_EMAIL],
      replyTo: inquiry.email,
      subject: businessEmail.subject,
      html: businessEmail.html,
      text: businessEmail.text,
      tags: [
        { name: "category", value: "booking-inquiry" },
        { name: "reference", value: referenceCode },
      ],
    });

    if (error) {
      errorMessage = error.message || "Business notification delivery failed.";
    } else {
      businessEmailSent = true;
    }

    if (env.SEND_CLIENT_CONFIRMATION !== "false") {
      const clientEmail = buildClientConfirmationEmail(inquiry, referenceCode);
      const ackRes = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [inquiry.email],
        replyTo: env.INQUIRY_RECIPIENT_EMAIL,
        subject: clientEmail.subject,
        html: clientEmail.html,
        text: clientEmail.text,
        tags: [
          { name: "category", value: "customer-acknowledgment" },
          { name: "reference", value: referenceCode },
        ],
      });

      if (!ackRes.error) {
        clientAckSent = true;
      }
    }

    return {
      businessEmailSent,
      clientAckSent,
      errorMessage,
    };
  } catch (err) {
    return {
      businessEmailSent,
      clientAckSent,
      errorMessage: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
