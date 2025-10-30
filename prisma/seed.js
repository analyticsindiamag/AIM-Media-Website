/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function unsplash(id, { w = 1600, h = 900, q = 80 } = {}) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`
}

async function main() {
  // Basic settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'AI Tech News',
      logoUrl: null,
      navLinksJson: JSON.stringify([
        { label: 'Home', href: '/' },
        { label: 'Enterprise AI', href: '/category/enterprise-ai' },
        { label: 'AI Startups', href: '/category/ai-startups' },
      ]),
      footerLinksJson: JSON.stringify([
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ]),
      subscribeCta: 'Join 10,000+ readers for weekly AI updates.',
    },
  })

  // Editors
  const [editorA, editorB] = await Promise.all([
    prisma.editor.upsert({
      where: { email: 'sara@aitechnews.com' },
      update: {},
      create: {
        name: 'Sara Patel',
        email: 'sara@aitechnews.com',
        bio: 'Editor covering enterprise AI, platforms, and governance.',
        avatar: unsplash('photo-1531123414780-f74287bb7a5d', { w: 256, h: 256, q: 80 }),
      },
    }),
    prisma.editor.upsert({
      where: { email: 'luis@aitechnews.com' },
      update: {},
      create: {
        name: 'Luis Hernandez',
        email: 'luis@aitechnews.com',
        bio: 'Covers AI startups, product launches, and funding rounds.',
        avatar: unsplash('photo-1527980965255-d3b416303d12', { w: 256, h: 256, q: 80 }),
      },
    }),
  ])

  // Categories
  const [enterpriseAI, aiStartups, research, tools] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'enterprise-ai' },
      update: {},
      create: {
        name: 'Enterprise AI',
        slug: 'enterprise-ai',
        description: 'Platforms, governance, and adoption in large organizations.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-startups' },
      update: {},
      create: {
        name: 'AI Startups',
        slug: 'ai-startups',
        description: 'Early-stage innovations, funding, and product launches.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'research' },
      update: {},
      create: {
        name: 'Research',
        slug: 'research',
        description: 'Breakthroughs from academia and industry labs.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-tools' },
      update: {},
      create: {
        name: 'AI Tools',
        slug: 'ai-tools',
        description: 'Practical tools and frameworks for builders.',
      },
    }),
  ])

  // Helper to create an article
  async function createArticle(data) {
    return prisma.article.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    })
  }

  const now = new Date()
  const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

  // Hero featured article
  await createArticle({
    title: 'Enterprise genAI moves from pilots to platforms',
    slug: 'enterprise-genai-moves-from-pilots-to-platforms',
    excerpt: 'A wave of platform standardization is turning bespoke pilots into governed, scalable AI capabilities.',
    content:
      'Enterprises are consolidating around a smaller set of AI platforms with unified security, monitoring, and governance... ',
    featuredImage: unsplash('photo-1506744038136-46273834b3fb', { w: 1600, h: 900 }),
    published: true,
    publishedAt: daysAgo(1),
    readTime: 6,
    featured: true,
    categoryId: enterpriseAI.id,
    editorId: editorA.id,
    metaTitle: 'Enterprise genAI platforms',
    metaDescription: 'From pilots to platforms in enterprise AI',
  })

  // Sidebar/general recent articles
  await Promise.all([
    createArticle({
      title: 'Startup raises $18M to bring AI to edge cameras',
      slug: 'startup-raises-18m-ai-edge-cameras',
      excerpt: 'Low-power vision models hit production in logistics and retail.',
      content: 'Edge AI startups are optimizing models for constrained environments...',
      featuredImage: unsplash('photo-1518779578993-ec3579fee39f', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(2),
      readTime: 4,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'RLHF beyond chat: aligning agents with business workflows',
      slug: 'rlhf-beyond-chat-aligning-agents',
      excerpt: 'Alignment techniques are moving into task planners and tool-using agents.',
      content: 'Reinforcement learning from human feedback is being adapted to multi-step agents...',
      featuredImage: unsplash('photo-1498050108023-c5249f4df085', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(3),
      readTime: 7,
      featured: false,
      categoryId: research.id,
      editorId: editorA.id,
    }),
    createArticle({
      title: 'New vector DB adds hybrid search with low-latency filters',
      slug: 'vector-db-hybrid-search-low-latency',
      excerpt: 'Developers get vector + keyword search with millisecond latencies.',
      content: 'Hybrid search approaches combine lexical and semantic retrieval to improve relevance...',
      featuredImage: unsplash('photo-1518770660439-4636190af475', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(4),
      readTime: 5,
      featured: false,
      categoryId: tools.id,
      editorId: editorB.id,
    }),
  ])

  // Enterprise AI section (3)
  await Promise.all([
    createArticle({
      title: 'Model observability lands in traditional APM suites',
      slug: 'model-observability-in-apm',
      excerpt: 'Vendors add prompt, token, and latency traces alongside app metrics.',
      content: 'As AI traffic scales, enterprises need unified telemetry across services and models...',
      featuredImage: unsplash('photo-1518770660439-4636190af475', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(5),
      readTime: 5,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
    createArticle({
      title: 'Procurement frameworks emerge for foundation models',
      slug: 'procurement-frameworks-for-foundation-models',
      excerpt: 'Legal teams standardize risk reviews for faster adoption.',
      content: 'Standard questionnaires and bakeoffs are replacing ad hoc model selection...',
      featuredImage: unsplash('photo-1556157382-97eda2d62296', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(6),
      readTime: 6,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
    createArticle({
      title: 'Guardrails shift left with policy-as-code',
      slug: 'guardrails-shift-left-policy-as-code',
      excerpt: 'Platform teams template prompts, red-teaming, and approval flows.',
      content: 'Policy-as-code brings repeatability to AI risk controls...',
      featuredImage: unsplash('photo-1516259762381-22954d7d3ad2', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(7),
      readTime: 5,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
  ])

  // AI Startups section (4)
  await Promise.all([
    createArticle({
      title: 'Stealth AI note-taker hits GA with SOC2 Type II',
      slug: 'ai-note-taker-ga-soc2',
      excerpt: 'Sales and success teams push for compliant, accurate summaries.',
      content: 'Accuracy on action items and ownership is becoming the decisive factor...',
      featuredImage: unsplash('photo-1519389950473-47ba0277781c', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(8),
      readTime: 4,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Agents for finance automate reconciliations at mid-market scale',
      slug: 'agents-for-finance-automate-reconciliations',
      excerpt: 'Template-driven playbooks reduce human review by 60%.',
      content: 'Composable agents are proving reliable on structured, auditable tasks...',
      featuredImage: unsplash('photo-1521791136064-7986c2920216', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(9),
      readTime: 6,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Foundation model inference hits the browser for RAG demos',
      slug: 'foundation-model-inference-in-browser',
      excerpt: 'WebGPU unlocks fast local experiments for dev advocacy teams.',
      content: 'Client-side inference enables low-latency demos without sending data to servers...',
      featuredImage: unsplash('photo-1498050108023-c5249f4df085', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(10),
      readTime: 5,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Privacy-first analytics startup launches synthetic data SDK',
      slug: 'privacy-first-analytics-synthetic-data-sdk',
      excerpt: 'Product teams test without touching PII using statistical twins.',
      content: 'Synthetic data techniques are moving from research to developer tooling...',
      featuredImage: unsplash('photo-1492724441997-5dc865305da7', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(11),
      readTime: 5,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
  ])

  console.log('✅ Seeded: settings, editors, categories, and articles')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


