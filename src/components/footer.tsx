import Link from "next/link";

// Site-wide footer with quick navigation.
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-gray-500">
        <span>© Page Builder</span>
        <nav className="flex items-center gap-6">
          <Link href="/" className="transition-colors hover:text-gray-800">
            Home
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-gray-800">
            Pricing
          </Link>
          <Link href="/contact" className="transition-colors hover:text-gray-800">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
