"use client";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Grid3X3,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { AccountDropdown } from "./account-dropdown";
import { categories } from "@/lib/data";
import { appHref } from "@/lib/app-links";
import { useMarketplace } from "@/lib/store";

export function MarketplaceHeader() {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <header className="rx-header">
        <div className="rx-header-inner">
          <Brand />
          <form
            className="rx-search"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const params = new URLSearchParams({
                q: String(data.get("q") || ""),
                category: String(data.get("category") || ""),
              });
              router.push("/products?" + params);
            }}
          >
            <input
              name="q"
              aria-label="Search products and suppliers"
              placeholder="What are you looking for?"
            />
            <select name="category" aria-label="Search category">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <button aria-label="Search">
              <Search size={19} />
            </button>
          </form>
          <AccountDropdown />
          <Link
            className="rx-button rx-gold rx-header-sell"
            href={appHref("seller", "/seller/dashboard")}
          >
            Sell With Us <ArrowRight size={14} />
          </Link>
          <button
            className="rx-menu-toggle"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <nav
        className={"rx-navigation " + (menu ? "is-open" : "")}
        aria-label="Marketplace navigation"
      >
        <div className="rx-navigation-inner">
          <details className="rx-category-menu">
            <summary>
              <Grid3X3 size={15} />
              All Categories
              <ChevronDown size={13} />
            </summary>
            <div>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={"/products?category=" + encodeURIComponent(category)}
                  onClick={() => setMenu(false)}
                >
                  {category}
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
          </details>
          <Link href="/products" onClick={() => setMenu(false)}>
            Browse products
          </Link>
          <Link href="/suppliers" onClick={() => setMenu(false)}>
            Verified Suppliers
          </Link>
          <Link
            href="/buyer/requirements/create"
            onClick={() => setMenu(false)}
          >
            Post Your Requirement
          </Link>
          <Link href="/buyer/protection" onClick={() => setMenu(false)}>
            Buyer Protection
          </Link>
          <Link
            className="rx-nav-sell"
            href={appHref("seller", "/seller/dashboard")}
          >
            Join as a supplier <ArrowRight size={14} />
          </Link>
        </div>
      </nav>
    </>
  );
}

export function MarketplaceFooter() {
  const { notify } = useMarketplace();
  const groups = [
    {
      title: "ROXODEAL",
      links: [
        ["About us", "/about"],
        ["Contact us", "/contact"],
        ["Buyer reviews", "/reviews"],
        ["FAQs", "/faq"],
      ],
    },
    {
      title: "FOR BUYERS",
      links: [
        ["Browse products", "/products"],
        ["Find suppliers", "/suppliers"],
        ["Post a requirement", "/buyer/requirements/create"],
      ],
    },
    {
      title: "FOR SUPPLIERS",
      links: [
        ["Sell with us", appHref("seller", "/seller/dashboard")],
        ["Supplier dashboard", appHref("seller", "/seller/dashboard")],
        ["Plans & pricing", "/pricing"],
      ],
    },
    {
      title: "HELP & POLICIES",
      links: [
        ["Buyer protection", "/buyer/protection"],
        ["Terms of use", "/terms"],
        ["Privacy policy", "/privacy"],
      ],
    },
  ];
  return (
    <footer className="rx-footer">
      <div className="rx-footer-inner">
        <div className="rx-footer-brand">
          <Brand />
          <p>
            Better sourcing.
            <br />
            Stronger business connections.
          </p>
          <span>Built for businesses across India.</span>
        </div>
        {groups.map((group) => (
          <div className="rx-footer-group" key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map(([label, href]) => (
              <Link href={href} key={label}>
                {label}
              </Link>
            ))}
          </div>
        ))}
        <div className="rx-newsletter">
          <h3>STAY IN THE LOOP</h3>
          <p>Discover what’s new in the marketplace.</p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const email = new FormData(event.currentTarget).get("email");
              try {
                await api("/newsletter", {
                  method: "POST",
                  body: JSON.stringify({ email }),
                });
                notify("Your newsletter subscription is saved.");
              } catch (error) {
                notify((error as Error).message);
              }
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Newsletter email"
              name="email"
            />
            <button aria-label="Request newsletter updates">
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
        <div className="rx-footer-bottom">
          <span>
            © {new Date().getFullYear()} Roxodeal. All rights reserved.
          </span>
          <span>Direct factory-to-buyer connections</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rx-site">
      <MarketplaceHeader />
      <main className="ms-public-main">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
