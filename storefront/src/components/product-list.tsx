"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Product = { id: string; slug: string; title: string; basePrice: string; category: string; images: string[] };
const sizes = ["S", "M", "L", "XL", "XXL"];
const categories = ["", "MEN", "WOMEN", "KIDS", "FOOTWEAR", "JEWELLERY", "UNISEX"];

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (category) params.set("category", category);
    if (size) params.set("size", size);
    if (color) params.set("color", color);
    params.set("maxPrice", String(maxPrice));
    fetch(`/api/products?${params}`).then((response) => response.json()).then((result) => { setProducts(result.data ?? []); setTotalPages(result.pagination?.totalPages ?? 1); });
  }, [category, size, color, maxPrice, page]);

  function updateFilter(setter: (value: string) => void, value: string) { setter(value); setPage(1); }

  return <div className="grid gap-10 lg:grid-cols-[220px_1fr]"><aside className="space-y-6"><h2 className="font-serif text-2xl">Filter by</h2><label className="block text-sm">Category<select className="mt-2 w-full border p-2" value={category} onChange={(event) => updateFilter(setCategory, event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item || "All categories"}</option>)}</select></label><label className="block text-sm">Size<select className="mt-2 w-full border p-2" value={size} onChange={(event) => updateFilter(setSize, event.target.value)}><option value="">All sizes</option>{sizes.map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-sm">Color<input className="mt-2 w-full border p-2" value={color} onChange={(event) => updateFilter(setColor, event.target.value)} placeholder="e.g. Forest" /></label><label className="block text-sm">Up to ₹{maxPrice}<input className="mt-3 w-full accent-[#b85037]" type="range" min="0" max="5000" step="100" value={maxPrice} onChange={(event) => updateFilter(setMaxPrice, event.target.value)} /></label></aside><section><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <Link href={`/products/${product.slug}`} key={product.id} className="bg-white pb-4"><Image src={product.images[0]} alt={product.title} width={600} height={750} className="aspect-[4/5] w-full object-cover" /><div className="p-4"><p className="text-xs uppercase tracking-widest text-[#b85037]">{product.category}</p><h3 className="mt-2 font-serif text-xl">{product.title}</h3><p className="mt-3">₹{product.basePrice}</p></div></Link>)}</div>{products.length === 0 && <p className="py-12 text-stone-500">No products match these filters.</p>}<div className="mt-8 flex items-center justify-between"><button className="border px-4 py-2 disabled:opacity-40" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm text-stone-500">Page {page} of {totalPages}</span><button className="border px-4 py-2 disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button></div></section></div>;
}
