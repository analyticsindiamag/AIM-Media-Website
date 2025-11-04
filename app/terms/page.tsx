import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.staticPage.findUnique({
    where: { slug: 'terms' },
  })

  if (!page) {
    return {
      title: 'Terms of Service',
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    alternates: {
      canonical: '/terms',
    },
  }
}

export default async function TermsPage() {
  const page = await prisma.staticPage.findUnique({
    where: { slug: 'terms' },
  })

  if (!page) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="wsj-container py-8 md:py-12">
        <article className="max-w-4xl mx-auto">
          <h1 className="font-serif font-bold text-[var(--wsj-font-size-4xl)] md:text-[var(--wsj-font-size-5xl)] mb-6 text-[var(--wsj-text-black)]">
            {page.title}
          </h1>
          <div 
            className="prose prose-lg max-w-none font-serif text-[var(--wsj-text-dark-gray)] leading-[var(--wsj-line-height-loose)]"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </div>
  )
}


