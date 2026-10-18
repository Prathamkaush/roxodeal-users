"use client";
import Link from "next/link";
import { appHref } from "@/lib/app-links";
import { CheckCircle2 } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/marketplace";
export function BuyerPlans() {
  const { state, update, notify } = useMarketplace();
  return (
    <div className="ms-pricing-grid">
      {state.plans.map((p) => (
        <div
          className={
            "ms-pricing-card " + (p.name === "Silver" ? "featured" : "")
          }
          key={p.id}
        >
          {p.id === "silver" && <Badge tone="amber">Popular choice</Badge>}
          <h2>{p.name}</h2>
          <div className="ms-pricing-price">
            {money(p.price)}
            <small>/ month</small>
          </div>
          <p>Built for your next stage of growth.</p>
          <ul>
            <li>
              <CheckCircle2 size={16} />
              {p.listings} product listings
            </li>
            <li>
              <CheckCircle2 size={16} />
              {p.credits} lead credits
            </li>
            <li>
              <CheckCircle2 size={16} />
              Business profile
            </li>
            <li>
              <CheckCircle2 size={16} />
              Relevant category leads
            </li>
          </ul>
          {
            <Button
              asChild
              variant={p.name === "Silver" ? "default" : "outline"}
            >
              <Link href={appHref("seller", "/seller/dashboard")}>
                Choose {p.name}
              </Link>
            </Button>
          }
        </div>
      ))}
    </div>
  );
}
