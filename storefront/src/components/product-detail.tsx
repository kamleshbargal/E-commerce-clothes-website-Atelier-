"use client";

import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type Variant = { id: string; size: "S" | "M" | "L" | "XL" | "XXL"; color: string; stockQuantity: number; priceOverride: string | null };
type Product = { title: string; description: string; basePrice: string; images: string[]; variants: Variant[] };

export function ProductDetail({ product }: { product: Product }) {
  const [size, setSize] = useState<Variant["size"] | "">("");
  const [color, setColor] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const sizes = [...new Set(product.variants.map((variant) => variant.size))];
  const colors = [...new Set(product.variants.map((variant) => variant.color))];
  const selected = product.variants.find((variant) => variant.size === size && variant.color === color);
  const price = selected?.priceOverride ?? product.basePrice;

  return <div className="grid gap-10 lg:grid-cols-2"><div className="grid grid-cols-2 gap-3">{product.images.map((image) => <Image key={image} src={image} alt={product.title} width={800} height={1000} className="w-full object-cover" priority />)}</div><div className="py-4"><p className="text-sm uppercase tracking-[0.2em] text-[#b85037]">StyleHub edit</p><h1 className="mt-3 text-5xl">{product.title}</h1><p className="mt-4 text-2xl">₹{price}</p><p className="mt-6 leading-7 text-stone-600">{product.description}</p><fieldset className="mt-8"><legend className="mb-3 font-bold">Size</legend><div className="flex flex-wrap gap-2">{sizes.map((option) => <button type="button" key={option} onClick={() => setSize(option)} className={`border px-4 py-2 ${size === option ? "border-[#213b38] bg-[#213b38] text-white" : "border-stone-300"}`}>{option}</button>)}</div></fieldset><fieldset className="mt-6"><legend className="mb-3 font-bold">Color</legend><div className="flex flex-wrap gap-2">{colors.map((option) => <button type="button" key={option} onClick={() => setColor(option)} className={`border px-4 py-2 ${color === option ? "border-[#213b38] bg-[#213b38] text-white" : "border-stone-300"}`}>{option}</button>)}</div></fieldset><p className="mt-6 text-sm">{selected ? selected.stockQuantity > 0 ? `${selected.stockQuantity} available` : "Out of stock" : "Select a size and color"}</p><button type="button" disabled={!selected || selected.stockQuantity < 1} onClick={() => selected && addItem({ variantId: selected.id, title: product.title, size: selected.size, color: selected.color, price: Number(price), quantity: 1 })} className="mt-5 w-full bg-[#b85037] px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Add to cart</button></div></div>;
}
