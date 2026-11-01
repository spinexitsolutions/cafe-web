import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="display text-[10rem] italic leading-none text-accent">404</p>
      <h1 className="display mt-4 text-5xl">This cup is empty.</h1>
      <p className="mt-3 text-muted">The page you’re looking for has wandered off. Let’s get you back to the good stuff.</p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg">Back home</Link>
    </div>
  );
}
