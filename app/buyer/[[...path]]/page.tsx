import { RoxodealLoader } from "@/components/roxodeal-loader";
import { Suspense } from "react";
import { BuyerPanel } from "@/components/panel";
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  return (
    <Suspense fallback={<RoxodealLoader />}>
      <BuyerPanel path={path} />
    </Suspense>
  );
}
