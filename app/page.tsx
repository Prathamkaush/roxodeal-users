import { RoxodealLoader } from "@/components/roxodeal-loader";
import { Home } from "@/components/home";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<RoxodealLoader />}>
      <Home />
    </Suspense>
  );
}
