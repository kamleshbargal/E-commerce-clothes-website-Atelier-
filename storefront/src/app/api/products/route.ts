import { NextRequest, NextResponse } from "next/server";
import { Prisma, Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productQuerySchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const parsed = productQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid filters", details: parsed.error.flatten() }, { status: 400 });

  const { category, size, color, minPrice, maxPrice, page, limit } = parsed.data;
  const where: Prisma.ProductWhereInput = {
    ...(category ? { category: category as Category } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined ? { basePrice: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } } : {}),
    ...(size || color ? { variants: { some: { ...(size ? { size } : {}), ...(color ? { color: { equals: color, mode: "insensitive" } } : {}) } } } : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, include: { variants: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
