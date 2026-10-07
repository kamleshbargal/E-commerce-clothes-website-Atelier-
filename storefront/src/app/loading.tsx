export default function Loading() {
  return <main className="mx-auto max-w-7xl px-6 py-12" aria-label="Loading products"><div className="h-10 w-64 animate-pulse bg-stone-200" /><div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-96 animate-pulse bg-white" />)}</div></main>;
}
