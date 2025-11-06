import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen">
      <div className="wsj-container py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif font-bold text-[var(--wsj-font-size-4xl)] md:text-[var(--wsj-font-size-5xl)] mb-4 text-[var(--wsj-text-black)]">
            Page Not Found
          </h1>
          <p className="text-[var(--wsj-font-size-md)] text-[var(--wsj-text-dark-gray)] mb-8 font-serif">
            The page you're looking for doesn't exist.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-[var(--wsj-blue-primary)] text-white font-sans font-medium hover:bg-[var(--wsj-blue-hover)] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}







