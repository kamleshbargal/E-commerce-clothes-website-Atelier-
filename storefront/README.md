# StyleHub Storefront

Production-oriented Next.js App Router storefront scaffold using TypeScript, Tailwind CSS, Prisma, PostgreSQL, Zod, and Zustand.

## Setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`. For a pooler, use the pooled URL for `DATABASE_URL` and the direct database URL for `DIRECT_URL`.
3. Install dependencies:

```bash
npm install
```

4. Generate the Prisma client and create the database schema:

```bash
npm run db:generate
npx prisma migrate dev --name init
npm run db:seed
```

5. Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## API examples

```text
GET /api/products?page=1&limit=12&category=WOMEN&size=M&color=Forest&minPrice=500&maxPrice=2500
POST /api/cart/checkout
```

Checkout payload:

```json
{
  "items": [{ "variantId": "cl...", "quantity": 1 }]
}
```

The checkout route validates the payload with Zod, locks stock by conditional updates inside a Prisma transaction, calculates totals from variant prices, decrements inventory, and creates the order.

## Layout

```text
storefront/
|-- prisma/schema.prisma
|-- prisma/seed.ts
|-- src/app/
|   |-- api/products/route.ts
|   |-- api/cart/checkout/route.ts
|   |-- products/[slug]/page.tsx
|   |-- error.tsx
|   |-- loading.tsx
|   |-- layout.tsx
|   |-- page.tsx
|   `-- globals.css
|-- src/components/
|   |-- product-detail.tsx
|   |-- product-list.tsx
|   `-- cart-drawer.tsx
|-- src/lib/
|   |-- prisma.ts
|   |-- schemas.ts
|   `-- cart-store.ts
|-- next.config.ts
|-- tailwind.config.ts
`-- package.json
```
