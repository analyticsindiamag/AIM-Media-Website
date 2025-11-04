import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.staticPage.findUnique({
    where: { slug: 'contact' },
  })

  if (!page) {
    return {
      title: 'Contact',
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    alternates: {
      canonical: '/contact',
    },
  }
}

export default async function ContactPage() {
  const page = await prisma.staticPage.findUnique({
    where: { slug: 'contact' },
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


