import { z } from "zod";

export const productQuerySchema = z.object({
  category: z.enum(["MEN", "WOMEN", "KIDS", "FOOTWEAR", "JEWELLERY", "UNISEX"]).optional(),
  size: z.enum(["S", "M", "L", "XL", "XXL"]).optional(),
  color: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().finite().nonnegative().optional(),
  maxPrice: z.coerce.number().finite().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).refine((value) => value.maxPrice === undefined || value.minPrice === undefined || value.maxPrice >= value.minPrice, {
  message: "maxPrice must be greater than or equal to minPrice",
  path: ["maxPrice"],
});

export const checkoutSchema = z.object({
  userId: z.string().cuid().optional(),
  items: z.array(z.object({
    variantId: z.string().cuid(),
    quantity: z.number().int().positive().max(99),
  })).min(1),
});
