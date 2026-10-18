"use client";
import { api } from "@/lib/api";
import { RoxodealLoader } from "./roxodeal-loader";
import { AuthForm } from "./auth-form";
import { ContactPage, FeedbackPage } from "./community-pages";
import { ProductDetails, SupplierStorefront } from "./storefront";
import { ProgressiveProducts } from "./progressive-products";
import { appHref } from "@/lib/app-links";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, ArrowRight, Search, LockKeyhole } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { categories, type Role } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, ProductGrid, SupplierGrid } from "@/components/marketplace";
import { PageHeading } from "@/components/page-heading";
import { Empty } from "@/components/empty";
import { RequirementForm } from "@/components/requirement-form";
import { PublicShell } from "@/components/public-shell";
import { BuyerPlans as UsersPlans } from "./plans";
export function PublicView({ path }: { path: string[] }) {
  const { state, notify, setRole, ready } = useMarketplace();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [city, setCity] = useState("");
  const [verified, setVerified] = useState(false);
  const [max, setMax] = useState("");
  const [maxMoq, setMaxMoq] = useState("");
  const name = path[0];
  useEffect(() => {
    setQ(params.get("q") || "");
    setCategory(params.get("category") || "");
  }, [params]);
  useEffect(() => {
    if (path[1] && ["products", "suppliers"].includes(name))
      void api("/events/view", {
        method: "POST",
        body: JSON.stringify({
          kind: name === "products" ? "PRODUCT" : "SUPPLIER",
          id: path[1],
        }),
      }).catch(() => {});
  }, [name, path[1]]);
  const { data: products = [] } = useQuery({
    queryKey: [
      "catalogue",
      state.products,
      state.sellers,
      q,
      category,
      city,
      verified,
      max,
      maxMoq,
    ],
    queryFn: async () =>
      state.products.filter((p) => {
        const s = state.sellers.find((s) => s.id === p.sellerId);
        return (
          p.status === "Active" &&
          (!q ||
            (
              p.name +
              " " +
              p.category +
              " " +
              (p.subcategory || "") +
              " " +
              s?.company
            )
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!category || p.category === category) &&
          (!city ||
            ((s?.city || "") + " " + ((s as any)?.state || ""))
              .toLowerCase()
              .includes(city.toLowerCase())) &&
          (!verified || s?.kyc === "Approved") &&
          (!max || p.price <= Number(max)) &&
          (!maxMoq || p.moq <= Number(maxMoq))
        );
      }),
  });
  if (["login", "register", "reset-password"].includes(name))
    return <AuthForm register={name === "register"} />;
  if (name === "pricing")
    return (
      <>
        <PageHeading
          title="Plans for growing businesses"
          description="Monthly supplier plans. Pricing is configurable by the marketplace administrator."
        />
        <UsersPlans />
      </>
    );
  if (name === "suppliers") {
    if (path[1]) {
      const s = state.sellers.find((s) => s.id === path[1]);
      return !ready ? (
        <RoxodealLoader label="Loading supplier store..." />
      ) : s ? (
        <SupplierStorefront key={s.id} seller={s} />
      ) : (
        <Empty title="Supplier not found" />
      );
    }
    return (
      <>
        <PageHeading
          title="Find your next supplier"
          description="Explore manufacturers and business partners across India."
        />
        <SupplierGrid />
      </>
    );
  }
  if (name === "categories")
    return (
      <>
        <PageHeading
          title="Explore industry categories"
          description="Source products for every part of your business."
        />
        <div className="ms-category-grid">
          {categories.map((c, i) => (
            <Link
              href={"/products?category=" + encodeURIComponent(c)}
              className="ms-card ms-category-card"
              key={c}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{c}</h3>
              <p>
                Explore suppliers <ArrowRight size={15} />
              </p>
            </Link>
          ))}
        </div>
      </>
    );
  if (name === "search" || name === "products") {
    if (path[1]) {
      const p = state.products.find(
        (p) => p.id === path[1] && p.status === "Active",
      );
      const s = state.sellers.find((s) => s.id === p?.sellerId);
      return !ready ? (
        <RoxodealLoader label="Loading product details..." />
      ) : p ? (
        <ProductDetails key={p.id} product={p} seller={s} />
      ) : (
        <Empty title="Product not found" />
      );
    }
    return (
      <>
        <PageHeading
          title="Discover products & manufacturers"
          description="Source directly. Connect with relevant business suppliers."
        />
        <div className="ms-catalogue-layout">
          <aside className="ms-card ms-filters">
            <h3>Refine your search</h3>
            <label className="ms-field">
              Product or supplier
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
              />
            </label>
            <label className="ms-field">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="ms-field">
              City
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Any city"
              />
            </label>
            <label className="ms-field">
              Maximum price (₹)
              <input
                type="number"
                min="0"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </label>
            <label className="ms-field">
              Maximum MOQ
              <input
                type="number"
                min="1"
                value={maxMoq}
                onChange={(e) => setMaxMoq(e.target.value)}
              />
            </label>
            <label className="ms-checkbox">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              Verified suppliers only
            </label>
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setCategory("");
                setCity("");
                setMax("");
                setMaxMoq("");
                setVerified(false);
              }}
            >
              Clear filters
            </Button>
          </aside>
          <div>
            <p className="ms-results-count">
              {products.length} matching products
            </p>
            <ProgressiveProducts
              key={[q, category, city, verified, max, maxMoq].join("|")}
              products={products}
            />
          </div>
        </div>
      </>
    );
  }
  if (name === "contact") return <ContactPage />;
  if (name === "feedback" || name === "reviews")
    return <FeedbackPage publicView />;
  if (name === "post-requirement")
    return (
      <>
        <PageHeading title="Post a free requirement" />
        <div className="ms-card">
          <RequirementForm />
        </div>
      </>
    );
  if (name === "about" || name === "faq" || name === "how-it-works")
    return (
      <div className="ms-reading ms-card">
        <span className="eyebrow">ROXODEAL</span>
        <h1>
          {name === "about"
            ? "Business, connected."
            : name === "faq"
              ? "Frequently asked questions"
              : "From requirement to connection"}
        </h1>
        <p>{state.cms[name === "about" ? "about" : "faq"]}</p>
        <h2>How the marketplace works</h2>
        <ol>
          <li>Buyers post a purchase requirement for free.</li>
          <li>
            Relevant suppliers see the requirement with buyer contact locked.
          </li>
          <li>
            Up to five suppliers unlock the lead with a credit or verified
            payment.
          </li>
          <li>Buyers and suppliers negotiate the deal directly.</li>
        </ol>
        <Button asChild>
          <Link href={appHref("buyer", "/buyer/requirements/create")}>
            Post your requirement
          </Link>
        </Button>
      </div>
    );
  if (
    [
      "contact",
      "terms",
      "privacy",
      "refund-policy",
      "buyer-protection-policy",
      "claim-policy",
      "dispute-policy",
      "seller-agreement",
      "blog",
    ].includes(name)
  )
    return (
      <div className="ms-reading ms-card">
        <h1>
          {name
            .split("-")
            .map((s) => s[0].toUpperCase() + s.slice(1))
            .join(" ")}
        </h1>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {state.cms[name] ||
            "Content will be published by the marketplace administrator."}
        </p>
      </div>
    );
  if (state.cms[path.join("/")])
    return (
      <div className="ms-reading ms-card">
        <h1>{path.join(" ").replaceAll("-", " ")}</h1>
        <p style={{ whiteSpace: "pre-wrap" }}>{state.cms[path.join("/")]}</p>
      </div>
    );
  return (
    <Empty
      title="Page not found"
      description="Return to the marketplace to continue browsing."
    />
  );
}
export function PublicRoute({ slug }: { slug: string[] }) {
  return (
    <PublicShell>
      <PublicView path={slug} />
    </PublicShell>
  );
}
