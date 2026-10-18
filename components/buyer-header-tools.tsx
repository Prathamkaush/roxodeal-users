"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Bell, Trash2, X } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { action } from "@/lib/api";
import { Button } from "./ui/button";
import { PageHeading } from "./page-heading";

export function BuyerNotifications({ compact = false }: { compact?: boolean }) {
  const { state, refresh } = useMarketplace();
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const notifications = state.notifications || [];
  return (
    <section
      className={compact ? "rx-notification-list" : "ms-card"}
      aria-label="Buyer notifications"
    >
      <h2>Notifications</h2>
      {error && (
        <p role="alert" className="ms-error">
          {error}
        </p>
      )}
      {(compact ? notifications.slice(0, 8) : notifications).map((item) => (
        <article key={item.id} className="rx-notification-row">
          <div>
            <p>{item.message}</p>
            <small>
              {new Date(item.createdAt).toLocaleDateString("en-IN")}
            </small>
          </div>
          <button
            className="rx-icon-button"
            disabled={!!deleting}
            aria-label={`Delete notification: ${item.message}`}
            onClick={async () => {
              setDeleting(item.id);
              setError("");
              try {
                await action("NOTIFICATION_DELETE", item.id, {});
                await refresh();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setDeleting("");
              }
            }}
          >
            <Trash2 size={17} />
          </button>
        </article>
      ))}
      {!notifications.length && (
        <p className="rx-muted" role="status">
          No notifications. You're all caught up.
        </p>
      )}
      {compact && notifications.length > 8 && (
        <Link href="/buyer/notifications">View all notifications</Link>
      )}
    </section>
  );
}
export function BuyerHeaderTools() {
  const { state } = useMarketplace();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(false),
    [notifications, setNotifications] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSearch(false);
    setNotifications(false);
  }, [pathname]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotifications(false);
        setSearch(false);
      }
    };
    const outside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node))
        setNotifications(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  const unread = (state.notifications || []).filter(
    (item) => !item.read,
  ).length;
  return (
    <div className="rx-buyer-header-tools" ref={wrapper}>
      <button
        className="rx-icon-button"
        aria-label="Search buyer workspace"
        aria-expanded={search}
        onClick={() => {
          setSearch(!search);
          setNotifications(false);
        }}
      >
        <Search size={20} />
      </button>
      <button
        className="rx-icon-button ms-notification-button"
        aria-label="View notifications"
        aria-expanded={notifications}
        onClick={() => {
          setNotifications(!notifications);
          setSearch(false);
        }}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="rx-notification-count">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {search && (
        <form
          className="rx-workspace-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(
              "/buyer/search?q=" +
                encodeURIComponent(
                  String(new FormData(event.currentTarget).get("q") || ""),
                ),
            );
            setSearch(false);
          }}
        >
          <label className="rx-sr-only" htmlFor="buyer-workspace-search">
            Search your workspace
          </label>
          <input
            id="buyer-workspace-search"
            name="q"
            type="search"
            placeholder="Requirements, suppliers, products..."
            autoFocus
            required
          />
          <Button size="sm">Search</Button>
          <button
            type="button"
            className="rx-icon-button"
            aria-label="Close search"
            onClick={() => setSearch(false)}
          >
            <X size={18} />
          </button>
        </form>
      )}
      {notifications && (
        <div className="ms-notification-popover rx-buyer-notification-popover">
          <button
            className="rx-icon-button rx-popover-close"
            aria-label="Close notifications"
            onClick={() => setNotifications(false)}
          >
            <X size={18} />
          </button>
          <BuyerNotifications compact />
        </div>
      )}
    </div>
  );
}
export function BuyerSearchPage() {
  const { state } = useMarketplace();
  const params = useSearchParams();
  const router = useRouter();
  const term = params.get("q") || "";
  const needle = term.toLowerCase().trim();
  const results = [
    ...state.leads.map((item) => ({
      id: "lead:" + item.id,
      title: item.title,
      kind: "My requirement",
      text: [item.title, item.category, item.city, item.id].join(" "),
      href: "/buyer/requirements/" + item.id,
    })),
    ...state.products
      .filter((item) => item.status === "Active")
      .map((item) => ({
        id: "product:" + item.id,
        title: item.name,
        kind: "Product",
        text: [
          item.name,
          item.category,
          state.sellers.find((seller) => seller.id === item.sellerId)?.company,
        ].join(" "),
        href: "/products/" + item.id,
      })),
    ...state.sellers.map((item) => ({
      id: "supplier:" + item.id,
      title: item.company,
      kind: "Supplier",
      text: [item.company, item.category, item.city].join(" "),
      href: "/suppliers/" + item.id,
    })),
    ...state.enquiries.map((item) => ({
      id: "enquiry:" + item.id,
      title: item.seller.company,
      kind: item.kind === "QUOTE" ? "Quote request" : "Enquiry",
      text: [item.seller.company, item.message, item.response].join(" "),
      href: "/buyer/enquiries",
    })),
  ].filter((item) => needle && item.text.toLowerCase().includes(needle));
  return (
    <>
      <PageHeading
        title="Search your workspace"
        description="Find your requirements, quotes, products, and suppliers."
      />
      <form
        className="ms-card rx-buyer-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(
            "/buyer/search?q=" +
              encodeURIComponent(
                String(new FormData(event.currentTarget).get("q") || ""),
              ),
          );
        }}
      >
        <label className="ms-field">
          Search
          <input
            key={term}
            name="q"
            type="search"
            defaultValue={term}
            required
          />
        </label>
        <Button>Search</Button>
      </form>
      <p role="status">
        {needle
          ? `${results.length} results for “${term}”`
          : "Enter a search term to get started."}
      </p>
      <div className="rx-buyer-search-results">
        {results.slice(0, 60).map((item) => (
          <Link className="ms-card" key={item.id} href={item.href}>
            <small>{item.kind}</small>
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
      {needle && !results.length && (
        <div className="ms-card">
          No matches. Try a product name, supplier, or requirement.
        </div>
      )}
    </>
  );
}
