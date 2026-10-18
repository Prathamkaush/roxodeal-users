# Roxodeal Users

Independent Next.js application. All components, styles, data, assets and configuration belong to this folder. No imports from another frontend.

The Roxodeal homepage follows the supplied navy and gold reference: recreated R logo, manufacturing hero, industry cards, quick RFQ, supplier listings and wholesale products. The RFQ carries its inputs into the full requirement form. The header and footer apply this branding across public pages, with responsive navigation for mobile.

```powershell
cd users
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000. Set the other frontend origins using `.env.local` (see `.env.example`) before building for deployment. The application uses the backend configured through `NEXT_PUBLIC_API_URL`. Account sessions are stored per frontend origin.

## Vercel

When deploying the whole repository, set this Vercel project's Root Directory to `users`. Its `vercel.json` selects Next.js, `npm ci`, and `npm run build`. Output Directory uses the Next.js default. For a users-only repository, use its repository root instead.

Commit the complete application, including `tsconfig.json`, `package-lock.json`, and `components/panel-shell.tsx`. The import alias `@/*` maps to this application's root (`baseUrl: "."`, `paths: { "@/*": ["./*"] }`), not to `src/` or another frontend. File and directory case must match imports on Linux. Push the updated files and deploy the new commit.

Seller-related buttons in this users app open `https://mandisetu-sellers.vercel.app/seller/dashboard`, including Sell With Us, seller workspace access, and seller verification links. Set `NEXT_PUBLIC_ADMIN_URL` to the deployed admin HTTPS origin in Vercel before building. Each frontend has its own Vercel project and configuration.

## Buyer sourcing and support

- `/buyer/requirements/create`: free category-matched marketplace requirement, with up to five supplier unlocks.
- `/buyer/quotes/create?productId=...&sellerId=...`: product quotation sent only to that supplier; the supplier/product relationship is checked on the backend.
- `/buyer/enquiries/create?sellerId=...`: general business question sent only to that supplier.
- `/buyer/enquiries`: quote/enquiry history and supplier responses.
- `/contact`: support message with a saved reference.
- `/buyer/feedback`: private feedback and public review submission.
- `/reviews` (and `/feedback` alias): read-only submitted platform reviews; the homepage highlights recent platform reviews. Product/supplier pages retain target-specific reviews.
- The buyer header searches workspace records and deletes notifications through an owner-scoped backend action.

Apply backend migrations before deploying these flows. Rebuild/restart the backend, users, and seller apps so sellers receive the quote context and quantities. To run the mocked browser smoke check, start the users production server at port 3100 and run `node users/artifacts/buyer-ui-smoke.cjs` from the repository root. It intercepts API writes and submits no real messages.

Buyer requirements can be marked Closed or Fully Sold and deleted from the buyer list. Deletion retains related transaction records and prevents new supplier unlocks. Quotes/enquiries and saved products use searchable, filtered tables with pagination and loading shimmers. The public product catalogue initially renders 12 products in four desktop columns, then appends four per settled scroll near the end; Load 4 more is also available.
