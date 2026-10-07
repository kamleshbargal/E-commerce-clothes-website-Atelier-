"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center px-6 text-center"><div><p className="mb-3 text-sm uppercase tracking-[0.2em] text-[#b85037]">Something went wrong</p><h1 className="text-4xl">We could not load this page.</h1><button className="mt-6 bg-[#213b38] px-5 py-3 text-white" onClick={() => reset()}>Try again</button></div></main>;
}
