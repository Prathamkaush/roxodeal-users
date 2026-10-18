import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  CreditCard,
  Bookmark,
  LifeBuoy,
} from "lucide-react";
export const buyerNavigation = [
  ["dashboard", "Overview", LayoutDashboard],
  ["requirements", "My requirements", FileText],
  ["enquiries", "Quotes & enquiries", FileText],
  ["feedback", "Feedback & reviews", LifeBuoy],
  ["saved", "Saved products", Bookmark],
  ["protection", "Buyer protection", ShieldCheck],
  ["claims", "My claims", LifeBuoy],
  ["payments", "Payments", CreditCard],
  ["profile", "Business profile", Users],
] as const;
