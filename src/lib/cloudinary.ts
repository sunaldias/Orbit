const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

export function hasLiveCloudinary(): boolean {
  return Boolean(CLOUD_NAME && CLOUD_NAME !== "your-cloudinary-cloud-name");
}

function sanitizePublicId(publicId: string): string {
  return publicId.replace(/^\/+/, "").replace(/[^a-zA-Z0-9/._-]/g, "");
}

/**
 * Checks whether a value is an explicit trusted Cloudinary HTTPS URL.
 * Rejects non-Cloudinary hosts to preserve strict CSP and prevent SSRF/tracking leaks.
 */
export function isTrustedCloudinaryUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.includes("/upload/")
    );
  } catch {
    return false;
  }
}

/**
 * Injects Cloudinary delivery transforms into an existing https://res.cloudinary.com/.../upload/... URL
 * if transforms aren't already applied.
 */
function injectCloudinaryTransforms(url: string, transforms: string[]): string {
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const prefix = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);

  // If URL already includes f_auto/q_auto transforms, keep author-defined transforms intact
  if (/^(f_|q_|w_|h_|c_|dpr_)/.test(rest)) {
    return url;
  }

  return `${prefix}${transforms.join(",")}/${rest}`;
}

/**
 * Resolves an optimized Cloudinary image URL (`f_auto,q_auto,dpr_auto`) from either:
 * 1. A full `https://res.cloudinary.com/...` URL (works even without NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
 * 2. A Cloudinary `public_id` (requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
 */
export function getCloudinaryImageUrl(
  source: string,
  options?: { width?: number; height?: number; crop?: "fill" | "limit" }
): string | null {
  if (!source) return null;

  const transforms = ["f_auto", "q_auto", "dpr_auto"];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);

  if (isTrustedCloudinaryUrl(source)) {
    return injectCloudinaryTransforms(source, transforms);
  }

  if (!hasLiveCloudinary()) return null;

  const cleanId = sanitizePublicId(source);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${cleanId}`;
}

/**
 * Resolves an optimized Cloudinary video URL (`f_auto,q_auto`) from either
 * a full Cloudinary video URL or a Cloudinary `public_id`.
 */
export function getCloudinaryVideoUrl(
  source: string,
  options?: { width?: number }
): string | null {
  if (!source) return null;

  const transforms = ["f_auto:video", "q_auto"];
  if (options?.width) transforms.push(`w_${options.width}`, "c_limit");

  if (isTrustedCloudinaryUrl(source)) {
    return injectCloudinaryTransforms(source, transforms);
  }

  if (!hasLiveCloudinary()) return null;

  const cleanId = sanitizePublicId(source).replace(/\.(mp4|webm|mov)$/i, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transforms.join(",")}/${cleanId}.mp4`;
}

/**
 * Resolves a frame-0 JPEG poster image URL for a Cloudinary video asset.
 */
export function getCloudinaryVideoPosterUrl(
  source: string,
  width = 1400
): string | null {
  if (!source) return null;

  if (isTrustedCloudinaryUrl(source) && source.includes("/video/upload/")) {
    const withTransforms = injectCloudinaryTransforms(source, [
      "so_0",
      "f_auto",
      "q_auto",
      `w_${width}`,
    ]);
    return withTransforms.replace(/\.(mp4|webm|mov)$/i, ".jpg");
  }

  if (!hasLiveCloudinary()) return null;

  const cleanId = sanitizePublicId(source).replace(/\.(mp4|webm|mov)$/i, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,f_auto,q_auto,w_${width}/${cleanId}.jpg`;
}

/**
 * Generates a 1200x630 Open Graph social card image URL via Cloudinary.
 */
export function getCloudinaryOgImageUrl(source: string): string | null {
  return getCloudinaryImageUrl(source, {
    width: 1200,
    height: 630,
    crop: "fill",
  });
}
