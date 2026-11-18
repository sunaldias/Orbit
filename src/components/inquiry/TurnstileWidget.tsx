"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "dark" | "light" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
  resetSignal: number;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function TurnstileWidget({
  onVerify,
  onExpire,
  resetSignal,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire });

  callbacksRef.current = { onVerify, onExpire };

  useEffect(() => {
    if (!SITE_KEY) return;

    const mountWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: "light",
        callback: (token: string) => callbacksRef.current.onVerify(token),
        "expired-callback": () => callbacksRef.current.onExpire(),
        "error-callback": () => callbacksRef.current.onExpire(),
      });
    };

    if (window.turnstile) {
      mountWidget();
    } else {
      const scriptId = "cf-turnstile-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mountWidget);
      return () => {
        script?.removeEventListener("load", mountWidget);
      };
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!SITE_KEY) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#39A959]/25 bg-[#F1F9F5] px-4 py-3 text-xs text-[#38575D]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#074E5B]" aria-hidden="true" />
        <span>
          Protected by Cloudflare Turnstile &amp; Upstash rate limiting. Add{" "}
          <code className="font-semibold text-[#074E5B]">
            NEXT_PUBLIC_TURNSTILE_SITE_KEY
          </code>{" "}
          in production to activate the interactive challenge widget.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
}
