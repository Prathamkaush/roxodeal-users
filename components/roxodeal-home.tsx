"use client";
import Link from "next/link";
import { LoadingImage } from "./loading-image";
import { RoxodealLoader } from "./roxodeal-loader";
import { PlatformReviewHighlights } from "./platform-review-highlights";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Boxes,
  Check,
  ChevronRight,
  CircuitBoard,
  Cog,
  Factory,
  FlaskConical,
  Headphones,
  MapPin,
  MessageSquareText,
  PackageCheck,
  PackageOpen,
  Search,
  ShieldCheck,
  Shirt,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import { MarketplaceHeader, MarketplaceFooter } from "./roxodeal-shell";
import { appHref } from "@/lib/app-links";
import { useMarketplace } from "@/lib/store";
import { categories, type Seller } from "@/lib/data";
import { money, businessExperience } from "@/lib/utils";

const industries = [
  {
    name: "Industrial Machinery",
    Icon: Cog,
    SubIcon: Factory,
    caption: "Equipment & production",
  },
  {
    name: "Packaging Materials",
    Icon: PackageOpen,
    SubIcon: Boxes,
    caption: "Pack. Protect. Deliver.",
  },
  {
    name: "Raw Textiles",
    Icon: Shirt,
    SubIcon: Truck,
    caption: "Fabrics & finished goods",
  },
  {
    name: "Electronics & Components",
    Icon: CircuitBoard,
    SubIcon: Cog,
    caption: "Parts that power business",
  },
  {
    name: "Construction Materials",
    Icon: Wrench,
    SubIcon: Boxes,
    caption: "Build with better materials",
  },
  {
    name: "Chemical & Distribution",
    Icon: FlaskConical,
    SubIcon: PackageOpen,
    caption: "Industrial supplies",
  },
];

function SupplierCard({ seller }: { seller: Seller }) {
  const { state } = useMarketplace();
  const products = state.products.filter(
    (product) => product.sellerId === seller.id && product.status === "Active",
  );
  return (
    <Link className="rx-supplier-card" href={"/suppliers/" + seller.id}>
      <div className="rx-supplier-logo">
        {seller.company
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")}
        <BadgeCheck size={15} />
      </div>
      <h3>{seller.company}</h3>
      <span className="rx-verified">
        <ShieldCheck size={12} /> Verified supplier
      </span>
      <p>
        <MapPin size={11} /> {seller.city}, India
      </p>
      <small>{businessExperience(seller.years)}</small>
      <div className="rx-supplier-products">
        {products.slice(0, 3).map((product) => (
          <span className="rx-supplier-preview-image" key={product.id}>
            <LoadingImage src={product.image} alt={product.name} />
          </span>
        ))}
        {!products.length && (
          <div>
            <Factory size={25} />
            <span>{seller.category}</span>
          </div>
        )}
      </div>
      <span className="rx-card-action">
        View supplier <ChevronRight size={12} />
      </span>
    </Link>
  );
}

function QuickRfq() {
  const router = useRouter();
  return (
    <section className="rx-rfq" aria-labelledby="rfq-heading">
      <div className="rx-rfq-icon">
        <MessageSquareText size={22} />
      </div>
      <span className="rx-eyebrow">LET SUPPLIERS COME TO YOU</span>
      <h2 id="rfq-heading">Quick RFQ</h2>
      <p>
        Tell us what you need.
        <br />
        Connect with relevant manufacturers.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          const query = new URLSearchParams();
          for (const key of ["product", "category", "quantity", "city"])
            query.set(key, String(values.get(key) || ""));
          router.push("/buyer/requirements/create?" + query);
        }}
      >
        <label>
          Product name
          <input
            name="product"
            placeholder="e.g. Cotton T-shirts"
            required
            minLength={5}
          />
        </label>
        <label>
          Industry
          <select name="category" aria-label="Industry" required>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <div className="rx-rfq-row">
          <label>
            Quantity
            <input
              name="quantity"
              type="number"
              min={1}
              required
              placeholder="e.g. 500"
            />
          </label>
          <label>
            Delivery city
            <input
              name="city"
              placeholder="e.g. Delhi"
              required
              minLength={2}
            />
          </label>
        </div>
        <button className="rx-button rx-gold" type="submit">
          Get supplier quotes <ArrowRight size={16} />
        </button>
      </form>
      <small>
        <Check size={13} /> Free to post · Add specifications next
      </small>
    </section>
  );
}

