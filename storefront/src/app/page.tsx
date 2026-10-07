import Link from "next/link";
import { ProductList } from "@/components/product-list";

export default async function Home() {
  return <main><header className="flex items-center justify-between bg-[#213b38] px-6 py-5 text-white lg:px-16"><Link href="/" className="font-serif text-2xl">StyleHub</Link><nav className="flex gap-5 text-sm"><Link href="/#collection">Collection</Link><Link href="/cart">Cart</Link></nav></header><section className="bg-[#213b38] px-6 pb-20 pt-16 text-white lg:px-16"><p className="text-xs uppercase tracking-[0.2em] text-[#e8c9a8]">The new everyday</p><h1 className="mt-4 max-w-3xl font-serif text-6xl">Considered clothes for every kind of day.</h1><p className="mt-5 max-w-xl text-stone-200">Easy layers, clean silhouettes, and pieces made to move with your week.</p></section><section id="collection" className="mx-auto max-w-7xl px-6 py-16"><p className="text-xs uppercase tracking-[0.2em] text-[#b85037]">Curated for you</p><h2 className="mt-2 font-serif text-5xl">Shop the collection</h2><div className="mt-10"><ProductList /></div></section></main>;
}
