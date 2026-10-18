"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMarketplace } from "@/lib/store";
import { action } from "@/lib/api";
import { Button } from "./ui/button";
import { LoadingImage } from "./loading-image";

export function SellerRequest({ kind }: { kind: "QUOTE" | "ENQUIRY" }) {
  const { state, role, ready, refresh } = useMarketplace();
  const params = useSearchParams();
  const product = state.products.find(
    (item) => item.id === params.get("productId"),
  );
  const sellerId = product?.sellerId || params.get("sellerId") || "";
  const seller = state.sellers.find((item) => item.id === sellerId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const quote = kind === "QUOTE";
  if (!ready)
    return (
      <div className="ms-card">
        <div
          className="rx-image-shimmer rx-form-skeleton"
          role="status"
          aria-label="Loading request"
        />
      </div>
    );
  if (!seller)
    return (
      <div className="ms-card">
        <h1>Choose a supplier first</h1>
        <p>Open a product or supplier to send your request directly.</p>
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  if (sent)
    return (
      <section className="ms-card rx-request-success" role="status">
        <h1>{quote ? "Quote request sent" : "Enquiry sent"}</h1>
        <p>Your message was sent directly to {seller.company}.</p>
        <div className="rx-inline-actions">
          <Button asChild>
            <Link href="/buyer/enquiries">View quotes & enquiries</Link>
          </Button>
          <Link href={`/suppliers/${seller.id}`}>Back to supplier</Link>
        </div>
      </section>
    );
  return (
    <div className="rx-request-layout">
      <section className="ms-card">
        <span className="rx-section-label">DIRECT TO SUPPLIER</span>
        <h1>{quote ? "Request a quote" : "Send an enquiry"}</h1>
        <p>
          {quote
            ? "Ask for pricing, availability, and delivery for a specific product."
            : "Ask about the supplier, capabilities, customisation, or business terms."}
        </p>
        <div className="rx-direct-note">
          Only {seller.company} receives this{" "}
          {quote ? "quote request" : "enquiry"}.
        </div>
        {role !== "buyer" ? (
          <p>
            <Link
              href={`/login?next=${encodeURIComponent(`/buyer/${quote ? "quotes" : "enquiries"}/create?${params.toString()}`)}`}
            >
              Sign in with a buyer account to continue
            </Link>
          </p>
        ) : (
          <form
            className="ms-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const fields = new FormData(event.currentTarget);
              setBusy(true);
              setError("");
              try {
                await action("ENQUIRY_CREATE", undefined, {
                  kind,
                  sellerId: seller.id,
                  ...(quote
                    ? {
                        productId: String(fields.get("productId")),
                        quantity: Number(fields.get("quantity")),
                      }
                    : product
                      ? { productId: product.id }
                      : {}),
                  message: String(fields.get("message")),
                });
                await refresh();
                setSent(true);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {quote && (
              <div className="ms-form-grid">
                <label className="ms-field">
                  Product
                  <select
                    aria-label="Product"
                    name="productId"
                    defaultValue={product?.id || ""}
                    required
                    disabled={busy}
                  >
                    <option value="">Choose a product</option>
                    {state.products
                      .filter(
                        (item) =>
                          item.sellerId === seller.id &&
                          item.status === "Active",
                      )
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="ms-field">
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    step={1}
                    defaultValue={product?.moq || 1}
                    required
                    disabled={busy}
                  />
                </label>
              </div>
            )}
            <label className="ms-field">
              {quote ? "Quote details" : "Your question"}
              <textarea
                name="message"
                rows={5}
                minLength={10}
                maxLength={5000}
                required
                disabled={busy}
                placeholder={
                  quote
                    ? "Specifications, destination, delivery date, and any customisation..."
                    : "What would you like to know about this supplier?"
                }
              />
            </label>
            {error && (
              <p className="ms-error" role="alert">
                {error}
              </p>
            )}
            <Button disabled={busy}>
              {busy
                ? "Sending..."
                : quote
                  ? "Send quote request"
                  : "Send enquiry"}
            </Button>
          </form>
        )}
      </section>
      <aside className="ms-card rx-request-supplier">
        {product && (
          <div className="rx-request-product-image">
            <LoadingImage src={product.image} alt={product.name} />
          </div>
        )}
        <h2>{seller.company}</h2>
        <p>{seller.category}</p>
        <p>{seller.city}, India</p>
        {product && (
          <p>
            <strong>{product.name}</strong>
          </p>
        )}
        <hr />
        <h3>Looking for several suppliers?</h3>
        <p>
          Post a free requirement to connect with up to five relevant suppliers.
        </p>
        <Link href="/buyer/requirements/create">Post a requirement</Link>
      </aside>
    </div>
  );
}