export function Home() {
  const { state, ready } = useMarketplace();
  const suppliers = state.sellers
    .filter((seller) => seller.kyc === "Approved")
    .slice(0, 3);
  const products = state.products.filter(
    (product) => product.status === "Active",
  );
  if (!ready)
    return <RoxodealLoader label="Finding your next business connection..." />;
  return (
    <div className="rx-site">
      <MarketplaceHeader />
      <main className="rx-home">
        <div className="rx-primary-column">
          <section className="rx-hero">
            <img
              className="rx-hero-photo"
              src="/images/factory-hall.png"
              alt="Modern CNC factory hall with manufacturing machines and a central aisle"
              fetchPriority="high"
            />
            <div className="rx-hero-content">
              <span className="rx-eyebrow">
                <span /> DIRECT FROM THE SOURCE
              </span>
              <h1>
                ROXODEAL: YOUR DIRECT
                <br />
                <em>FACTORY-TO-BUYER</em>
                <br />
                B2B MARKETPLACE
              </h1>
              <p>
                Discover manufacturers. Source wholesale products.
                <br className="rx-desktop-break" /> Build your next business
                connection.
              </p>
              <div className="rx-hero-actions">
                <Link className="rx-button rx-navy" href="/products">
                  Explore wholesale deals <ArrowRight size={15} />
                </Link>
                <Link
                  className="rx-button rx-gold"
                  href={appHref("seller", "/seller/dashboard")}
                >
                  Join as a supplier
                </Link>
              </div>
              <a className="rx-hero-discover" href="#industries">
                Discover your industry <ArrowDown size={13} />
              </a>
            </div>
          </section>
          <div className="rx-trust-strip">
            {[
              { Icon: ShieldCheck, label: "Supplier KYC checks" },
              { Icon: MessageSquareText, label: "Direct connections" },
              { Icon: Boxes, label: "12 industry categories" },
              { Icon: Headphones, label: "Business support" },
            ].map(({ Icon, label }) => (
              <div key={label}>
                <Icon size={21} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="rx-sourcing-grid">
            <section id="industries" className="rx-industries">
              <div className="rx-section-heading">
                <div>
                  <span className="rx-eyebrow">FIND YOUR NEXT OPPORTUNITY</span>
                  <h2>Top industry categories</h2>
                </div>
                <Link href="/categories">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="rx-category-grid">
                {industries.map(({ name, Icon, SubIcon, caption }) => (
                  <Link
                    className="rx-category-card"
                    href={"/products?category=" + encodeURIComponent(name)}
                    key={name}
                  >
                    <div className="rx-category-art">
                      <span className="rx-art-circle" />
                      <Icon size={48} strokeWidth={1.35} />
                      <SubIcon size={28} strokeWidth={1.5} />
                    </div>
                    <h3>{name}</h3>
                    <p>{caption}</p>
                    <span className="rx-category-bottom">
                      Explore category <ArrowRight size={13} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
            <QuickRfq />
          </div>
          <section className="rx-main-suppliers">
            <div className="rx-section-heading">
              <div>
                <span className="rx-eyebrow">
                  MEET YOUR NEXT BUSINESS PARTNER
                </span>
                <h2>Featured manufacturers & suppliers</h2>
              </div>
              <Link href="/suppliers">
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="rx-main-supplier-grid">
              {suppliers.map((seller) => (
                <SupplierCard seller={seller} key={seller.id} />
              ))}
            </div>
          </section>
          <section className="rx-buyer-banner">
            <PackageCheck size={40} />
            <div>
              <span className="rx-eyebrow">LESS SEARCHING. MORE SOURCING.</span>
              <h2>One requirement. The right connections.</h2>
              <p>
                Post a free buying requirement and connect with up to five
                relevant suppliers.
              </p>
            </div>
            <Link
              href="/buyer/requirements/create"
              className="rx-button rx-gold"
            >
              Post your requirement <ArrowRight size={16} />
            </Link>
          </section>
        </div>
        <aside
          className="rx-market-sidebar"
          aria-label="Marketplace highlights"
        >
          <section className="rx-sidebar-section">
            <div className="rx-section-heading">
              <h2>Featured suppliers</h2>
              <Link href="/suppliers" aria-label="View all suppliers">
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="rx-sidebar-suppliers">
              {suppliers.slice(0, 2).map((seller) => (
                <SupplierCard seller={seller} key={seller.id} />
              ))}
            </div>
          </section>
          <section className="rx-sidebar-section rx-wholesale">
            <div className="rx-section-heading">
              <div>
                <span className="rx-eyebrow">STRAIGHT FROM MANUFACTURERS</span>
                <h2>Trending wholesale products</h2>
              </div>
            </div>
            <div className="rx-wholesale-grid">
              {products.slice(0, 4).map((product) => (
                <Link
                  href={"/products/" + product.id}
                  className="rx-wholesale-card"
                  key={product.id}
                >
                  <div className="rx-wholesale-image">
                    <LoadingImage src={product.image} alt={product.name} />
                  </div>
                  <h3>{product.name}</h3>
                  <small>
                    MOQ {product.moq.toLocaleString("en-IN")} {product.unit}s
                  </small>
                  <strong>
                    {money(product.price)}
                    <span> / {product.unit}</span>
                  </strong>
                  <span className="rx-price-button">
                    View product <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
          <section className="rx-how">
            <span className="rx-eyebrow">FROM SEARCH TO SUPPLIER</span>
            <h2>How it works</h2>
            <div>
              {[
                {
                  Icon: Search,
                  title: "Search & find",
                  text: "Explore products and manufacturers.",
                },
                {
                  Icon: MessageSquareText,
                  title: "Connect & negotiate",
                  text: "Discuss your requirements directly.",
                },
                {
                  Icon: PackageCheck,
                  title: "Agree & trade",
                  text: "Arrange your terms and delivery.",
                },
              ].map(({ Icon, title, text }, index) => (
                <div className="rx-step" key={title}>
                  <span>
                    <Icon size={23} />
                    <b>{index + 1}</b>
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rx-testimonial">
            <span className="rx-eyebrow">A BETTER WAY TO DO BUSINESS</span>
            <h2>Built for real connections.</h2>
            <div className="rx-stars">
              {Array.from({ length: 5 }, (_, index) => (
                <Star size={13} key={index} fill="currentColor" />
              ))}
            </div>
            <blockquote>
              “Finding the right supplier shouldn’t be the hardest part of
              growing your business.”
            </blockquote>
            <div className="rx-testimonial-person">
              <span>R</span>
              <div>
                <strong>The Roxodeal promise</strong>
                <small>Our approach to better sourcing</small>
              </div>
            </div>
            <Link href="/about">
              Get to know Roxodeal <ArrowRight size={14} />
            </Link>
          </section>
        </aside>
      </main>
      <div className="ms-public-main rx-home-review-container">
        <PlatformReviewHighlights />
      </div>
      <MarketplaceFooter />
      <div className="rx-preview-note">
        Roxodeal · Direct factory-to-buyer sourcing{" "}
        <Link href="/buyer/dashboard">
          Open buyer workspace <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
