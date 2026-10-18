import { RoxodealLoader } from "@/components/roxodeal-loader";
import { Suspense } from "react";
import { PublicRoute } from "@/components/public-view";
import type { Metadata } from "next";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const response = await fetch(
      base + "/cms/" + encodeURIComponent(slug.join("/")),
      { cache: "no-store", signal: AbortSignal.timeout(3000) },
    );
    if (!response.ok) return { title: "Roxodeal" };
    const page = await response.json();
    return { title: page.title, description: page.seoDescription || undefined };
  } catch {
    return { title: "Roxodeal" };
  }
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<RoxodealLoader />}>
      <PublicRoute slug={slug} />
    </Suspense>
  );
}
