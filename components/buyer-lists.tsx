"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/data";
import { action } from "@/lib/api";
import { useMarketplace } from "@/lib/store";
import { money } from "@/lib/utils";
import { RecordList } from "./list-tools";
import { Button } from "./ui/button";
import { Badge } from "./marketplace";
import { LoadingImage } from "./loading-image";
import { PageHeading } from "./page-heading";

export function RequirementActions({ lead }: { lead: Lead }) {
  const { refresh } = useMarketplace();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const run = async (deleting: boolean, status?: string) => {
    if (
      deleting &&
      !window.confirm(
        "Delete this requirement? It will be removed from your list and no new suppliers can unlock it. Existing transaction records are retained.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await action(
        deleting ? "BUYER_LEAD_DELETE" : "BUYER_LEAD_STATUS",
        lead.id,
        status ? { status } : {},
      );
      await refresh();
      if (deleting) router.push("/buyer/requirements");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="rx-requirement-actions">
      <label className="ms-field">
        <span className="rx-sr-only">Update status for {lead.title}</span>
        <select
          aria-label={`Update status for ${lead.title}`}
          value=""
          disabled={busy}
          onChange={(event) => {
            const value = event.target.value;
            if (value) void run(false, value);
          }}
        >
          <option value="">Update status</option>
          <option value="Closed">Closed — no longer sourcing</option>
          <option value="Fully Sold">Fully sold — requirement fulfilled</option>
        </select>
      </label>
      <Button
        size="sm"
        variant="destructive"
        disabled={busy}
        onClick={() => void run(true)}
      >
        Delete requirement
      </Button>
      {error && (
        <p className="ms-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function BuyerEnquiries() {
  const { state, ready } = useMarketplace();
  return (
    <>
      <PageHeading
        title="Quotes & enquiries"
        description="Direct conversations with the suppliers you selected."
      />
      <RecordList
        label="Quotes and enquiries"
        items={state.enquiries}
        loading={!ready}
        columns={7}
        searchText={(item) =>
          [
            item.seller.company,
            item.message,
            item.response,
            state.products.find((product) => product.id === item.productId)
              ?.name,
          ].join(" ")
        }
        filters={[
          {
            label: "Type",
            value: (item) =>
              item.kind === "QUOTE" ? "Quote request" : "Business enquiry",
          },
          {
            label: "Response",
            value: (item) => (item.response ? "Replied" : "Awaiting reply"),
          },
          { label: "Supplier", value: (item) => item.seller.company },
        ]}
      >
        {(rows) => (
          <table className="ms-table rx-enquiry-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Supplier / product</th>
                <th>Quantity</th>
                <th>Your message</th>
                <th>Supplier response</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.kind === "QUOTE"
                      ? "Quote request"
                      : "Business enquiry"}
                  </td>
                  <td>
                    <strong>{item.seller.company}</strong>
                    {item.productId && (
                      <Link href={`/products/${item.productId}`}>
                        <small>
                          {state.products.find(
                            (product) => product.id === item.productId,
                          )?.name || "View product"}
                        </small>
                      </Link>
                    )}
                  </td>
                  <td>{item.quantity || "—"}</td>
                  <td className="rx-message-cell">{item.message}</td>
                  <td className="rx-message-cell">
                    {item.response || "Awaiting supplier response"}
                  </td>
                  <td>
                    <Badge tone={item.response ? "green" : "amber"}>
                      {item.response ? "Replied" : "Awaiting reply"}
                    </Badge>
                  </td>
                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RecordList>
    </>
  );
}

export function SavedProductsList() {
  const { state, ready, save } = useMarketplace();
  const items = state.products.filter((product) =>
    state.saved.includes(product.id),
  );
  return (
    <>
      <PageHeading
        title="Saved products"
        description="Filter and manage your supplier shortlist."
      />
      <RecordList
        label="Saved products"
        items={items}
        loading={!ready}
        columns={6}
        searchText={(product) =>
          [
            product.name,
            product.category,
            state.sellers.find((seller) => seller.id === product.sellerId)
              ?.company,
          ].join(" ")
        }
        filters={[
          { label: "Category", value: (product) => product.category },
          {
            label: "Supplier",
            value: (product) =>
              state.sellers.find((seller) => seller.id === product.sellerId)
                ?.company || "Supplier",
          },
          { label: "Availability", value: (product) => product.status },
        ]}
      >
        {(rows) => (
          <table className="ms-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Price / minimum order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link
                      href={`/products/${product.id}`}
                      className="rx-saved-product"
                    >
                      <span className="rx-saved-thumbnail">
                        <LoadingImage src={product.image} alt={product.name} />
                      </span>
                      <strong>{product.name}</strong>
                    </Link>
                  </td>
                  <td>
                    {state.sellers.find(
                      (seller) => seller.id === product.sellerId,
                    )?.company || "Supplier"}
                  </td>
                  <td>{product.category}</td>
                  <td>
                    {money(product.price)} / {product.unit}
                    <small>
                      MOQ: {product.moq} {product.unit}
                    </small>
                  </td>
                  <td>
                    <Badge tone={product.status === "Active" ? "green" : ""}>
                      {product.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="rx-saved-actions">
                      {product.status === "Active" && (
                        <Link
                          href={`/buyer/quotes/create?productId=${product.id}&sellerId=${product.sellerId}`}
                        >
                          Request quote
                        </Link>
                      )}
                      <button
                        onClick={() => save(product.id)}
                        aria-label={`Remove ${product.name} from saved products`}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RecordList>
    </>
  );
}
