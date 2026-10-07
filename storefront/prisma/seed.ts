import { PrismaClient, Category, Size } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { slug: "essential-crewneck-sweatshirt" },
    update: {},
    data: {
      slug: "essential-crewneck-sweatshirt",
      title: "Essential Crewneck Sweatshirt",
      description: "A soft, heavyweight layer for cool mornings and slow weekends.",
      basePrice: 999,
      category: Category.MEN,
      images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85"],
      variants: {
        create: ["S", "M", "L", "XL"].map((size, index) => ({ size: size as Size, color: "Forest", sku: `STYLE-SWEAT-${size}`, stockQuantity: 12 - index })),
      },
    },
  });
}

main().finally(() => prisma.$disconnect());
