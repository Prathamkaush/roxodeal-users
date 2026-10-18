"use client";
import {
  FinancialActivity,
  ProtectionWorkspace,
  KycWorkspace,
  BuyerManagement,
  CategoryManagement,
  Documents,
} from "./live-workspace";
import { appHref } from "@/lib/app-links";
import Link from "next/link";
import { SellerRequest } from "./seller-request";
import { FeedbackPage } from "./community-pages";
import { BuyerSearchPage, BuyerNotifications } from "./buyer-header-tools";
import { ShieldCheck, Plus, ArrowRight } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { type Role } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, ProductGrid } from "@/components/marketplace";
import { PageHeading } from "@/components/page-heading";
import { Empty } from "@/components/empty";
import { ProfileForm } from "@/components/profile-form";
import { RequirementForm } from "@/components/requirement-form";
import { BuyerDashboard } from "./dashboard";
import {
  BuyerEnquiries,
  SavedProductsList,
  RequirementActions,
} from "./buyer-lists";
import { RecordList } from "./list-tools";
import { BuyerClaims } from "./claims";
export function BuyerPanel({ path }: { path: string[] }) {
  const role = "buyer" as Role;
  const { state, update, notify, ready } = useMarketplace();
  const section = path[0] || "dashboard";
  const seller = state.sellers[0];
  if (section === "search") return <BuyerSearchPage />;
  if (section === "feedback") return <FeedbackPage />;
  if (section === "notifications") return <BuyerNotifications />;
  if (section === "quotes" && path[1] === "create")
    return <SellerRequest key="quote" kind="QUOTE" />;
  if (section === "enquiries" && path[1] === "create")
    return <SellerRequest key="enquiry" kind="ENQUIRY" />;
  if (section === "enquiries") return <BuyerEnquiries />;
  if (section === "dashboard") return <BuyerDashboard />;
  if (section === "profile")
    return (
      <>
        <PageHeading
          title="Business profile"
          description="Keep your business details up to date."
        />
        <ProfileForm seller={false} />
      </>
    );
  if (section === "requirements") {
    if (path[1] === "create")
      return (
        <>
          <PageHeading
            title="Post a buying requirement"
            description="Free for buyers. Get connected with up to 5 relevant suppliers."
          />
          <div className="ms-card">
            <RequirementForm />
          </div>
        </>
      );
    const leads = state.leads.filter((l) => l.email === state.profile.email);
    const lead = leads.find((l) => l.id === path[1]);
    if (path[1])
      return lead ? (
        <>
          <PageHeading title={lead.title} description={lead.id} />
          <div className="ms-card">
            <Badge tone="green">{lead.status}</Badge>
            <p>{lead.description}</p>
            <RequirementActions lead={lead} />
            <div className="ms-detail-grid">
              <div>
                <small>Quantity</small>
                <strong>
                  {lead.quantity} {lead.unit}
                </strong>
              </div>
              <div>
                <small>Budget</small>
                <strong>{money(lead.budget)}</strong>
              </div>
              <div>
                <small>Delivery location</small>
                <strong>{lead.city}</strong>
              </div>
              <div>
                <small>Required by</small>
                <strong>{lead.date}</strong>
              </div>
            </div>
            <p>
              {lead.purchases.length} of 5 supplier slots filled. Supplier
              connections appear after lead unlock.
            </p>
            <Link href={appHref("buyer", "/buyer/requirements")}>
              ← All requirements
            </Link>
          </div>
          <Documents
            attachment={{
              type: "LEAD",
              id: lead.id,
              documentIds: lead.documentIds,
            }}
          />
        </>
      ) : (
        <Empty title="Requirement not found" />
      );
    return (
      <>
        <PageHeading
          title="My requirements"
          description="Manage your sourcing requests and supplier connections."
          action={
            <Button asChild>
              <Link href={appHref("buyer", "/buyer/requirements/create")}>
                <Plus size={16} /> Post requirement
              </Link>
            </Button>
          }
        />
        <RecordList
          label="Requirements"
          items={leads}
          loading={!ready}
          columns={6}
          searchText={(lead) =>
            [lead.title, lead.category, lead.city].join(" ")
          }
          filters={[{ label: "Status", value: (lead) => lead.status }]}
        >
          {(rows) => (
            <table className="ms-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Quantity</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Slots</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link href={"/buyer/requirements/" + l.id}>
                        <strong>{l.title}</strong>
                        <small>
                          {l.id} · {l.city}
                        </small>
                      </Link>
                    </td>
                    <td>
                      {l.quantity} {l.unit}
                    </td>
                    <td>{money(l.budget)}</td>
                    <td>
                      <Badge tone="green">{l.status}</Badge>
                    </td>
                    <td>{l.purchases.length}/5</td>
                    <td>
                      <RequirementActions lead={l} />
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
  if (section === "saved") return <SavedProductsList />;
  if (section === "claims") return <BuyerClaims />;
  if (section === "protection") return <ProtectionWorkspace />;
  if (section === "payments" || section === "enquiries")
    return <FinancialActivity section={section} />;
  return <Empty title="Page not found" />;
}
