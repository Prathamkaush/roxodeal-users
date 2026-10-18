"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, UserRound, LogOut, Bell, LifeBuoy } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { appHref } from "@/lib/app-links";
import { buyerNavigation } from "./navigation";

export function AccountDropdown() {
  const { role, state, setRole } = useMarketplace();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname, role]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  if (!role)
    return (
      <Link className="rx-login" href="/login" aria-label="Login / Register">
        <UserRound size={17} />
        <span>Login / Register</span>
      </Link>
    );
  const name = state.profile.name || "My account";
  const links =
    role === "buyer"
      ? buyerNavigation.map(([path, label, Icon]) => ({
          label: path === "dashboard" ? "Dashboard" : label,
          href: "/buyer/" + path,
          Icon,
        }))
      : (role === "seller"
          ? [
              ["dashboard", "Dashboard"],
              ["products", "My products"],
              ["leads", "Leads"],
              ["enquiries", "Enquiries"],
              ["profile", "Business profile"],
            ]
          : [
              ["dashboard", "Dashboard"],
              ["buyers", "Buyers"],
              ["sellers", "Suppliers"],
              ["products", "Products"],
              ["leads", "Lead management"],
            ]
        ).map(([path, label]) => ({
          label,
          href: appHref(role, `/${role}/${path}`),
          Icon: UserRound,
        }));
  return (
    <div
      className="rx-account"
      ref={wrapper}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="rx-login rx-account-trigger"
        aria-label={`Account menu for ${name}`}
        aria-expanded={open}
        aria-controls="roxodeal-account-navigation"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() =>
              wrapper.current
                ?.querySelector<HTMLAnchorElement>("nav a")
                ?.focus(),
            );
          }
        }}
      >
        <UserRound size={17} />
        <span>{name}</span>
        <ChevronDown size={14} className={open ? "is-open" : ""} />
      </button>
      {open && (
        <nav
          id="roxodeal-account-navigation"
          className="rx-account-dropdown"
          aria-label="Account shortcuts"
        >
          <div className="rx-account-identity">
            <strong>{name}</strong>
            <small>
              {role === "buyer"
                ? "Your buyer workspace"
                : role === "seller"
                  ? "Your supplier workspace"
                  : "Your admin workspace"}
            </small>
          </div>
          {links.map(({ label, href, Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {role === "buyer" && (
            <Link href="/buyer/notifications" onClick={() => setOpen(false)}>
              <Bell size={16} />
              Notifications
            </Link>
          )}
          <Link href="/contact" onClick={() => setOpen(false)}>
            <LifeBuoy size={16} />
            Contact support
          </Link>
          <button
            className="rx-account-signout"
            type="button"
            onClick={() => {
              setOpen(false);
              setRole(null);
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </nav>
      )}
    </div>
  );
}
