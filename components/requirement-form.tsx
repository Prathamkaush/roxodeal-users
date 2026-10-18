"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMarketplace } from "@/lib/store";
import { categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
const requirementSchema = z.object({
  title: z.string().min(5, "Enter at least 5 characters"),
  category: z.string().min(1, "Choose a category"),
  subcategory: z.string().optional(),
  quantity: z.coerce.number().int().positive("Enter a positive quantity"),
  unit: z.string().min(1),
  budget: z.coerce.number().positive("Enter a budget"),
  city: z.string().min(2, "Enter a delivery city"),
  description: z
    .string()
    .min(10, "Tell suppliers a little more (10 characters minimum)"),
  date: z.string().min(1, "Choose a delivery date"),
});
type RequirementInput = z.input<typeof requirementSchema>;
export function RequirementForm({ compact = false }: { compact?: boolean }) {
  const { state, update, notify } = useMarketplace();
  const router = useRouter();
  const params = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequirementInput, unknown, z.output<typeof requirementSchema>>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      title: params.get("product") || "",
      category: params.get("category") || "",
      quantity: params.get("quantity") || undefined,
      unit: "pieces",
      city: params.get("city") || state.profile.city,
      description: "",
      date: "",
    },
  });
  const submit = handleSubmit(async (values) => {
    const id = crypto.randomUUID();
    const success = await update((s) => ({
      ...s,
      leads: [
        {
          ...values,
          id,
          status: "Pending",
          price: 0,
          purchases: [],
          buyerName: s.profile.name,
          phone: s.profile.phone,
          email: s.profile.email,
        },
        ...s.leads,
      ],
      activity: [
        `${id} submitted for category matching and review.`,
        ...s.activity,
      ],
    }));
    if (!success) return;
    notify("Requirement submitted. Posting is free.");
    router.push("/buyer/requirements/" + id);
  });
  const field = (
    name: keyof RequirementInput,
    label: string,
    type = "text",
  ) => (
    <label className="ms-field" key={name}>
      {label}
      <input
        aria-label={label}
        type={type}
        {...register(name)}
        min={type === "number" ? 1 : undefined}
      />
      {errors[name] && (
        <small className="ms-error">{String(errors[name]?.message)}</small>
      )}
    </label>
  );
  return (
    <form className={"ms-form " + (compact ? "compact" : "")} onSubmit={submit}>
      <div className="ms-form-grid">
        {field("title", "What are you looking for?")}
        <label className="ms-field">
          Category
          <select aria-label="Category" {...register("category")}>
            <option value="">Select category</option>
            {state.categories.map((item) => {
              const c = item.name;
              return <option key={c}>{c}</option>;
            })}
          </select>
          {errors.category && (
            <small className="ms-error">{errors.category.message}</small>
          )}
        </label>
        {field("subcategory", "Subcategory (optional)")}
        {field("quantity", "Quantity", "number")}
        <label className="ms-field">
          Unit
          <select aria-label="Unit" {...register("unit")}>
            {["pieces", "kg", "tonnes", "litres", "metres", "sets"].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
        {field("budget", "Approximate budget (₹)", "number")}
        {field("city", "Delivery city")}
        {field("date", "Required by", "date")}
      </div>
      <label className="ms-field">
        Requirement details
        <textarea
          aria-label="Requirement details"
          {...register("description")}
          rows={compact ? 2 : 4}
          placeholder="Specifications, sizes, customisation, and delivery needs"
        />
        {errors.description && (
          <small className="ms-error">{errors.description.message}</small>
        )}
      </label>
      <p className="ms-form-note">
        Free for buyers. Your contact stays private until a relevant supplier
        unlocks the lead. Maximum 5 suppliers.
      </p>
      <Button type="submit" disabled={isSubmitting}>
        Post requirement — free
      </Button>
    </form>
  );
}
