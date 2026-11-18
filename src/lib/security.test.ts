import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeInquiryFingerprint,
  escapeHtml,
  extractClientIp,
  generateReferenceCode,
  hasDangerousKeys,
  hashIp,
  isAllowedOrigin,
  readBoundedJsonBody,
  safeCompareSecret,
  serializeJsonLd,
} from "./security.ts";

describe("Security utilities", () => {
  it("escapes HTML injection payloads safely", () => {
    const malicious = `<script>alert("xss")</script> & 'quote'`;
    assert.equal(
      escapeHtml(malicious),
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;quote&#39;"
    );
  });

  it("prevents </script> breakout XSS in JSON-LD serialization", () => {
    const serialized = serializeJsonLd({
      name: "</script><script>alert('xss')</script>",
    });
    assert.equal(serialized.includes("</script>"), false);
    assert.equal(serialized.includes("\\u003c/script\\u003e"), true);
  });

  it("compares secrets in constant time without false positives", () => {
    assert.equal(safeCompareSecret("super-secret-value", "super-secret-value"), true);
    assert.equal(safeCompareSecret("super-secret-value", "super-secret-valu"), false);
    assert.equal(safeCompareSecret("", "super-secret-value"), false);
  });

  it("hashes client IP deterministically with salt without exposing raw IP", () => {
    const ip = "203.0.113.42";
    const digest = hashIp(ip, "test-secret-salt");
    assert.equal(digest.length, 32);
    assert.equal(digest.includes("203"), false);
    assert.equal(digest, hashIp(ip, "test-secret-salt"));
    assert.notEqual(digest, hashIp(ip, "different-salt"));
  });

  it("computes deterministic inquiry fingerprints regardless of service order or case", () => {
    const fp1 = computeInquiryFingerprint(
      {
        email: "Alex@Example.com",
        eventName: "Solaris Festival",
        selectedServices: ["motion-flyers", "event-videography"],
        eventDate: "2026-09-12",
        projectDetails: "Full cinema coverage and motion flyers.",
      },
      "salt-1"
    );
    const fp2 = computeInquiryFingerprint(
      {
        email: "alex@example.com ",
        eventName: "solaris festival",
        selectedServices: ["event-videography", "motion-flyers"],
        eventDate: "2026-09-12",
        projectDetails: "Full  cinema coverage   and motion flyers.",
      },
      "salt-1"
    );
    assert.equal(fp1, fp2);
    assert.equal(fp1.length, 40);
  });

  it("extracts first IP from x-forwarded-for chain", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.7, 10.0.0.1",
    });
    assert.equal(extractClientIp(headers), "198.51.100.7");
  });

  it("generates reference codes matching ORB-YYYY-XXXXXX", () => {
    const ref = generateReferenceCode();
    assert.match(ref, /^ORB-\d{4}-[A-Z2-9]{6}$/);
  });

  it("blocks mismatched cross-origin and Sec-Fetch-Site cross-site requests", () => {
    const badOrigin = new Headers({
      origin: "https://evil.example",
      host: "orbit.agency",
    });
    assert.equal(isAllowedOrigin(badOrigin, "https://orbit.agency"), false);

    const badFetchSite = new Headers({
      origin: "https://orbit.agency",
      host: "orbit.agency",
      "sec-fetch-site": "cross-site",
    });
    assert.equal(isAllowedOrigin(badFetchSite, "https://orbit.agency"), false);

    const goodHeaders = new Headers({
      origin: "https://orbit.agency",
      host: "orbit.agency",
      "sec-fetch-site": "same-origin",
    });
    assert.equal(isAllowedOrigin(goodHeaders, "https://orbit.agency"), true);
  });

  it("detects prototype pollution keys and enforces streaming byte limits", async () => {
    assert.equal(
      hasDangerousKeys(JSON.parse('{"__proto__":{"polluted":true}}')),
      true
    );
    assert.equal(hasDangerousKeys({ safe: { nested: "ok" } }), false);

    const oversizedReq = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: "a".repeat(2000) }),
    });
    const oversizedRes = await readBoundedJsonBody(oversizedReq, 512);
    assert.equal(oversizedRes.ok, false);
    if (!oversizedRes.ok) {
      assert.equal(oversizedRes.status, 413);
    }

    const pollutedReq = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"__proto__":{"admin":true}}',
    });
    const pollutedRes = await readBoundedJsonBody(pollutedReq, 1024);
    assert.equal(pollutedRes.ok, false);
    if (!pollutedRes.ok) {
      assert.equal(pollutedRes.status, 400);
    }
  });
});
