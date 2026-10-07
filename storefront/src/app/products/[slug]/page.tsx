import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/product-detail";
import { CartDrawer } from "@/components/cart-drawer";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { variants: true } });
  if (!product) notFound();
  const serialized = { ...product, basePrice: product.basePrice.toString(), variants: product.variants.map((variant) => ({ ...variant, priceOverride: variant.priceOverride?.toString() ?? null })) };
  return <main className="mx-auto max-w-7xl px-6 py-10"><a href="/" className="text-sm text-stone-500">← Back to collection</a><div className="mt-8"><ProductDetail product={serialized} /></div><CartDrawer /></main>;
}
