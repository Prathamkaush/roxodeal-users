import { RoxodealLoader } from "@/components/roxodeal-loader";
import { PanelShell } from "@/components/panel-shell";
import { Suspense } from "react";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RoxodealLoader />}>
      <PanelShell role="buyer">{children}</PanelShell>
    </Suspense>
  );
}
