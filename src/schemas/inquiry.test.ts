import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  inquirySchema,
  isSafeHttpUrl,
  sanitizeMultiLine,
  sanitizeSingleLine,
} from "./inquiry.ts";

describe("Inquiry validation & sanitization", () => {
  const validPayload = {
    fullName: "Alex Rivera",
    email: "Alex.Rivera@SolarisLive.com",
    phone: "+1 (555) 019-2834",
    companyName: "Solaris Live",
    selectedServices: ["event-videography", "motion-flyers", "event-videography"],
    eventName: "Solaris Electronic Festival 2026",
    eventDate: "2026-09-12",
    eventLocation: "Berlin, Germany",
    budgetRange: "15k-35k",
    projectDetails:
      "We need multi-cam 6K coverage, daily vertical reels, and 3D motion flyers for our flagship festival.",
    referenceLink: "https://vimeo.com/123456789",
    idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
  };

  it("accepts valid inquiry with reference link, normalizes email, and deduplicates services", () => {
    const res = inquirySchema.safeParse(validPayload);
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.email, "alex.rivera@solarislive.com");
      assert.equal(res.data.referenceLink, "https://vimeo.com/123456789");
      assert.deepEqual(res.data.selectedServices, [
        "event-videography",
        "motion-flyers",
      ]);
    }
  });

  it("strips CRLF header injection characters from single-line fields", () => {
    const cleaned = sanitizeSingleLine("Alice\r\nBcc: attacker@evil.com\t");
    assert.equal(cleaned, "Alice Bcc: attacker@evil.com");
    assert.equal(/[\r\n]/.test(cleaned), false);
  });

  it("preserves intentional newlines while stripping control chars in multi-line text", () => {
    const cleaned = sanitizeMultiLine("Line 1\r\nLine 2\u0000\u0007");
    assert.equal(cleaned, "Line 1\nLine 2");
  });

  it("blocks unsafe javascript: and data: URLs in referenceLink", () => {
    assert.equal(isSafeHttpUrl("https://drive.google.com/file/d/abc"), true);
    assert.equal(isSafeHttpUrl("javascript:alert(1)"), false);
    assert.equal(isSafeHttpUrl("data:text/html,<script>alert(1)</script>"), false);

    const res = inquirySchema.safeParse({
      ...validPayload,
      referenceLink: "javascript:alert(1)",
    });
    assert.equal(res.success, false);
  });

  it("rejects malformed phone numbers with too few digits or invalid symbols", () => {
    const res = inquirySchema.safeParse({
      ...validPayload,
      phone: "123-abc",
    });
    assert.equal(res.success, false);
  });

  it("rejects unknown service slugs and invalid budget values", () => {
    const res = inquirySchema.safeParse({
      ...validPayload,
      selectedServices: ["non-existent-service"],
      budgetRange: "free",
    });
    assert.equal(res.success, false);
  });

  it("rejects overly short project briefs and malformed dates", () => {
    const res = inquirySchema.safeParse({
      ...validPayload,
      eventDate: "12/09/2026",
      projectDetails: "Too short",
    });
    assert.equal(res.success, false);
  });
});
