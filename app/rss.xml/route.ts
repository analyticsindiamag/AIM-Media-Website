import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Tech News'

  // Get latest 20 published articles
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      category: true,
      editor: true,
    },
  })

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${baseUrl}</link>
    <description>Latest AI and Technology News</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${articles
      .map(
        (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/article/${article.slug}</link>
      <guid>${baseUrl}/article/${article.slug}</guid>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <pubDate>${article.publishedAt?.toUTCString() || new Date().toUTCString()}</pubDate>
      <author>${article.editor.name}</author>
      <category>${article.category.name}</category>
      ${
        article.featuredImage
          ? `<enclosure url="${article.featuredImage}" type="image/jpeg"/>`
          : ''
      }
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  })
}

