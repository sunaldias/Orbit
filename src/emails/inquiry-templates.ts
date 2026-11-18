import { getBudgetLabel, SITE_CONFIG } from "@/data/navigation";
import { getServiceName } from "@/data/services";
import { escapeHtml } from "@/lib/security";
import { formatEventDate } from "@/lib/utils";
import type { ValidatedInquiry } from "@/schemas/inquiry";

interface EmailPayload {
  subject: string;
  html: string;
  text: string;
}

/**
 * Builds the internal ORBIT business notification email sent to the configured business inbox.
 * Every user-supplied field is strictly HTML-escaped to prevent HTML/XSS injection.
 */
export function buildBusinessInquiryEmail(
  inquiry: ValidatedInquiry,
  referenceCode: string
): EmailPayload {
  const serviceNames = inquiry.selectedServices.map(getServiceName);
  const budgetLabel = getBudgetLabel(inquiry.budgetRange);
  const formattedDate = formatEventDate(inquiry.eventDate);

  const safeRef = escapeHtml(referenceCode);
  const safeName = escapeHtml(inquiry.fullName);
  const safeEmail = escapeHtml(inquiry.email);
  const safePhone = escapeHtml(inquiry.phone || "Not provided");
  const safeCompany = escapeHtml(inquiry.companyName || "Independent / Individual");
  const safeEvent = escapeHtml(inquiry.eventName);
  const safeLocation = escapeHtml(inquiry.eventLocation || "TBD / Not specified");
  const safeBudget = escapeHtml(budgetLabel);
  const safeDate = escapeHtml(formattedDate);
  const safeDetails = escapeHtml(inquiry.projectDetails).replace(/\n/g, "<br />");
  const safeRefLink = inquiry.referenceLink ? escapeHtml(inquiry.referenceLink) : null;

  const serviceBadgesHtml = serviceNames
    .map(
      (name) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border-radius:999px;background:#EDF5F4;border:1px solid #C6DFDC;color:#074E5B;font-size:12px;font-weight:600;">${escapeHtml(name)}</span>`
    )
    .join("");

  const referenceLinkRowHtml = safeRefLink
    ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Reference Link</td>
        <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;font-size:14px;word-break:break-all;">
          <a href="${safeRefLink}" style="color:#074E5B;font-weight:600;text-decoration:underline;">${safeRefLink}</a>
        </td>
      </tr>`
    : `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Reference Link</td>
        <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#6C848A;font-size:14px;">Not provided</td>
      </tr>`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Project Inquiry — ${safeRef}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F5F8F8;color:#08242B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F5F8F8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:#FFFFFF;border:1px solid #DCE7E7;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(105deg,#074E5B 0%,#1F836C 62%,#8ED828 100%);">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#D6F80B;font-weight:700;">
                  ORBIT STUDIO · NEW BOOKING INQUIRY
                </p>
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:#FFFFFF;font-weight:700;">
                  ${safeEvent}
                </h1>
                <p style="margin:10px 0 0;font-size:13px;color:#E8F4F2;">
                  Inquiry Reference: <strong style="color:#D6F80B;">${safeRef}</strong> · Status: <strong>Pending Review (Unconfirmed)</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px;">
                <h2 style="margin:0 0 12px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6C848A;">
                  Selected Services
                </h2>
                <div style="margin-bottom:24px;">
                  ${serviceBadgesHtml}
                </div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:24px;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;width:36%;">Full Name</td>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#08242B;font-size:14px;font-weight:600;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Email</td>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#074E5B;font-weight:600;text-decoration:none;">${safeEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Phone Number</td>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#08242B;font-size:14px;">${safePhone}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Organization</td>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#08242B;font-size:14px;">${safeCompany}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Event Date</td>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#08242B;font-size:14px;">${safeDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Event Location</td>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#08242B;font-size:14px;">${safeLocation}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#486369;font-size:13px;">Budget Range</td>
                    <td style="padding:10px 0;border-bottom:1px solid #E6EFEF;color:#1F836C;font-size:14px;font-weight:700;">${safeBudget}</td>
                  </tr>
                  ${referenceLinkRowHtml}
                </table>

                <h2 style="margin:0 0 10px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6C848A;">
                  Project Description
                </h2>
                <div style="padding:18px;border-radius:12px;background:#F5F8F8;border:1px solid #DCE7E7;color:#08242B;font-size:14px;line-height:1.65;">
                  ${safeDetails}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 32px;background:#F5F8F8;border-top:1px solid #DCE7E7;font-size:12px;color:#6C848A;">
                Saved securely in Supabase · Reply directly to this email to respond to ${safeName}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `ORBIT STUDIO — NEW BOOKING INQUIRY (${referenceCode})`,
    `Status: Pending Review (Not an automatically confirmed booking)`,
    `========================================================`,
    `Project Name:    ${inquiry.eventName}`,
    `Full Name:       ${inquiry.fullName}`,
    `Email:           ${inquiry.email}`,
    `Phone Number:    ${inquiry.phone || "Not provided"}`,
    `Organization:    ${inquiry.companyName || "Independent"}`,
    `Event Date:      ${formattedDate}`,
    `Event Location:  ${inquiry.eventLocation || "TBD"}`,
    `Budget Range:    ${budgetLabel}`,
    `Reference Link:  ${inquiry.referenceLink || "Not provided"}`,
    `Services:        ${serviceNames.join(", ")}`,
    ``,
    `Project Description:`,
    inquiry.projectDetails,
  ].join("\n");

  return {
    subject: `[ORBIT Inquiry ${referenceCode}] ${inquiry.eventName} — ${inquiry.fullName}`,
    html,
    text,
  };
}

/**
 * Builds the automated acknowledgment email sent to the customer.
 * Explicitly clarifies that submitting an inquiry is NOT an automatically confirmed booking.
 */
export function buildClientConfirmationEmail(
  inquiry: ValidatedInquiry,
  referenceCode: string
): EmailPayload {
  const serviceNames = inquiry.selectedServices.map(getServiceName);
  const formattedDate = formatEventDate(inquiry.eventDate);

  const safeName = escapeHtml(inquiry.fullName);
  const safeRef = escapeHtml(referenceCode);
  const safeEvent = escapeHtml(inquiry.eventName);
  const safeDate = escapeHtml(formattedDate);
  const safeLocation = escapeHtml(inquiry.eventLocation || "To be finalized");
  const safeServices = serviceNames.map(escapeHtml).join(" · ");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Inquiry Received — ${safeRef}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F5F8F8;color:#08242B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F5F8F8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #DCE7E7;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:30px 32px;background:linear-gradient(105deg,#074E5B 0%,#1F836C 62%,#8ED828 100%);">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#D6F80B;font-weight:700;">
                  ORBIT · EVERY DETAIL, INTENDED.
                </p>
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:#FFFFFF;">
                  We Received Your Project Inquiry
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;color:#2D484E;font-size:15px;line-height:1.65;">
                <p style="margin:0 0 16px;">Hi ${safeName},</p>
                <p style="margin:0 0 18px;">
                  Thank you for contacting <strong style="color:#08242B;">${escapeHtml(SITE_CONFIG.legalName)}</strong> about <strong style="color:#08242B;">${safeEvent}</strong>. Our production directors are reviewing your project brief and will respond within <strong style="color:#074E5B;">24 business hours</strong>.
                </p>

                <div style="padding:18px 20px;border-radius:12px;background:#F5F8F8;border:1px solid #DCE7E7;margin-bottom:20px;">
                  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6C848A;">
                    Inquiry Reference Code
                  </p>
                  <p style="margin:0 0 14px;font-size:20px;font-weight:700;color:#074E5B;">
                    ${safeRef}
                  </p>
                  <p style="margin:0 0 6px;font-size:13px;color:#486369;">
                    <strong style="color:#08242B;">Event Date:</strong> ${safeDate} &nbsp;|&nbsp;
                    <strong style="color:#08242B;">Location:</strong> ${safeLocation}
                  </p>
                  <p style="margin:0;font-size:13px;color:#486369;">
                    <strong style="color:#08242B;">Services:</strong> ${safeServices}
                  </p>
                </div>

                <div style="padding:14px 16px;border-radius:12px;background:#F1F9F5;border:1px solid #C2E5D0;margin-bottom:18px;font-size:13px;color:#2A4B42;">
                  <strong>Please note:</strong> Submitting an inquiry does not automatically constitute a confirmed booking or date reservation. Availability, scope, and production schedules are confirmed only after our team reviews your brief and issues a written proposal and agreement.
                </div>

                <p style="margin:0;font-size:13px;color:#6C848A;">
                  Have extra moodboards, schedules, or decks to share? Simply reply to this email with your reference code.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#F5F8F8;border-top:1px solid #DCE7E7;font-size:12px;color:#6C848A;">
                ${escapeHtml(SITE_CONFIG.legalName)} · Every Detail, Intended.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hi ${inquiry.fullName},`,
    ``,
    `Thank you for contacting ${SITE_CONFIG.legalName} regarding "${inquiry.eventName}".`,
    `Our production directors are reviewing your project brief and will reply within 24 business hours.`,
    ``,
    `Inquiry Reference: ${referenceCode}`,
    `Event Date:        ${formattedDate}`,
    `Location:          ${inquiry.eventLocation || "To be finalized"}`,
    `Services:          ${serviceNames.join(", ")}`,
    ``,
    `IMPORTANT: Submitting an inquiry does not automatically constitute a confirmed booking or date reservation. Production dates and deliverables are finalized only after our team reviews availability and issues a written agreement.`,
    ``,
    `— ${SITE_CONFIG.legalName} · Every Detail, Intended.`,
  ].join("\n");

  return {
    subject: `ORBIT Inquiry Received (${referenceCode}) — Pending Review`,
    html,
    text,
  };
}
