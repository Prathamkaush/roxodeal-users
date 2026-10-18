import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function businessExperience(value: number) {
  const year = new Date().getFullYear();
  if (value >= 1900 && value <= year) return `Established in ${value}`;
  return value > 0 && value < 200
    ? `${value} years in business`
    : "Business supplier";
}
