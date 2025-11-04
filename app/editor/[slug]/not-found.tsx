import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4 text-black dark:text-white">
          Editor Not Found
        </h1>
        <p className="text-[#666666] dark:text-[#999999] mb-8">
          The editor you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="text-[#0070f3] hover:underline font-sans"
        >
          Return to homepage
        </Link>
      </div>
    </div>
  )
}

