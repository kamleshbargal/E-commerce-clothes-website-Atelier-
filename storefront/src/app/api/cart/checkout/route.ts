import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout payload", details: parsed.error.flatten() }, { status: 400 });

  try {
    const order = await prisma.$transaction(async (tx) => {
      const variants = await tx.variant.findMany({ where: { id: { in: parsed.data.items.map((item) => item.variantId) } }, include: { product: true } });
      const byId = new Map(variants.map((variant) => [variant.id, variant]));
      let totalAmount = new Prisma.Decimal(0);

      for (const item of parsed.data.items) {
        const variant = byId.get(item.variantId);
        if (!variant || variant.stockQuantity < item.quantity) throw new Error(`Insufficient stock for ${variant?.product.title ?? "a selected item"}`);
        totalAmount = totalAmount.plus((variant.priceOverride ?? variant.product.basePrice).mul(item.quantity));
      }

      for (const item of parsed.data.items) {
        const updated = await tx.variant.updateMany({ where: { id: item.variantId, stockQuantity: { gte: item.quantity } }, data: { stockQuantity: { decrement: item.quantity } } });
        if (updated.count !== 1) throw new Error("Stock changed. Please review your cart.");
      }

      return tx.order.create({ data: { userId: parsed.data.userId, totalAmount, items: { create: parsed.data.items.map((item) => { const variant = byId.get(item.variantId)!; return { productId: variant.productId, variantId: variant.id, quantity: item.quantity, unitPrice: variant.priceOverride ?? variant.product.basePrice }; }) } }, include: { items: true } });
    });
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 409 });
  }
}
