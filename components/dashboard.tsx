"use client";
import Link from "next/link";
import {
  ShieldCheck,
  Plus,
  FileText,
  ArrowRight,
  CheckCircle2,
  ArrowUpRight,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { type Role } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/marketplace";
import { PageHeading } from "@/components/page-heading";
export function BuyerDashboard() {
  const role = "buyer" as Role;
  const { state } = useMarketplace();
  const pendingKyc = state.sellers.filter(
    (s) => s.kyc === "Under Review",
  ).length;
  const stats = [
    {
      label: "My requirements",
      value: state.leads.filter((l) => l.email === state.profile.email).length,
      detail: "Your sourcing requests",
      icon: FileText,
      tone: "blue",
    },
    {
      label: "Supplier connections",
      value: state.leads
        .filter((l) => l.email === state.profile.email)
        .reduce((n, l) => n + l.purchases.length, 0),
      detail: "Across your requirements",
      icon: Users,
      tone: "amber",
    },
    {
      label: "Saved products",
      value: state.saved.length,
      detail: "Your sourcing shortlist",
      icon: Package,
      tone: "green",
    },
    {
      label: "Protection claims",
      value: state.claims.length,
      detail: "Manually reviewed by admin",
      icon: ShieldCheck,
      tone: "violet",
    },
  ];
  return (
    <>
      <PageHeading
        title={`Good morning, ${state.profile.name.split(" ")[0]} 👋`}
        description={"Your next business connection starts here."}
        action={
          <Button asChild>
            <Link href={"/buyer/requirements/create"}>
              {<Plus size={17} />} {"Post requirement"}
            </Link>
          </Button>
        }
      />
      <div className="ms-stat-grid">
        {stats.map((s) => (
          <div className="ms-stat" key={s.label}>
            <div className="ms-stat-label">
              {s.label}
              <span className={"ms-stat-icon " + s.tone}>
                <s.icon size={19} />
              </span>
            </div>
            <strong>{s.value}</strong>
            <small>{s.detail}</small>
          </div>
        ))}
      </div>
      <div className="ms-dashboard-grid">
        <div>
          <section className="ms-card">
            <div className="ms-card-heading">
              <div>
                <h2>{"Your recent requirements"}</h2>
                <p>{"Keep your sourcing and supplier connections in view."}</p>
              </div>
              <Link href={"/buyer/requirements"}>
                View all <ArrowRight size={15} />
              </Link>
            </div>
            {
              <div className="ms-table-wrap">
                <table className="ms-table">
                  <thead>
                    <tr>
                      <th>Requirement</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Connections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.leads
                      .filter((l) => l.email === state.profile.email)
                      .slice(0, 4)
                      .map((l) => (
                        <tr key={l.id}>
                          <td>
                            <Link href={"/buyer/requirements/" + l.id}>
                              <strong>{l.title}</strong>
                              <small>
                                {l.id} · {l.city}
                              </small>
                            </Link>
                          </td>
                          <td>{money(l.budget)}</td>
                          <td>
                            <Badge
                              tone={l.status === "Pending" ? "amber" : "green"}
                            >
                              {l.status}
                            </Badge>
                          </td>
                          <td>{l.purchases.length} / 5</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            }
          </section>
          <section className="ms-card ms-activity-card">
            <div className="ms-card-heading">
              <h2>Recent activity</h2>
              <Badge>Preview</Badge>
            </div>
            {state.activity.slice(0, 4).map((a, i) => (
              <div className="ms-activity" key={i}>
                <span>
                  <CheckCircle2 size={17} />
                </span>
                <div>
                  <p>{a}</p>
                  <small>Marketplace update</small>
                </div>
              </div>
            ))}
          </section>
        </div>
        <div className="ms-dashboard-aside">
          {
            <section className="ms-plan-card">
              <ShieldCheck size={34} />
              <h2>{"Source with confidence"}</h2>
              <p>
                {
                  "Keep agreements and invoices together with optional Buyer Protection."
                }
              </p>
              <Button asChild>
                <Link href={"/buyer/protection"}>
                  {"Explore protection"}
                  <ArrowRight size={15} />
                </Link>
              </Button>
            </section>
          }
          <section className="ms-card">
            <h2>{"How sourcing works"}</h2>
            {
              <ol className="ms-how-list">
                <li>Post your requirement for free.</li>
                <li>Relevant suppliers unlock your lead.</li>
                <li>Connect directly and negotiate.</li>
              </ol>
            }
          </section>
          <div className="ms-help-card">
            <div className="ms-help-icon">
              <TrendingUp />
            </div>
            <h3>Grow together with Roxodeal</h3>
            <p>Direct connections. Relevant opportunities. Better business.</p>
            <Link href="/suppliers">Explore the marketplace →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
function BarIcon() {
  return <ArrowUpRight size={17} />;
}
