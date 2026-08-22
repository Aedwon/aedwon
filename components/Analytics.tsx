"use client";

import { useEffect } from "react";
import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import posthog from "posthog-js";

let posthogInitialized = false;

export default function Analytics() {
  const isProduction = process.env.NODE_ENV === "production";
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  useEffect(() => {
    if (!isProduction || !posthogKey || posthogInitialized) return;

    posthogInitialized = true;
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: { maskAllInputs: true },
    });
  }, [isProduction, posthogKey]);

  if (!isProduction) return null;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
      {clarityId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");`}
        </Script>
      )}
    </>
  );
}
