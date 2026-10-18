"use client";
import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Package,
  ArrowRight,
  Building2,
} from "lucide-react";
import type { Product, Seller } from "@/lib/data";
import { useMarketplace } from "@/lib/store";
import { money, businessExperience as experience } from "@/lib/utils";
import { ProductGrid, Badge } from "./marketplace";
import { LoadingImage } from "./loading-image";
import { ReviewsPanel } from "./community-pages";
import { Button } from "./ui/button";

export function SupplierStorefront({ seller }: { seller: Seller }) {
  const { state } = useMarketplace();
  const [search, setSearch] = useState("");
  const products = state.products.filter(
    (product) => product.sellerId === seller.id && product.status === "Active",
  );
  const initials = seller.company
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="rx-storefront">
      <section className="rx-supplier-hero">
        <div className="rx-store-identity">
          <div className="rx-store-avatar">{initials}</div>
          <div>
            <span className="rx-section-label">SUPPLIER STOREFRONT</span>
            <h1>{seller.company}</h1>
            <p>
              <MapPin size={15} /> {seller.city}, India <span>•</span>{" "}
              {experience(seller.years)}
            </p>
            <Badge tone={seller.kyc === "Approved" ? "green" : "amber"}>
              <ShieldCheck size={14} />
              {seller.kyc === "Approved"
                ? "Verified supplier"
                : "Verification pending"}
            </Badge>
          </div>
        </div>
        <div className="rx-store-actions">
          <Button asChild>
            <Link href={`/buyer/quotes/create?sellerId=${seller.id}`}>
              Request a quote <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/buyer/enquiries/create?sellerId=${seller.id}`}>
              Contact supplier
            </Link>
          </Button>
        </div>
      </section>
      <nav className="rx-store-tabs" aria-label="Supplier sections">
        <a href="#catalogue">Products ({products.length})</a>
        <a href="#company">Company profile</a>
        <a href="#supplier-reviews">Reviews</a>
      </nav>
      <div className="rx-store-layout">
        <aside>
          <section className="ms-card rx-store-company" id="company">
            <Building2 size={26} />
            <h2>Company overview</h2>
            <dl>
              <dt>Business name</dt>
              <dd>{seller.company}</dd>
              <dt>Location</dt>
              <dd>{seller.city}, India</dd>
              <dt>Main category</dt>
              <dd>{seller.category || "General supply"}</dd>
              <dt>Experience</dt>
              <dd>{experience(seller.years)}</dd>
              <dt>Listed products</dt>
              <dd>{products.length}</dd>
            </dl>
            <p className="rx-muted">
              Discuss specifications, availability, and delivery directly with
              this supplier.
            </p>
            <Link href={`/buyer/enquiries/create?sellerId=${seller.id}`}>
              Ask a business question <ArrowRight size={14} />
            </Link>
          </section>
          <section className="rx-sourcing-card">
            <Package size={24} />
            <h3>Compare more suppliers</h3>
            <p>Post one requirement and connect with up to five suppliers.</p>
            <Link href="/buyer/requirements/create">
              Post a free requirement →
            </Link>
          </section>
        </aside>
        <section id="catalogue">
          <div className="rx-catalogue-heading">
            <div>
              <span className="rx-section-label">
                DIRECT FROM THIS SUPPLIER
              </span>
              <h2>Product catalogue</h2>
            </div>
            <label className="ms-field">
              <span className="rx-sr-only">Search supplier products</span>
              <input
                type="search"
                placeholder="Search this catalogue"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
          <ProductGrid
            products={products.filter((product) =>
              `${product.name} ${product.category}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            )}
          />
        </section>
      </div>
      <div id="supplier-reviews">
        <ReviewsPanel sellerId={seller.id} />
      </div>
    </div>
  );
}

export function ProductDetails({
  product,
  seller,
}: {
  product: Product;
  seller?: Seller;
}) {
  const { state } = useMarketplace();
  const images = [
    ...new Set([product.image, ...(product.images || [])].filter(Boolean)),
  ];
  const [index, setIndex] = useState(0);
  return (
    <div className="rx-product-page">
      <div className="rx-product-trail">
        <Link href="/products">Products</Link>
        <span>/</span>
        <span>{product.category}</span>
      </div>
      <section className="rx-product-overview">
        <div className="rx-product-gallery">
          <div className="rx-product-main-image">
            <LoadingImage
              src={images[index] || product.image}
              alt={product.name}
              eager
            />
          </div>
          {images.length > 1 && (
            <div className="rx-product-thumbnails">
              {images.map((src, imageIndex) => (
                <button
                  key={src}
                  className={index === imageIndex ? "selected" : ""}
                  aria-label={`View product image ${imageIndex + 1}`}
                  aria-pressed={index === imageIndex}
                  onClick={() => setIndex(imageIndex)}
                >
                  <LoadingImage
                    src={src}
                    alt={`${product.name} ${imageIndex + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="rx-product-summary">
          <span className="rx-section-label">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="rx-product-price">
            {money(product.price)}
            {product.maximumPrice && product.maximumPrice > product.price
              ? ` – ${money(product.maximumPrice)}`
              : ""}
            <small> / {product.unit}</small>
          </p>
          <div className="rx-product-minimum">
            <span>Minimum order</span>
            <strong>
              {product.moq.toLocaleString("en-IN")} {product.unit}
            </strong>
          </div>
          <p className="rx-muted">
            Contact the supplier for availability, final pricing, and delivery
            terms.
          </p>
          <div className="rx-product-ctas">
            <Button asChild>
              <Link
                href={`/buyer/quotes/create?productId=${product.id}&sellerId=${product.sellerId}`}
              >
                Request a quote <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href={`/buyer/enquiries/create?productId=${product.id}&sellerId=${product.sellerId}`}
              >
                Ask a question
              </Link>
            </Button>
          </div>
          <div className="rx-direct-note">
            Your quote or enquiry goes only to this product's supplier.
          </div>
        </div>
        <aside className="ms-card rx-product-supplier">
          <span className="rx-section-label">MEET THE SUPPLIER</span>
          <Building2 size={30} />
          <h2>{seller?.company || "Supplier"}</h2>
          {seller?.kyc === "Approved" && (
            <Badge tone="green">
              <ShieldCheck size={13} />
              Verified supplier
            </Badge>
          )}
          <p>
            <MapPin size={14} />
            {seller?.city}, India
          </p>
          <p>{seller ? experience(seller.years) : ""}</p>
          <Link href={`/suppliers/${product.sellerId}`}>
            Visit supplier store <ArrowRight size={14} />
          </Link>
        </aside>
      </section>
      <section className="ms-card rx-product-description">
        <h2>Product details</h2>
        <p>
          {product.description ||
            "Contact the supplier for detailed specifications."}
        </p>
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <dl className="rx-specifications">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
      </section>
      <ReviewsPanel sellerId={product.sellerId} productId={product.id} />
      <section>
        <div className="rx-catalogue-heading">
          <h2>More from this supplier</h2>
          <Link href={`/suppliers/${product.sellerId}`}>View store →</Link>
        </div>
        <ProductGrid
          products={state.products
            .filter(
              (item) =>
                item.sellerId === product.sellerId &&
                item.id !== product.id &&
                item.status === "Active",
            )
            .slice(0, 4)}
        />
      </section>
    </div>
  );
}
