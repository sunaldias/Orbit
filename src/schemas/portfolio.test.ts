import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getCloudinaryImageUrl,
  getCloudinaryVideoUrl,
  isTrustedCloudinaryUrl,
} from "../lib/cloudinary.ts";
import {
  isValidPortfolioCategory,
  PORTFOLIO_CATEGORIES,
  portfolioProjectSchema,
  toSeoSlug,
} from "./portfolio.ts";

describe("Dynamic portfolio categories, schema & Cloudinary URL resolution", () => {
  it("defines the 5 canonical portfolio categories", () => {
    const labels = PORTFOLIO_CATEGORIES.map((c) => c.label);
    assert.deepEqual(labels, [
      "Videography",
      "Photography",
      "Graphic Design",
      "Motion Graphics",
      "Event Experiences",
    ]);
    assert.equal(isValidPortfolioCategory("motion-graphics"), true);
    assert.equal(isValidPortfolioCategory("unknown-category"), false);
  });

  it("generates SEO-friendly lowercase kebab-case slugs", () => {
    assert.equal(
      toSeoSlug("SOLARIS — Mainstage Visual World 2026!"),
      "solaris-mainstage-visual-world-2026"
    );
  });

  it("validates a complete portfolio item record", () => {
    const result = portfolioProjectSchema.safeParse({
      id: "orb-proj-100",
      slug: "neon-horizon-festival",
      title: "Neon Horizon Festival",
      category: "videography",
      description: "Multi-cam 6K cinema event coverage and aftermovie.",
      thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/orbit/cover.jpg",
      mediaUrl: "https://res.cloudinary.com/demo/video/upload/v1/orbit/reel.mp4",
      primaryMediaType: "video",
      aspectRatio: "wide",
      projectDate: "2026-10-12",
      isFeatured: true,
    });
    assert.equal(result.success, true);
  });

  it("trusts only HTTPS res.cloudinary.com/upload URLs and injects optimization transforms", () => {
    const validImg = "https://res.cloudinary.com/demo/image/upload/v123/orbit/stage.jpg";
    const validVid = "https://res.cloudinary.com/demo/video/upload/v123/orbit/reel.mp4";
    const untrusted = "https://evil.example.com/image/upload/payload.jpg";

    assert.equal(isTrustedCloudinaryUrl(validImg), true);
    assert.equal(isTrustedCloudinaryUrl(untrusted), false);

    const optimizedImg = getCloudinaryImageUrl(validImg, { width: 1200 });
    assert.equal(
      optimizedImg,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,dpr_auto,w_1200/v123/orbit/stage.jpg"
    );

    const optimizedVid = getCloudinaryVideoUrl(validVid, { width: 1280 });
    assert.equal(
      optimizedVid,
      "https://res.cloudinary.com/demo/video/upload/f_auto:video,q_auto,w_1280,c_limit/v123/orbit/reel.mp4"
    );
  });
});
