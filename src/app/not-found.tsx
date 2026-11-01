import Link from "next/link";
import SiteLayout from "./(site)/layout";

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="flex min-h-[85vh] flex-col justify-end px-5 pb-16 pt-24 sm:px-8 lg:px-12">
        <div className="border-t border-ink/10 pt-5">
          <p className="text-[13px] font-semibold">
            <span className="text-accent">(404)</span>{" "}
            <span className="text-muted">Page not found</span>
          </p>
          <h1 className="display mt-4 text-[clamp(3rem,13vw,11rem)] uppercase leading-[0.85]">
            This cup <em>is empty.</em>
          </h1>
          <p className="mt-6 max-w-md text-muted">
            The page you’re looking for has wandered off. Let’s get you back to
            the good stuff.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/"
              className="flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-bg"
            >
              Back home
            </Link>
            <Link
              href="/menu"
              className="flex h-12 items-center rounded-full px-6 text-sm font-semibold ring-1 ring-ink/20"
            >
              See the menu
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
