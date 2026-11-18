"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Info,
  Link2,
  Loader2,
  MailCheck,
  Send,
  ShieldCheck,
} from "lucide-react";
import { TurnstileWidget } from "@/components/inquiry/TurnstileWidget";
import { Button } from "@/components/ui/Button";
import { BUDGET_RANGES } from "@/data/navigation";
import { SERVICE_SLUGS, SERVICES } from "@/data/services";
import { cn } from "@/lib/utils";
import { inquirySchema } from "@/schemas/inquiry";

type FieldErrors = Partial<Record<string, string[]>>;

interface SubmissionReceipt {
  referenceCode: string;
  message: string;
  eventName: string;
  email: string;
  acknowledgmentSent: boolean;
}

interface FailureBanner {
  title: string;
  detail: string;
  code?: string;
}

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  selectedServices: [] as string[],
  eventName: "",
  eventDate: "",
  eventLocation: "",
  budgetRange: "",
  projectDetails: "",
  referenceLink: "",
  websiteHoneypot: "",
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `orb_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
}

export function InquiryForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialFormState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<FailureBanner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);

  // Persistent idempotency key per distinct inquiry attempt (blocks double-click/retry duplicates)
  const idempotencyKeyRef = useRef<string>(createIdempotencyKey());
  const inFlightRef = useRef<boolean>(false);

  useEffect(() => {
    const preselected = searchParams.get("service");
    if (
      preselected &&
      (SERVICE_SLUGS as readonly string[]).includes(preselected)
    ) {
      setForm((prev) =>
        prev.selectedServices.includes(preselected)
          ? prev
          : { ...prev, selectedServices: [...prev.selectedServices, preselected] }
      );
    }
  }, [searchParams]);

  const toggleService = (slug: string) => {
    setForm((prev) => {
      const exists = prev.selectedServices.includes(slug);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((s) => s !== slug)
          : [...prev.selectedServices, slug],
      };
    });
    if (fieldErrors.selectedServices) {
      setFieldErrors((prev) => ({ ...prev, selectedServices: undefined }));
    }
  };

  const updateField = (name: keyof typeof initialFormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleResetForNewInquiry = () => {
    idempotencyKeyRef.current = createIdempotencyKey();
    setReceipt(null);
    setFailure(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || submitting) return;

    setFailure(null);

    const payload = {
      ...form,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "/booking",
      idempotencyKey: idempotencyKeyRef.current,
      turnstileToken,
    };

    // 1. Client-side validation using the exact same Zod schema as the server
    const clientCheck = inquirySchema.safeParse(payload);
    if (!clientCheck.success) {
      setFieldErrors(clientCheck.error.flatten().fieldErrors);
      setFailure({
        title: "Please review your inquiry details",
        detail: "One or more fields need attention before we can send your brief.",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    setFieldErrors({});
    inFlightRef.current = true;
    setSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        code?: string;
        referenceCode?: string;
        acknowledgmentSent?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok || !data.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);

        const titleByCode: Record<string, string> = {
          DUPLICATE_INQUIRY: "Duplicate Inquiry Prevented",
          RATE_LIMITED: "Submission Limit Reached",
          TURNSTILE_FAILED: "Security Verification Required",
          VALIDATION_ERROR: "Please Check Highlighted Fields",
        };

        setFailure({
          title:
            (data.code && titleByCode[data.code]) ||
            "Unable to Submit Inquiry",
          detail:
            data.error ||
            "Something went wrong while sending your project inquiry. Please try again.",
          code: data.code,
        });

        setTurnstileToken("");
        setTurnstileReset((n) => n + 1);
        return;
      }

      setReceipt({
        referenceCode: data.referenceCode || "ORB-LOGGED",
        message:
          data.message ||
          "Your project inquiry has been logged for director review.",
        eventName: form.eventName,
        email: form.email,
        acknowledgmentSent: Boolean(data.acknowledgmentSent),
      });

      setForm(initialFormState);
      setTurnstileToken("");
      idempotencyKeyRef.current = createIdempotencyKey();
    } catch {
      setFailure({
        title: "Connection Interrupted",
        detail:
          "Network error while submitting your inquiry. Please verify your internet connection and retry.",
        code: "NETWORK_ERROR",
      });
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-3xl border border-[#39A959]/45 bg-white p-8 shadow-sm sm:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6F80B] text-[#072B33]">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#074E5B]/20 bg-[#EDF5F4] px-3.5 py-1.5 font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-wider text-[#074E5B] uppercase">
            <Clock className="h-3.5 w-3.5 text-[#39A959]" aria-hidden="true" />
            Pending Director Review · Not Yet Confirmed
          </span>
        </div>

        <h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold text-[#08242B]">
          Project Inquiry Received
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[#486369]">
          {receipt.message}
        </p>

        <div className="mt-7 grid gap-4 rounded-2xl border border-[#074E5B]/12 bg-[#F5F8F8] p-5 sm:grid-cols-2">
          <div>
            <span className="font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-[0.18em] text-[#6C848A] uppercase">
              Inquiry Reference Code
            </span>
            <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold text-[#074E5B]">
              {receipt.referenceCode}
            </p>
          </div>
          <div>
            <span className="font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-[0.18em] text-[#6C848A] uppercase">
              Project / Event Name
            </span>
            <p className="mt-1 text-base font-semibold text-[#08242B]">
              {receipt.eventName}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#39A959]/30 bg-[#F1F9F5] p-4 text-xs leading-relaxed text-[#2A4B42]">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#074E5B]" aria-hidden="true" />
          <p>
            {receipt.acknowledgmentSent ? (
              <>
                An acknowledgment email has been dispatched to{" "}
                <strong className="font-semibold text-[#08242B]">{receipt.email}</strong>.
              </>
            ) : (
              <>
                Your inquiry is safely saved under{" "}
                <strong className="font-semibold text-[#08242B]">{receipt.referenceCode}</strong>.
              </>
            )}{" "}
            <strong className="font-semibold text-[#08242B]">
              Important:
            </strong>{" "}
            Submitting an inquiry does not automatically reserve dates or create a confirmed booking. Our producers will review availability and reply with a tailored proposal.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleResetForNewInquiry}
          >
            Submit Another Inquiry
          </Button>
          <Button href="/portfolio" variant="outline">
            Browse Portfolio
          </Button>
        </div>
      </div>
    );
  }

  const inputBase =
    "mt-2 w-full rounded-2xl border border-[#074E5B]/15 bg-[#F7FAFA] px-4 py-3 text-sm text-[#08242B] placeholder:text-[#849AA0] transition-colors focus:border-[#074E5B] focus:bg-white focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8 rounded-3xl border border-[#074E5B]/12 bg-white p-6 shadow-[0_18px_46px_-30px_rgba(7,78,91,0.2)] sm:p-9"
    >
      {/* Hidden Honeypot Field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="websiteHoneypot">Leave this field empty</label>
        <input
          id="websiteHoneypot"
          name="websiteHoneypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.websiteHoneypot}
          onChange={(e) => updateField("websiteHoneypot", e.target.value)}
        />
      </div>

      {/* Step 1: Service Selection */}
      <fieldset>
        <legend className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
          01 / Service Selection *
        </legend>
        <p className="mt-1.5 text-sm text-[#486369]">
          Choose one or more creative services required for your project.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {SERVICES.map((service) => {
            const active = form.selectedServices.includes(service.slug);
            return (
              <button
                key={service.slug}
                type="button"
                aria-pressed={active}
                onClick={() => toggleService(service.slug)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer",
                  active
                    ? "border-[#074E5B] bg-[#074E5B] text-white font-semibold shadow-sm"
                    : "border-[#074E5B]/15 bg-[#F5F8F8] text-[#08242B] hover:border-[#39A959] hover:bg-white"
                )}
              >
                {active && (
                  <Check className="h-3.5 w-3.5 text-[#D6F80B]" aria-hidden="true" />
                )}
                {service.name}
              </button>
            );
          })}
        </div>

        {fieldErrors.selectedServices?.[0] && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {fieldErrors.selectedServices[0]}
          </p>
        )}
      </fieldset>

      {/* Step 2: Client Contact Details */}
      <div className="border-t border-[#074E5B]/10 pt-7">
        <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
          02 / Your Contact Information
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-[#08242B]">
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Alex Rivera"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.fullName)}
              className={cn(inputBase, fieldErrors.fullName && "border-rose-500")}
            />
            {fieldErrors.fullName?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.fullName[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#08242B]">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="alex@company.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className={cn(inputBase, fieldErrors.email && "border-rose-500")}
            />
            {fieldErrors.email?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-[#08242B]">
              Phone Number <span className="font-normal text-[#6C848A]">(Optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 234-5678"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
              className={cn(inputBase, fieldErrors.phone && "border-rose-500")}
            />
            {fieldErrors.phone?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.phone[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="companyName" className="block text-xs font-semibold text-[#08242B]">
              Organization <span className="font-normal text-[#6C848A]">(Optional)</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Solaris Live Productions"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.companyName)}
              className={cn(inputBase, fieldErrors.companyName && "border-rose-500")}
            />
            {fieldErrors.companyName?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.companyName[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step 3: Project & Event Details */}
      <div className="border-t border-[#074E5B]/10 pt-7">
        <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
          03 / Project &amp; Event Details
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="eventName" className="block text-xs font-semibold text-[#08242B]">
              Project Name *
            </label>
            <input
              id="eventName"
              name="eventName"
              type="text"
              required
              placeholder="Apex Music & Tech Festival 2026"
              value={form.eventName}
              onChange={(e) => updateField("eventName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.eventName)}
              className={cn(inputBase, fieldErrors.eventName && "border-rose-500")}
            />
            {fieldErrors.eventName?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.eventName[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="budgetRange" className="block text-xs font-semibold text-[#08242B]">
              Budget Range *
            </label>
            <select
              id="budgetRange"
              name="budgetRange"
              required
              value={form.budgetRange}
              onChange={(e) => updateField("budgetRange", e.target.value)}
              aria-invalid={Boolean(fieldErrors.budgetRange)}
              className={cn(
                inputBase,
                !form.budgetRange && "text-[#849AA0]",
                fieldErrors.budgetRange && "border-rose-500"
              )}
            >
              <option value="" disabled>
                Select an estimated budget range
              </option>
              {BUDGET_RANGES.map((b) => (
                <option key={b.value} value={b.value} className="bg-white text-[#08242B]">
                  {b.label}
                </option>
              ))}
            </select>
            {fieldErrors.budgetRange?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.budgetRange[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="eventDate" className="block text-xs font-semibold text-[#08242B]">
              Event Date <span className="font-normal text-[#6C848A]">(Optional)</span>
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              value={form.eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
              aria-invalid={Boolean(fieldErrors.eventDate)}
              className={cn(inputBase, fieldErrors.eventDate && "border-rose-500")}
            />
            {fieldErrors.eventDate?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.eventDate[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="eventLocation" className="block text-xs font-semibold text-[#08242B]">
              Event Location <span className="font-normal text-[#6C848A]">(Optional)</span>
            </label>
            <input
              id="eventLocation"
              name="eventLocation"
              type="text"
              placeholder="London · Printworks / Worldwide"
              value={form.eventLocation}
              onChange={(e) => updateField("eventLocation", e.target.value)}
              aria-invalid={Boolean(fieldErrors.eventLocation)}
              className={cn(inputBase, fieldErrors.eventLocation && "border-rose-500")}
            />
            {fieldErrors.eventLocation?.[0] && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldErrors.eventLocation[0]}
              </p>
            )}
          </div>
        </div>

        {/* Reference Link */}
        <div className="mt-5">
          <label htmlFor="referenceLink" className="block text-xs font-semibold text-[#08242B]">
            Reference Link{" "}
            <span className="font-normal text-[#6C848A]">
              (Optional — moodboard, Vimeo, Drive, or past event URL)
            </span>
          </label>
          <div className="relative">
            <Link2
              className="pointer-events-none absolute left-4 top-[56%] h-4 w-4 -translate-y-1/2 text-[#6C848A]"
              aria-hidden="true"
            />
            <input
              id="referenceLink"
              name="referenceLink"
              type="url"
              inputMode="url"
              placeholder="https://vimeo.com/... or https://drive.google.com/..."
              value={form.referenceLink}
              onChange={(e) => updateField("referenceLink", e.target.value)}
              aria-invalid={Boolean(fieldErrors.referenceLink)}
              className={cn(
                inputBase,
                "pl-11",
                fieldErrors.referenceLink && "border-rose-500"
              )}
            />
          </div>
          {fieldErrors.referenceLink?.[0] && (
            <p role="alert" className="mt-1.5 text-xs text-rose-600">
              {fieldErrors.referenceLink[0]}
            </p>
          )}
        </div>

        {/* Project Description */}
        <div className="mt-5">
          <label htmlFor="projectDetails" className="block text-xs font-semibold text-[#08242B]">
            Project Description *
          </label>
          <textarea
            id="projectDetails"
            name="projectDetails"
            required
            rows={5}
            placeholder="Describe your event scale, venue lighting, target deliverables, visual mood, and key campaign deadlines..."
            value={form.projectDetails}
            onChange={(e) => updateField("projectDetails", e.target.value)}
            aria-invalid={Boolean(fieldErrors.projectDetails)}
            className={cn(
              inputBase,
              "resize-y",
              fieldErrors.projectDetails && "border-rose-500"
            )}
          />
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6C848A]">
            <span>
              {fieldErrors.projectDetails?.[0] ? (
                <span role="alert" className="font-medium text-rose-600">
                  {fieldErrors.projectDetails[0]}
                </span>
              ) : (
                "Include audience size, deliverables, or turnaround needs if known."
              )}
            </span>
            <span className="font-[family-name:var(--font-tagline)]">
              {form.projectDetails.length}/3000
            </span>
          </div>
        </div>
      </div>

      {/* Step 4: Anti-Bot Check, Non-Binding Inquiry Notice & Submit */}
      <div className="space-y-5 border-t border-[#074E5B]/10 pt-7">
        <TurnstileWidget
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
          resetSignal={turnstileReset}
        />

        {/* Clear Non-Binding Inquiry Notice */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#074E5B]/12 bg-[#F5F8F8] px-4 py-3 text-xs leading-relaxed text-[#486369]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#074E5B]" aria-hidden="true" />
          <p>
            Submitting this form logs a <strong className="text-[#08242B]">project inquiry</strong> for review and does{" "}
            <strong className="text-[#08242B]">not automatically confirm a booking</strong> or require online payment. Dates are locked only after written approval.
          </p>
        </div>

        {/* Distinct Failure / Duplicate / Rate-Limit Alert */}
        {failure && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3.5 text-sm text-rose-900"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-rose-900">{failure.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-rose-800">
                {failure.detail}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="inline-flex items-center gap-2 text-xs text-[#486369]">
            <ShieldCheck className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
            Protected against spam &amp; duplicate submissions
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting Inquiry...
              </>
            ) : (
              <>
                Submit Booking Inquiry
                <Send className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
