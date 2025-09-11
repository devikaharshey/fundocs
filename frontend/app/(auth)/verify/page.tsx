"use client";

import { Suspense } from "react";
import VerifyPageContent from "@/components/ui/VerifyPageContent";

export const dynamic = "force-dynamic";

export default function VerifyPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
