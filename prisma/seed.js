/* eslint-disable no-console */
/* eslint-disable no-console-Testing */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function unsplash(id, { w = 1600, h = 900, q = 80 } = {}) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  // Basic settings - includes all new fields
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'AI Tech News',
      logoUrl: null,
      navLinksJson: JSON.stringify([
        { label: 'TECH', href: '/category/tech' },
        { label: 'AI', href: '/category/ai' },
        { label: 'STARTUPS', href: '/category/ai-startups' },
        { label: 'OPINION', href: '/category/opinion' },
        { label: 'AI TOOLS', href: '/category/ai-tools' },
        { label: 'ENTERPRISE AI', href: '/category/enterprise-ai' },
        { label: 'RESEARCH', href: '/category/research' },
      ]),
      footerLinksJson: JSON.stringify([
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ]),
      subscribeCta: 'Join 10,000+ readers for weekly AI updates.',
      headerBarLeftText: 'AI',
      headerBarLeftLink: '/category/ai',
      headerBarRightText: 'AI TECH NEWS | Tech',
      headerBarRightLink: '/',
    },
  })

  // Editors - more diverse team
  const [editorA, editorB, editorC, editorD] = await Promise.all([
    prisma.editor.upsert({
      where: { email: 'sara@aitechnews.com' },
      update: {
        slug: generateSlug('Sara Patel'), // Ensure slug is set on update too
      },
      create: {
        name: 'Sara Patel',
        email: 'sara@aitechnews.com',
        slug: generateSlug('Sara Patel'),
        bio: 'Senior editor covering enterprise AI, platforms, and governance.',
        avatar: unsplash('photo-1531123414780-f74287bb7a5d', { w: 256, h: 256, q: 80 }),
      },
    }),
    prisma.editor.upsert({
      where: { email: 'luis@aitechnews.com' },
      update: {
        slug: generateSlug('Luis Hernandez'), // Ensure slug is set on update too
      },
      create: {
        name: 'Luis Hernandez',
        email: 'luis@aitechnews.com',
        slug: generateSlug('Luis Hernandez'),
        bio: 'Reports on AI startups, product launches, and funding rounds.',
        avatar: unsplash('photo-1527980965255-d3b416303d12', { w: 256, h: 256, q: 80 }),
      },
    }),
    prisma.editor.upsert({
      where: { email: 'emma@aitechnews.com' },
      update: {
        slug: generateSlug('Emma Chen'), // Ensure slug is set on update too
      },
      create: {
        name: 'Emma Chen',
        email: 'emma@aitechnews.com',
        slug: generateSlug('Emma Chen'),
        bio: 'Tech reporter specializing in AI research and breakthroughs.',
        avatar: unsplash('photo-1573496359142-b8d87734a5a2', { w: 256, h: 256, q: 80 }),
      },
    }),
    prisma.editor.upsert({
      where: { email: 'michael@aitechnews.com' },
      update: {
        slug: generateSlug('Michael Thompson'), // Ensure slug is set on update too
      },
      create: {
        name: 'Michael Thompson',
        email: 'michael@aitechnews.com',
        slug: generateSlug('Michael Thompson'),
        bio: 'Opinion columnist and analyst covering AI policy and ethics.',
        avatar: unsplash('photo-1507003211169-0a1dd7228f2d', { w: 256, h: 256, q: 80 }),
      },
    }),
  ])

  // Categories - expanded list with new schema fields (bannerImage, order)
  const [tech, ai, aiStartups, opinion, tools, enterpriseAI, research] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tech' },
      update: {},
      create: {
        name: 'Tech',
        slug: 'tech',
        description: 'General technology news and innovation.',
        bannerImage: unsplash('photo-1518770660439-4636190af475', { w: 1600, h: 400 }),
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ai' },
      update: {},
      create: {
        name: 'AI',
        slug: 'ai',
        description: 'Artificial intelligence breakthroughs and trends.',
        bannerImage: unsplash('photo-1677442136019-21780ecad995', { w: 1600, h: 400 }),
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-startups' },
      update: {},
      create: {
        name: 'AI Startups',
        slug: 'ai-startups',
        description: 'Early-stage innovations, funding, and product launches.',
        bannerImage: unsplash('photo-1551288049-bebda4e38f71', { w: 1600, h: 400 }),
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'opinion' },
      update: {},
      create: {
        name: 'Opinion',
        slug: 'opinion',
        description: 'Editorial perspectives on AI and technology.',
        bannerImage: unsplash('photo-1451187580459-43490279c0fa', { w: 1600, h: 400 }),
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-tools' },
      update: {},
      create: {
        name: 'AI Tools',
        slug: 'ai-tools',
        description: 'Practical tools and frameworks for builders.',
        bannerImage: unsplash('photo-1555949963-aa79dcee981c', { w: 1600, h: 400 }),
        order: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'enterprise-ai' },
      update: {},
      create: {
        name: 'Enterprise AI',
        slug: 'enterprise-ai',
        description: 'Platforms, governance, and adoption in large organizations.',
        bannerImage: unsplash('photo-1506744038136-46273834b3fb', { w: 1600, h: 400 }),
        order: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'research' },
      update: {},
      create: {
        name: 'Research',
        slug: 'research',
        description: 'Breakthroughs from academia and industry labs.',
        bannerImage: unsplash('photo-1532619675605-1ede6c002ed6', { w: 1600, h: 400 }),
        order: 7,
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
  const hoursAgo = (n) => new Date(now.getTime() - n * 60 * 60 * 1000)

  // Featured hero article (today) - with all new image SEO fields
  await createArticle({
    title: 'Startup raises $18M to bring AI to edge cameras',
    slug: 'startup-raises-18m-ai-edge-cameras',
    excerpt: 'Low-power vision models hit production in logistics and retail.',
    content: `Edge AI startups are optimizing models for constrained environments. VisionAI, a San Francisco-based company, announced today it has raised $18 million in Series A funding to deploy low-power computer vision models directly on edge cameras.

The funding round was led by Accel Partners with participation from Sequoia Capital and existing investors. The company's technology enables real-time object detection and tracking on cameras without requiring cloud connectivity.

"Traditional cloud-based AI systems introduce latency and privacy concerns," said CEO Sarah Kim. "Our edge models run inference in under 50 milliseconds while consuming less than 2 watts of power."

Early customers include major logistics companies using VisionAI's technology for warehouse automation and retail chains deploying smart inventory tracking systems. The company claims their models reduce cloud costs by 80% while improving response times.

The Series A will be used to expand the engineering team and build partnerships with camera manufacturers. VisionAI is currently hiring for roles in model optimization and edge deployment.

Industry analysts note that edge AI is becoming a key differentiator as companies seek to reduce dependency on cloud infrastructure while maintaining real-time capabilities. The market for edge AI hardware is projected to reach $65 billion by 2028.`,
    featuredImage: unsplash('photo-1518779578993-ec3579fee39f', { w: 1600, h: 900 }),
    featuredImageTitle: 'Edge AI Camera Technology',
    featuredImageCaption: 'VisionAI\'s edge camera technology enables real-time AI processing without cloud connectivity.',
    featuredImageDescription: 'Close-up view of an edge AI camera device showing the processing unit and camera module.',
    featuredImageAltText: 'Edge AI camera device with integrated processing unit for on-device computer vision',
    published: true,
    publishedAt: hoursAgo(6),
    readTime: 4,
    featured: true,
    categoryId: aiStartups.id,
    editorId: editorB.id,
    metaTitle: 'VisionAI raises $18M for edge camera AI',
    metaDescription: 'Startup brings low-power vision models to production cameras for logistics and retail.',
  })

  // Recent articles (last 2 days)
  await Promise.all([
    createArticle({
      title: 'RLHF beyond chat: aligning agents with business workflows',
      slug: 'rlhf-beyond-chat-aligning-agents',
      excerpt: 'Alignment techniques are moving into task planners and tool-using agents.',
      content: `Reinforcement learning from human feedback (RLHF) is being adapted beyond chat applications to multi-step agents that interact with business systems.

Researchers at OpenAI and Anthropic have published papers demonstrating how RLHF can be applied to agents that execute complex workflows involving multiple API calls, database queries, and decision points.

The key challenge is ensuring agents remain aligned with business objectives over long sequences of actions. Traditional RLHF worked well for conversational interfaces where each response could be evaluated independently.

New techniques involve hierarchical reward modeling, where agents receive feedback at both the task level and individual step level. This allows fine-grained control over agent behavior while maintaining overall goal alignment.

Early adopters include customer service platforms and sales automation tools. One company reported a 40% reduction in error rates after implementing RLHF-aligned agents.

The research suggests that as agents become more capable of autonomous operation, alignment techniques will need to evolve from simple preference ranking to sophisticated multi-objective optimization.`,
      featuredImage: unsplash('photo-1498050108023-c5249f4df085', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(1),
      readTime: 7,
      featured: false,
      categoryId: research.id,
      editorId: editorC.id,
    }),
    createArticle({
      title: 'New vector DB adds hybrid search with low-latency filters',
      slug: 'vector-db-hybrid-search-low-latency',
      excerpt: 'Developers get vector + keyword search with millisecond latencies.',
      content: `Vectrix, a new vector database startup, announced general availability of their platform featuring hybrid search capabilities that combine semantic and keyword-based retrieval.

The database achieves sub-10ms query latency even with complex filters applied to large-scale vector collections. This makes it suitable for real-time RAG applications and recommendation systems.

"Most vector databases force you to choose between semantic search and structured filtering," said co-founder Alex Rodriguez. "We've built an architecture that gives you both without sacrificing performance."

The platform uses a novel indexing structure that maintains separate indexes for vectors and metadata, then combines results efficiently at query time. Early benchmarks show 3x faster queries compared to existing solutions.

Beta customers include e-commerce platforms using Vectrix for product search and content platforms building personalized discovery experiences. The company has raised $12 million in seed funding from Y Combinator and General Catalyst.

Developers can start using Vectrix through a managed cloud service or self-hosted option. The API is compatible with existing vector database clients, making migration straightforward.`,
      featuredImage: unsplash('photo-1518770660439-4636190af475', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(1),
      readTime: 5,
      featured: false,
      categoryId: tools.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Model observability lands in traditional APM suites',
      slug: 'model-observability-in-apm',
      excerpt: 'Vendors add prompt, token, and latency traces alongside app metrics.',
      content: `Application performance monitoring (APM) vendors are rapidly integrating AI model observability into their existing platforms, creating unified views of application and AI performance.

Datadog, New Relic, and Dynatrace have all released updates this quarter that add AI-specific telemetry including prompt tracing, token usage tracking, and model latency metrics. This allows teams to correlate AI performance with application behavior.

"AI workloads have unique characteristics that don't fit traditional APM models," said Priya Sharma, product lead at Datadog. "We're seeing teams struggle to debug issues when AI calls span multiple services and models."

The new capabilities include prompt-to-response tracing, cost attribution by model and endpoint, and anomaly detection for model performance degradation. This helps teams identify when models are returning unexpected results or taking longer than normal.

Enterprise customers are particularly interested in tracking costs as AI usage scales. One financial services company reduced their AI infrastructure costs by 30% after implementing comprehensive observability.

The integration of AI observability into existing APM tools marks a shift from specialized AI monitoring vendors to unified platforms that can handle both traditional and AI workloads.`,
      featuredImage: unsplash('photo-1551288049-bebda4e38f71', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(2),
      readTime: 5,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
  ])

  // Enterprise AI articles (3-7 days ago)
  await Promise.all([
    createArticle({
      title: 'Enterprise genAI moves from pilots to platforms',
      slug: 'enterprise-genai-moves-from-pilots-to-platforms',
      excerpt: 'A wave of platform standardization is turning bespoke pilots into governed, scalable AI capabilities.',
      content: `Enterprises are consolidating around a smaller set of AI platforms with unified security, monitoring, and governance capabilities. The shift from proof-of-concept pilots to production platforms represents a maturing market.

Companies like Microsoft, AWS, and Google are seeing increased adoption of their unified AI platforms as enterprises seek to reduce complexity and standardize on a single stack. This consolidation is driven by the need for consistent security policies, cost management, and compliance controls.

"Early adopters experimented with multiple AI services and tools," said research director James Park. "Now they're standardizing on platforms that provide end-to-end governance."

The platform approach includes unified authentication, audit logging, cost tracking, and policy enforcement across all AI services. This allows IT teams to maintain control while enabling business units to deploy AI applications.

Leading enterprises report that platform standardization has reduced time-to-production for new AI applications by 60% while improving security posture. The trend is expected to accelerate as more companies move beyond experimental use cases.

However, some organizations are maintaining multi-cloud strategies for redundancy and risk mitigation. The challenge is balancing standardization with flexibility.`,
      featuredImage: unsplash('photo-1506744038136-46273834b3fb', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(3),
      readTime: 6,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
    createArticle({
      title: 'Procurement frameworks emerge for foundation models',
      slug: 'procurement-frameworks-for-foundation-models',
      excerpt: 'Legal teams standardize risk reviews for faster adoption.',
      content: `Corporate legal and procurement teams are developing standardized frameworks for evaluating and approving foundation model providers, streamlining a process that previously required extensive custom reviews.

The frameworks include standardized questionnaires covering data privacy, security certifications, liability terms, and usage restrictions. This allows companies to evaluate multiple providers more efficiently while maintaining risk controls.

"Every procurement review used to take weeks," said general counsel Maria Santos. "Now we can complete evaluations in days using our standardized framework."

Common elements include requirements for SOC 2 Type II certification, data processing agreements, and indemnification clauses. Companies are also establishing acceptable use policies that define which model capabilities can be used for different business functions.

The frameworks are particularly important for regulated industries like healthcare and finance, where model selection requires careful risk assessment. Some companies are maintaining approved vendor lists that teams can use without additional review.

Industry groups are working to create shared frameworks that multiple companies can adopt, reducing redundant work across the ecosystem. However, many companies are keeping their frameworks proprietary for competitive reasons.`,
      featuredImage: unsplash('photo-1556157382-97eda2d62296', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(4),
      readTime: 6,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
    createArticle({
      title: 'Guardrails shift left with policy-as-code',
      slug: 'guardrails-shift-left-policy-as-code',
      excerpt: 'Platform teams template prompts, red-teaming, and approval flows.',
      content: `Platform engineering teams are adopting policy-as-code approaches to implement AI guardrails earlier in the development lifecycle, moving from reactive monitoring to proactive prevention.

Using tools like Open Policy Agent and custom frameworks, teams are encoding safety policies, content filters, and approval workflows directly into infrastructure-as-code configurations. This allows guardrails to be tested alongside application code.

"Policy-as-code ensures that guardrails are enforced consistently across all environments," said platform architect David Kim. "Developers can't accidentally deploy AI features without proper controls."

Common policies include prompt injection detection, output filtering, rate limiting, and required approval workflows for high-risk operations. These policies are version-controlled and reviewed alongside code changes.

The shift-left approach has reduced security incidents by 70% at companies that have adopted it. Developers also report faster iteration cycles since guardrails are defined upfront rather than added retroactively.

Challenges remain around creating policies that are both comprehensive and flexible enough to allow legitimate use cases. Some teams are developing domain-specific policy languages that are easier for non-security experts to understand.`,
      featuredImage: unsplash('photo-1516259762381-22954d7d3ad2', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(5),
      readTime: 5,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
    createArticle({
      title: 'CIOs prioritize AI infrastructure investments',
      slug: 'cios-prioritize-ai-infrastructure',
      excerpt: 'Survey shows 85% of enterprises increasing AI infrastructure spending in 2025.',
      content: `A new survey of 500 enterprise CIOs reveals that AI infrastructure is the top priority for technology investments in 2025, with 85% planning to increase spending compared to 2024.

The investments focus on GPU clusters, data infrastructure, and MLOps platforms rather than individual AI applications. This reflects a shift from experimentation to production deployment at scale.

"Infrastructure investments are the foundation for everything else," said CIO Lisa Wang. "We can't build reliable AI applications without the right compute and data infrastructure."

Key investment areas include private cloud GPU clusters for sensitive workloads, data pipelines for training and inference, and platforms for model deployment and monitoring. Companies are also investing in talent, with many hiring dedicated AI infrastructure teams.

The survey found that companies with mature AI infrastructure report 3x faster time-to-market for new AI features. However, infrastructure costs are also rising, with some companies spending 40% of their cloud budgets on AI workloads.

Vendors are responding with new infrastructure offerings optimized for AI workloads. Cloud providers are launching dedicated AI regions with GPU availability guarantees, while hardware vendors are developing specialized chips for inference workloads.`,
      featuredImage: unsplash('photo-1451187580459-43490279c0fa', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(6),
      readTime: 6,
      featured: false,
      categoryId: enterpriseAI.id,
      editorId: editorA.id,
    }),
  ])

  // AI Startups articles (8-15 days ago)
  await Promise.all([
    createArticle({
      title: 'Foundation model inference hits the browser for RAG demos',
      slug: 'foundation-model-inference-in-browser',
      excerpt: 'WebGPU unlocks fast local experiments for dev advocacy teams.',
      content: `Developers are running foundation model inference directly in web browsers using WebGPU, enabling fast local RAG demos without sending data to servers.

Libraries like Transformers.js and WebLLM allow developers to load quantized models into browser memory and run inference on the client side. This enables privacy-preserving demos and reduces server costs for developer advocacy teams.

"We can show RAG capabilities without worrying about data privacy or API costs," said developer advocate Rachel Green. "Users can interact with models locally, which makes for better demos."

Current implementations can run models up to 7B parameters smoothly on modern GPUs. Larger models require quantization to fit into available memory, but the quality tradeoffs are acceptable for demonstration purposes.

Use cases include document Q&A systems, code generation tools, and creative applications. The local execution also enables offline functionality, which is valuable for certain enterprise scenarios.

Limitations include model size constraints and browser compatibility. However, as WebGPU adoption grows and quantization techniques improve, browser-based inference is becoming viable for more applications.

The trend represents a shift toward edge computing for AI workloads, complementing rather than replacing cloud-based inference for production systems.`,
      featuredImage: unsplash('photo-1498050108023-c5249f4df085', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(8),
      readTime: 5,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Privacy-first analytics startup launches synthetic data SDK',
      slug: 'privacy-first-analytics-synthetic-data-sdk',
      excerpt: 'Product teams test without touching PII using statistical twins.',
      content: `SyntheticData Labs, a privacy-focused analytics startup, launched an SDK that generates synthetic datasets preserving statistical properties while removing personally identifiable information.

The SDK allows product teams to test features and train models using realistic data without accessing actual user data. This addresses privacy regulations like GDPR and CCPA while enabling faster development cycles.

"Our synthetic data preserves correlations and distributions that matter for product development," said CEO Jennifer Lee. "Teams can iterate quickly without privacy concerns."

The technology uses generative models trained on real data to create statistical twins that maintain relationships between variables while ensuring individual records cannot be linked back to real people. Validation tests show that models trained on synthetic data perform similarly to those trained on real data.

Early adopters include fintech companies testing fraud detection systems and healthcare platforms developing recommendation algorithms. The company has raised $8 million in seed funding from Andreessen Horowitz.

Privacy advocates note that synthetic data generation is not foolproof, and companies must still follow responsible data practices. However, the technology represents a significant step forward for privacy-preserving development.

The SDK is available in Python and JavaScript, with integrations for popular data science workflows. Pricing is based on data volume and number of variables preserved.`,
      featuredImage: unsplash('photo-1492724441997-5dc865305da7', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(9),
      readTime: 5,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Stealth AI note-taker hits GA with SOC2 Type II',
      slug: 'ai-note-taker-ga-soc2',
      excerpt: 'Sales and success teams push for compliant, accurate summaries.',
      content: `Notewise, a previously stealth startup, launched its AI-powered meeting note-taking platform with SOC 2 Type II certification, targeting enterprise sales and customer success teams.

The platform uses real-time transcription and AI summarization to create structured notes from video calls, in-person meetings, and audio recordings. Accuracy on action items and ownership is becoming the decisive factor for enterprise adoption.

"We've focused on accuracy over flashy features," said founder Chris Martinez. "Sales teams need to trust that action items are captured correctly, or they won't use the tool."

The company spent 18 months in stealth mode working with beta customers to refine accuracy, particularly for technical discussions and multi-participant conversations. The SOC 2 certification addresses security concerns that prevented earlier adoption.

Early customers report saving 5-10 hours per week on meeting follow-up tasks. The structured notes integrate with CRM systems, allowing sales teams to automatically update deals and create follow-up tasks.

Notewise has raised $15 million in Series A funding from Insight Partners. The platform competes with established players like Otter.ai and Fireflies, but focuses specifically on B2B sales and customer success use cases.

Pricing starts at $20 per user per month for the professional tier, with enterprise plans available for teams requiring advanced integrations and compliance features.`,
      featuredImage: unsplash('photo-1519389950473-47ba0277781c', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(10),
      readTime: 4,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Agents for finance automate reconciliations at mid-market scale',
      slug: 'agents-for-finance-automate-reconciliations',
      excerpt: 'Template-driven playbooks reduce human review by 60%.',
      content: `FinAgent, a startup building AI agents for finance operations, announced that its reconciliation automation platform is handling mid-market scale workloads with minimal human intervention.

The platform uses composable agents that execute template-driven playbooks for common finance tasks like account reconciliation, invoice matching, and expense categorization. The agents can handle exceptions and escalate to humans only when necessary.

"We've built agents that are reliable enough for production finance workflows," said CTO Anil Patel. "They're not just demos - they're processing real transactions at scale."

The template-driven approach allows finance teams to customize agent behavior without writing code. Playbooks define the steps for common processes, and agents execute them consistently while learning from human corrections.

Mid-market companies using the platform report 60% reduction in manual review time while maintaining accuracy above 99%. The agents integrate with popular accounting software and ERP systems.

The composable architecture allows teams to build complex workflows by combining simpler agents. For example, an invoice processing workflow might combine agents for OCR, vendor matching, approval routing, and GL coding.

FinAgent raised $22 million in Series B funding led by Sequoia Capital. The company is expanding beyond reconciliations to other finance operations like accounts payable and receivables management.

Challenges include handling edge cases and ensuring compliance with accounting standards. The company maintains human review workflows for high-value transactions and unusual patterns.`,
      featuredImage: unsplash('photo-1521791136064-7986c2920216', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(11),
      readTime: 6,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'LLM fine-tuning startup raises $30M Series A',
      slug: 'llm-fine-tuning-startup-series-a',
      excerpt: 'Platform makes it easier for companies to customize foundation models.',
      content: `FineTuneAI, a platform that simplifies LLM fine-tuning for enterprises, raised $30 million in Series A funding from NEA and Greylock Partners.

The platform abstracts away the complexity of model fine-tuning, allowing companies to customize foundation models using their own data without deep ML expertise. The company claims to reduce fine-tuning time from weeks to hours.

"Most companies don't have ML teams capable of fine-tuning models," said CEO Sophia Chang. "We make it accessible to any engineering team."

The platform handles data preparation, model selection, training orchestration, and deployment. It supports popular foundation models and can optimize training for cost and performance. Customers can fine-tune models for specific domains like legal, healthcare, or finance.

Early customers include law firms building contract analysis tools, healthcare companies developing patient communication systems, and financial services firms creating compliance assistants. The fine-tuned models show significant improvements in domain-specific tasks.

The Series A will be used to expand the engineering team and build partnerships with cloud providers. The company is also developing evaluation tools to help customers measure fine-tuning effectiveness.

Competition is increasing as cloud providers add fine-tuning capabilities to their AI platforms. However, FineTuneAI aims to differentiate through ease of use and support for multiple model providers.

Pricing is usage-based, with costs varying based on model size and training duration. The company offers both self-service and managed service options.`,
      featuredImage: unsplash('photo-1555949963-aa79dcee981c', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(12),
      readTime: 5,
      featured: false,
      categoryId: aiStartups.id,
      editorId: editorB.id,
    }),
  ])

  // Tech articles (8-12 days ago)
  await Promise.all([
    createArticle({
      title: 'GPU shortage eases as new chips enter production',
      slug: 'gpu-shortage-eases-new-chips',
      excerpt: 'Suppliers report improved availability for AI training workloads.',
      content: `The GPU shortage that has plagued AI development over the past year is showing signs of easing as new chip generations enter production and supply chains stabilize.

NVIDIA, AMD, and emerging players are ramping up production of AI-focused GPUs, with improved availability expected in Q2 2025. This comes as a relief to startups and enterprises that have struggled to access compute resources.

"Demand is still high, but supply is finally catching up," said supply chain analyst Mark Johnson. "We're seeing lead times drop from months to weeks."

The shortage was driven by massive demand from cloud providers, enterprises building private AI infrastructure, and cryptocurrency miners. While demand remains strong, increased production capacity and the end of crypto mining boom have improved availability.

Cloud providers are also expanding their GPU offerings, with new instance types becoming available. This provides alternatives for companies that couldn't access on-premises hardware.

However, high-end GPUs remain constrained, particularly the latest generation optimized for training large language models. Companies seeking cutting-edge performance may still face delays.

The improved availability is expected to accelerate AI adoption as more companies can access the compute resources needed for training and inference. This could also moderate prices, which have been elevated due to supply constraints.`,
      featuredImage: unsplash('photo-1518770660439-4636190af475', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(8),
      readTime: 4,
      featured: false,
      categoryId: tech.id,
      editorId: editorC.id,
    }),
    createArticle({
      title: 'WebAssembly runtime adds GPU acceleration',
      slug: 'wasm-runtime-gpu-acceleration',
      excerpt: 'Wasmtime enables GPU compute workloads in browser and server environments.',
      content: `The Wasmtime WebAssembly runtime added GPU acceleration support, enabling compute-intensive workloads to run efficiently in browser and server environments.

The new capabilities allow WebAssembly modules to access GPU resources through WebGPU APIs, opening up possibilities for AI inference, graphics processing, and scientific computing workloads in portable bytecode.

"This brings GPU compute to WebAssembly's security and portability model," said project lead Linus Chen. "Developers can write GPU code once and run it anywhere WebAssembly is supported."

Use cases include browser-based AI inference, edge computing applications, and cloud workloads that benefit from GPU acceleration. The runtime handles the complexity of GPU memory management and kernel execution.

Performance benchmarks show GPU-accelerated WebAssembly modules achieving 80% of native performance for suitable workloads. This makes it viable for production applications, not just demos.

The feature is particularly valuable for AI applications that want to run inference locally in browsers without sending data to servers. Combined with model quantization, this enables privacy-preserving AI experiences.

Challenges remain around GPU memory constraints and compatibility across different hardware. However, the WebAssembly community is actively working on standards to improve GPU support.

The update represents a significant step toward making WebAssembly a viable platform for compute-intensive applications beyond its current use in web applications and edge computing.`,
      featuredImage: unsplash('photo-1461749280684-dccba630e2f6', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(9),
      readTime: 5,
      featured: false,
      categoryId: tech.id,
      editorId: editorC.id,
    }),
  ])

  // AI/Tools articles (10-14 days ago)
  await Promise.all([
    createArticle({
      title: 'Open-source RAG framework hits 10K GitHub stars',
      slug: 'open-source-rag-framework-10k-stars',
      excerpt: 'LangChain alternative gains traction with developer community.',
      content: `RAGFlow, an open-source framework for building retrieval-augmented generation applications, surpassed 10,000 GitHub stars, reflecting growing developer interest in RAG capabilities.

The framework simplifies building RAG applications by providing pre-built components for document processing, vector storage, retrieval, and generation. It supports multiple LLM providers and vector databases.

"Developers want RAG capabilities without the complexity," said maintainer Alex Kumar. "We've abstracted away the infrastructure so teams can focus on their use cases."

The framework includes features like automatic chunking strategies, query rewriting, and multi-hop retrieval. It also provides evaluation tools to help developers measure RAG application quality.

Contributors have added integrations with popular tools and services, expanding the ecosystem. The project has active community support with regular updates and documentation improvements.

Comparisons to LangChain highlight RAGFlow's focus on simplicity and developer experience. While LangChain offers more flexibility, RAGFlow provides better defaults and easier onboarding for new developers.

The milestone reflects broader interest in RAG as a practical application of LLMs. Companies are building RAG applications for knowledge bases, customer support, and internal tools.

The framework is MIT-licensed and available on GitHub. Commercial support and cloud hosting options are available for enterprise users.`,
      featuredImage: unsplash('photo-1555066931-4365d14bab8c', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(10),
      readTime: 4,
      featured: false,
      categoryId: tools.id,
      editorId: editorB.id,
    }),
    createArticle({
      title: 'Prompt engineering tool gains enterprise adoption',
      slug: 'prompt-engineering-tool-enterprise',
      excerpt: 'Platform helps teams manage and version-control prompts at scale.',
      content: `PromptLayer, a platform for managing and version-controlling prompts, is seeing increased enterprise adoption as companies scale their LLM applications.

The tool allows teams to track prompt changes, A/B test variations, and monitor prompt performance over time. This addresses the challenge of managing prompts as applications grow in complexity.

"Prompts are becoming critical infrastructure," said CEO Jordan Lee. "Teams need the same rigor for prompts that they have for code."

Enterprise features include role-based access control, audit logging, and integration with CI/CD pipelines. Teams can review prompt changes before deployment and roll back if issues arise.

The platform also provides analytics on prompt performance, helping teams identify which variations work best for different use cases. This data-driven approach improves prompt quality over time.

Adoption is strongest among companies building customer-facing AI applications where prompt quality directly impacts user experience. Support teams, product teams, and engineering teams all benefit from better prompt management.

The tool integrates with popular LLM providers and can be used alongside existing application code. Pricing scales with usage, making it accessible for teams of all sizes.

As LLM applications become more sophisticated, prompt management will become as important as code management. Tools like PromptLayer are making this transition easier for development teams.`,
      featuredImage: unsplash('photo-1555949963-aa79dcee981c', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(11),
      readTime: 5,
      featured: false,
      categoryId: tools.id,
      editorId: editorB.id,
    }),
  ])

  // Research articles (12-18 days ago)
  await Promise.all([
    createArticle({
      title: 'New architecture improves reasoning in smaller models',
      slug: 'new-architecture-reasoning-smaller-models',
      excerpt: 'Research enables complex reasoning without trillion-parameter models.',
      content: `Researchers at DeepMind and Anthropic published papers demonstrating new architectures that enable smaller language models to perform complex reasoning tasks previously requiring much larger models.

The architectures use techniques like chain-of-thought prompting, tree-of-thoughts search, and specialized reasoning modules. This allows models with 10-70B parameters to match or exceed larger models on reasoning benchmarks.

"Scaling model size isn't the only path to better reasoning," said lead researcher Dr. Sarah Kim. "Architectural improvements can achieve similar gains with far less compute."

The research could make advanced reasoning capabilities more accessible by reducing the compute requirements. This is particularly important for edge deployment and cost-sensitive applications.

Benchmarks show improvements on tasks like mathematical problem-solving, logical reasoning, and multi-step planning. The architectures are also more interpretable, allowing researchers to understand how reasoning occurs.

Commercial applications include coding assistants, scientific computing tools, and decision support systems. The reduced compute requirements make these capabilities viable for more use cases.

However, the architectures require careful tuning and may not generalize to all reasoning tasks. Further research is needed to understand when and why these approaches work.

The papers have sparked discussion in the research community about the tradeoffs between model scale and architectural sophistication. Many researchers see promise in combining both approaches.`,
      featuredImage: unsplash('photo-1451187580459-43490279c0fa', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(12),
      readTime: 6,
      featured: false,
      categoryId: research.id,
      editorId: editorC.id,
    }),
    createArticle({
      title: 'Multimodal models advance vision-language understanding',
      slug: 'multimodal-models-vision-language',
      excerpt: 'New training techniques improve performance on complex visual tasks.',
      content: `Recent advances in multimodal AI models are improving vision-language understanding, enabling more sophisticated applications that combine visual and textual information.

Researchers are using techniques like contrastive learning, cross-modal attention, and large-scale pretraining to create models that better understand relationships between images and text.

"Vision-language models are getting closer to human-level understanding," said researcher Dr. Michael Chen. "They can now answer complex questions about images and generate detailed descriptions."

Applications include image captioning, visual question answering, and image-based search. The improvements are particularly notable for tasks requiring fine-grained understanding of visual details.

The research builds on foundational work from OpenAI's CLIP and Google's PaLM-E, but introduces innovations in training data and model architecture. Open-source alternatives are making these capabilities more accessible.

Commercial applications include content moderation, accessibility tools, and e-commerce search. The technology is also enabling new creative applications that combine visual and textual generation.

Challenges remain around handling edge cases and ensuring models don't hallucinate visual details. Researchers are working on evaluation methods to better measure multimodal understanding.

The advances represent progress toward more general AI systems that can understand and generate content across multiple modalities. This could enable new categories of applications that seamlessly combine vision and language.`,
      featuredImage: unsplash('photo-1551288049-bebda4e38f71', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(13),
      readTime: 6,
      featured: false,
      categoryId: research.id,
      editorId: editorC.id,
    }),
    createArticle({
      title: 'Efficient fine-tuning reduces training costs by 90%',
      slug: 'efficient-fine-tuning-reduces-costs',
      excerpt: 'LoRA and QLoRA techniques make model customization affordable.',
      content: `Parameter-efficient fine-tuning techniques like LoRA (Low-Rank Adaptation) and QLoRA are dramatically reducing the cost of customizing large language models, making fine-tuning accessible to more organizations.

These techniques update only a small fraction of model parameters during fine-tuning, reducing memory requirements and training costs by up to 90% compared to full fine-tuning. This makes it possible to fine-tune large models on consumer hardware.

"We can fine-tune a 70B parameter model on a single GPU using QLoRA," said ML engineer David Park. "This completely changes what's possible for smaller teams."

The techniques work by adding small adapter layers to the model rather than updating all weights. The adapters learn task-specific adjustments while preserving the base model's general knowledge.

Applications include domain-specific models for legal, medical, and technical domains. Companies are fine-tuning models for specific use cases without the expense of training from scratch.

Open-source libraries like PEFT have made these techniques easy to use. The community has developed best practices for selecting adapter sizes and training configurations.

The cost reduction is enabling new business models where companies can offer customized models without massive infrastructure investments. This could democratize access to specialized AI capabilities.

However, parameter-efficient fine-tuning may not achieve the same performance as full fine-tuning for all tasks. Researchers are working to understand when these techniques are most effective.`,
      featuredImage: unsplash('photo-1551288049-bebda4e38f71', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(14),
      readTime: 5,
      featured: false,
      categoryId: research.id,
      editorId: editorC.id,
    }),
  ])

  // Opinion articles (10-16 days ago)
  await Promise.all([
    createArticle({
      title: 'The AI regulation debate misses the real issue',
      slug: 'ai-regulation-debate-misses-issue',
      excerpt: 'Focusing on model capabilities ignores the systemic risks of AI deployment.',
      content: `The ongoing debate about AI regulation focuses too narrowly on model capabilities and not enough on how AI systems are deployed and integrated into existing infrastructure.

Regulators are proposing requirements for model training, safety testing, and transparency. While these are important, they miss the systemic risks that emerge when AI systems interact with complex business processes and human decision-making.

"The real risks aren't in the models themselves," writes columnist Michael Thompson. "They're in how we deploy them and what we expect them to do."

Systemic risks include cascading failures when AI systems interact, bias amplification through feedback loops, and over-reliance on automated decision-making. These risks require different regulatory approaches than model-level safety requirements.

The focus on model capabilities also creates a false sense of security. A safe model deployed unsafely can still cause harm. Conversely, a model with known limitations can be deployed safely with proper guardrails and human oversight.

Regulation should focus on deployment practices, monitoring requirements, and accountability frameworks. This would address the actual risks while allowing innovation in model development.

The debate needs to shift from "what models can do" to "how we use them responsibly." This requires collaboration between technologists, regulators, and domain experts who understand the contexts where AI is deployed.

Until we address systemic risks, we're treating symptoms rather than underlying causes. The AI regulation debate needs to evolve beyond model capabilities to consider the full system.`,
      featuredImage: unsplash('photo-1451187580459-43490279c0fa', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(10),
      readTime: 7,
      featured: false,
      categoryId: opinion.id,
      editorId: editorD.id,
    }),
    createArticle({
      title: 'Open source AI is winning, but not in the way you think',
      slug: 'open-source-ai-winning',
      excerpt: 'The real value isn\'t in competing with closed models, but in enabling customization.',
      content: `The narrative around open-source AI focuses on whether open models can match closed models on benchmarks. This misses the real value proposition: open models enable customization that closed models can't provide.

While closed models from OpenAI, Anthropic, and Google may lead on general benchmarks, open models excel when fine-tuned for specific domains and use cases. This customization advantage is driving adoption in enterprises.

"Open models aren't trying to be general-purpose," argues tech analyst Emma Chen. "They're trying to be customizable, and that's a different value proposition."

Companies are fine-tuning open models for specific domains like legal research, medical diagnosis, and technical documentation. These customized models often outperform general models on domain-specific tasks.

The open ecosystem also enables integration with proprietary data and systems in ways that closed APIs don't allow. Companies can run models on-premises, customize architectures, and integrate tightly with existing workflows.

This isn't about open vs. closed winning or losing. It's about different approaches serving different needs. General models for broad use cases, customized models for specific domains.

The real winner is the ecosystem that enables the most innovation. Right now, that's looking like open source, not because open models are better on benchmarks, but because they enable more use cases.

As the AI market matures, we'll see more specialization. The question isn't whether open models beat closed models, but which approach enables the most valuable applications.`,
      featuredImage: unsplash('photo-1518770660439-4636190af475', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(13),
      readTime: 6,
      featured: false,
      categoryId: opinion.id,
      editorId: editorD.id,
    }),
    createArticle({
      title: 'AI agents need better failure modes',
      slug: 'ai-agents-better-failure-modes',
      excerpt: 'Current agent systems fail silently or catastrophically. We need graceful degradation.',
      content: `AI agents are becoming more capable, but they're also becoming more dangerous because they lack good failure modes. When agents encounter situations they can't handle, they either fail silently or make catastrophic errors.

Consider an agent that's supposed to book a flight. If it encounters an error, it might book the wrong flight, book multiple flights, or fail without notifying anyone. None of these are acceptable failure modes.

"Agents need to know when to stop," argues researcher Sara Patel. "And they need to fail in ways that humans can understand and fix."

Good failure modes include:
- Recognizing when tasks are outside capabilities
- Escalating to humans with clear explanations
- Providing partial results when full completion isn't possible
- Explaining what went wrong and why

Current agent systems often lack these capabilities. They'll attempt tasks beyond their capabilities, make errors without acknowledgment, or fail in ways that are difficult to diagnose.

This is a solvable problem. Techniques like confidence scoring, uncertainty quantification, and hierarchical task decomposition can help agents recognize their limitations.

The industry needs to prioritize failure mode design alongside capability improvements. More capable agents that fail badly are worse than less capable agents that fail gracefully.

As agents become more autonomous, failure modes become more critical. We need to design agents that are robust not just in success cases, but in failure cases too.`,
      featuredImage: unsplash('photo-1551288049-bebda4e38f71', { w: 1200, h: 800 }),
      published: true,
      publishedAt: daysAgo(16),
      readTime: 5,
      featured: false,
      categoryId: opinion.id,
      editorId: editorD.id,
    }),
  ])

  // More recent articles to fill out the homepage (today and yesterday)
  await Promise.all([
    createArticle({
      title: 'Apple announces new AI features for iPhone',
      slug: 'apple-announces-ai-features-iphone',
      excerpt: 'Siri improvements and on-device AI processing coming in iOS 18.',
      content: `Apple unveiled significant AI enhancements for iPhone at its developer conference, including improved Siri capabilities and on-device AI processing that works without sending data to servers.

The new features include smarter voice commands, improved text generation, and enhanced photo editing powered by on-device models. The company emphasized privacy, with all processing happening locally on the device.

"Siri is getting smarter while staying private," said Apple VP of AI. "Everything happens on your device, so your data never leaves your phone."

The on-device approach addresses privacy concerns while enabling faster responses. However, it requires more powerful chips, which Apple has developed specifically for AI workloads.

The features will be available in iOS 18, expected to launch this fall. Developers can start building with the new AI APIs in the beta release.

The announcement represents Apple's most significant AI push since introducing Siri. The company has been slower than competitors to embrace generative AI, but the new features suggest a more aggressive strategy.

Industry analysts note that on-device AI could differentiate Apple from competitors who rely on cloud-based processing. However, cloud-based approaches can leverage more powerful models.

The balance between privacy and capability will be key to Apple's AI strategy. The company is betting that privacy-conscious consumers will prefer on-device processing even if it means slightly less capable features.`,
      featuredImage: unsplash('photo-1511707171634-5f897ff02aa9', { w: 1200, h: 800 }),
      published: true,
      publishedAt: hoursAgo(12),
      readTime: 4,
      featured: false,
      categoryId: tech.id,
      editorId: editorC.id,
    }),
    createArticle({
      title: 'Google releases Gemini 2.0 with improved reasoning',
      slug: 'google-gemini-2-improved-reasoning',
      excerpt: 'Latest model shows significant improvements on mathematical and logical tasks.',
      content: `Google released Gemini 2.0, a major update to its flagship language model with improved reasoning capabilities, particularly on mathematical and logical tasks.

The new model achieves state-of-the-art performance on benchmarks like MATH, GSM8K, and HumanEval, surpassing previous models including GPT-4. The improvements come from architectural changes and training techniques focused on reasoning.

"We've made reasoning a first-class capability," said Google AI lead Demis Hassabis. "The model can now handle complex multi-step problems more reliably."

The model is available through Google Cloud's Vertex AI platform and the Gemini API. Google is also releasing smaller versions optimized for specific use cases like coding and analysis.

Early users report improvements in code generation, data analysis, and problem-solving tasks. However, the model still has limitations and can make errors on complex reasoning tasks.

The release intensifies competition in the AI space, with Google, OpenAI, and Anthropic all releasing improved models this year. The rapid pace of improvement suggests the field is far from maturity.

Pricing remains competitive with other providers, with Google emphasizing value over raw capability. The company is also offering fine-tuning services for enterprise customers.

The release represents Google's continued investment in AI capabilities despite recent challenges. The company is positioning Gemini as a comprehensive platform for AI applications, not just a language model.`,
      featuredImage: unsplash('photo-1558494949-ef010cbdcc31', { w: 1200, h: 800 }),
      published: true,
      publishedAt: hoursAgo(18),
      readTime: 5,
      featured: false,
      categoryId: ai.id,
      editorId: editorC.id,
    }),
  ])

  // Sponsored Banners - all types (use createMany with skipDuplicates or individual creates with catch)
  try {
    await Promise.all([
      prisma.sponsoredBanner.create({
        data: {
          title: 'Enterprise AI Platform',
          imageUrl: unsplash('photo-1506744038136-46273834b3fb', { w: 728, h: 90 }),
          linkUrl: 'https://example.com/enterprise-ai',
          type: 'homepage-main',
          active: true,
          displayOrder: 1,
        },
      }).catch(() => {}), // Ignore if already exists
      prisma.sponsoredBanner.create({
        data: {
          title: 'AI Development Tools',
          imageUrl: unsplash('photo-1555949963-aa79dcee981c', { w: 300, h: 600 }),
          linkUrl: 'https://example.com/ai-tools',
          type: 'homepage-side',
          active: true,
          displayOrder: 1,
        },
      }).catch(() => {}),
      prisma.sponsoredBanner.create({
        data: {
          title: 'AI Research Platform',
          imageUrl: unsplash('photo-1451187580459-43490279c0fa', { w: 300, h: 600 }),
          linkUrl: 'https://example.com/research',
          type: 'article-side',
          active: true,
          displayOrder: 1,
        },
      }).catch(() => {}),
      prisma.sponsoredBanner.create({
        data: {
          title: 'Upcoming AI Conference',
          imageUrl: unsplash('photo-1519389950473-47ba0277781c', { w: 728, h: 90 }),
          linkUrl: 'https://example.com/conference',
          type: 'homepage-main',
          active: true,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Starts in 7 days
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Ends in 30 days
          displayOrder: 2,
        },
      }).catch(() => {}),
    ])
  } catch (error) {
    // Ignore duplicate errors
    if (!error.message?.includes('Unique constraint')) {
      console.warn('Warning creating sponsored banners:', error.message)
    }
  }

  // Subscribers - sample email list
  await Promise.all([
    prisma.subscriber.create({
      data: { email: 'subscriber1@example.com' },
    }).catch(() => {}), // Ignore duplicates
    prisma.subscriber.create({
      data: { email: 'subscriber2@example.com' },
    }).catch(() => {}),
    prisma.subscriber.create({
      data: { email: 'subscriber3@example.com' },
    }).catch(() => {}),
    prisma.subscriber.create({
      data: { email: 'newsletter@example.com' },
    }).catch(() => {}),
  ])

  // Comments - sample comments on featured article
  const featuredArticle = await prisma.article.findFirst({
    where: { featured: true },
  })
  
  if (featuredArticle) {
    const existingComments = await prisma.comment.count({
      where: { articleId: featuredArticle.id },
    })
    
    // Only create comments if they don't exist yet
    if (existingComments === 0) {
      await Promise.all([
        prisma.comment.create({
          data: {
            content: 'This is fascinating! Edge AI is definitely the future for real-time applications.',
            articleId: featuredArticle.id,
            approved: true,
          },
        }).catch(() => {}),
        prisma.comment.create({
          data: {
            content: 'Great to see companies focusing on low-power solutions. The 2 watts consumption is impressive.',
            articleId: featuredArticle.id,
            approved: true,
          },
        }).catch(() => {}),
        prisma.comment.create({
          data: {
            content: 'Would love to see more details about the model architecture they\'re using.',
            articleId: featuredArticle.id,
            approved: false, // Pending approval
          },
        }).catch(() => {}),
      ])
    }
  }

  // Scheduled articles - articles scheduled for future publication
  const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  await createArticle({
    title: 'Next-gen AI chips enter mass production',
    slug: 'next-gen-ai-chips-mass-production',
    excerpt: 'New generation of AI-optimized processors begins shipping to manufacturers.',
    content: `The next generation of AI-optimized processors has entered mass production, promising significant improvements in performance and efficiency for AI workloads.

Leading chip manufacturers have begun shipping new processors designed specifically for AI inference and training. These chips feature specialized architectures that accelerate common AI operations while reducing power consumption.

Early benchmarks show 3x performance improvements over previous generations while maintaining similar power profiles. This could enable new classes of AI applications that weren't previously feasible.

The chips are being adopted by cloud providers, data centers, and edge device manufacturers. The increased availability is expected to reduce costs and improve accessibility of AI capabilities.

Industry analysts predict this will accelerate AI adoption across multiple sectors, from autonomous vehicles to smart home devices. The improved efficiency also addresses concerns about AI's energy consumption.

The mass production represents a significant milestone in making AI more accessible and efficient. As the chips become more widely available, we can expect to see new applications and use cases emerge.`,
    featuredImage: unsplash('photo-1518770660439-4636190af475', { w: 1200, h: 800 }),
    published: false, // Not published yet
    scheduledAt: futureDate,
    readTime: 5,
    featured: false,
    categoryId: tech.id,
    editorId: editorC.id,
    metaTitle: 'Next-gen AI chips enter mass production',
    metaDescription: 'New generation of AI-optimized processors begins shipping with 3x performance improvements.',
  })

  // Static Pages - footer pages with dummy content
  try {
    await Promise.all([
      prisma.staticPage.upsert({
        where: { slug: 'about' },
        update: {},
        create: {
          title: 'About Us',
          slug: 'about',
          content: `<h2>Welcome to AI Tech News</h2>
<p>AI Tech News is your premier destination for the latest developments in artificial intelligence, machine learning, and emerging technologies. We're dedicated to providing insightful, accurate, and timely coverage of the rapidly evolving AI landscape.</p>

<h2>Our Mission</h2>
<p>Our mission is to bridge the gap between complex AI technologies and understanding audiences. We believe that artificial intelligence is transforming the world, and everyone should have access to clear, comprehensive information about these changes.</p>

<h2>What We Cover</h2>
<ul>
  <li><strong>Enterprise AI:</strong> How businesses are leveraging AI to transform operations</li>
  <li><strong>AI Startups:</strong> Emerging companies and innovative solutions</li>
  <li><strong>Research & Development:</strong> Breakthroughs from leading AI research institutions</li>
  <li><strong>AI Tools:</strong> Reviews and insights on the latest AI-powered applications</li>
  <li><strong>Industry Analysis:</strong> In-depth analysis of AI trends and market movements</li>
  <li><strong>Opinion & Commentary:</strong> Thoughtful perspectives on AI policy, ethics, and impact</li>
</ul>

<h2>Our Team</h2>
<p>Our team of experienced journalists and tech writers brings years of expertise in technology reporting. We're committed to delivering high-quality content that helps you stay informed about the world of AI.</p>

<h2>Stay Connected</h2>
<p>Follow us for daily updates, subscribe to our newsletter for weekly insights, and join our community of AI enthusiasts, developers, and business leaders who are shaping the future of technology.</p>`,
          metaTitle: 'About Us - AI Tech News',
          metaDescription: 'Learn about AI Tech News, your source for the latest AI and technology news, insights, and analysis.',
        },
      }),
      prisma.staticPage.upsert({
        where: { slug: 'contact' },
        update: {},
        create: {
          title: 'Contact Us',
          slug: 'contact',
          content: `<h2>Get in Touch</h2>
<p>We'd love to hear from you! Whether you have a story tip, feedback, questions, or partnership inquiries, please don't hesitate to reach out.</p>

<h2>General Inquiries</h2>
<p>For general questions, feedback, or information requests, please email us at:</p>
<p><strong>Email:</strong> <a href="mailto:info@aitechnews.com">info@aitechnews.com</a></p>

<h2>Editorial & Story Tips</h2>
<p>Have a news tip or story idea? Our editorial team is always looking for compelling stories about AI and technology.</p>
<p><strong>Email:</strong> <a href="mailto:editorial@aitechnews.com">editorial@aitechnews.com</a></p>

<h2>Partnerships & Advertising</h2>
<p>Interested in partnering with us or advertising opportunities? We work with brands and organizations that align with our mission of advancing AI knowledge.</p>
<p><strong>Email:</strong> <a href="mailto:partnerships@aitechnews.com">partnerships@aitechnews.com</a></p>

<h2>Press Inquiries</h2>
<p>Members of the press can reach our communications team for media requests, press releases, and interview opportunities.</p>
<p><strong>Email:</strong> <a href="mailto:press@aitechnews.com">press@aitechnews.com</a></p>

<h2>Response Time</h2>
<p>We aim to respond to all inquiries within 2-3 business days. For urgent matters, please indicate "URGENT" in your subject line.</p>

<h2>Office Address</h2>
<p>AI Tech News<br>
123 Tech Street<br>
San Francisco, CA 94105<br>
United States</p>

<p><em>Note: This is a sample address. Please update with your actual contact information.</em></p>`,
          metaTitle: 'Contact Us - AI Tech News',
          metaDescription: 'Get in touch with AI Tech News. Contact us for editorial inquiries, partnerships, advertising, or general questions.',
        },
      }),
      prisma.staticPage.upsert({
        where: { slug: 'privacy' },
        update: {},
        create: {
          title: 'Privacy Policy',
          slug: 'privacy',
          content: `<h2>Privacy Policy</h2>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<p>At AI Tech News, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

<h2>Information We Collect</h2>
<h3>Information You Provide</h3>
<ul>
  <li><strong>Newsletter Subscriptions:</strong> When you subscribe to our newsletter, we collect your email address.</li>
  <li><strong>Comments:</strong> If you post comments, we may collect your name, email, and the content of your comments.</li>
  <li><strong>Contact Forms:</strong> Information you provide when contacting us through our contact forms.</li>
</ul>

<h3>Automatically Collected Information</h3>
<ul>
  <li><strong>Usage Data:</strong> Information about how you access and use our website, including IP address, browser type, pages visited, and time spent on pages.</li>
  <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience and analyze site traffic.</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Deliver and maintain our services</li>
  <li>Send you newsletters and updates (with your consent)</li>
  <li>Respond to your inquiries and provide customer support</li>
  <li>Analyze website usage and improve our content</li>
  <li>Detect and prevent fraud or abuse</li>
  <li>Comply with legal obligations</li>
</ul>

<h2>Data Sharing and Disclosure</h2>
<p>We do not sell your personal information. We may share your information in the following circumstances:</p>
<ul>
  <li><strong>Service Providers:</strong> With third-party service providers who help us operate our website and conduct our business</li>
  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
</ul>

<h2>Your Rights</h2>
<p>Depending on your location, you may have the following rights:</p>
<ul>
  <li>Access to your personal information</li>
  <li>Correction of inaccurate information</li>
  <li>Deletion of your information</li>
  <li>Opt-out of marketing communications</li>
  <li>Data portability</li>
</ul>

<h2>Cookies and Tracking</h2>
<p>We use cookies to improve your browsing experience. You can control cookies through your browser settings, though this may affect website functionality.</p>

<h2>Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>

<h2>Children's Privacy</h2>
<p>Our website is not intended for children under 13. We do not knowingly collect personal information from children.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>

<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at:</p>
<p><strong>Email:</strong> <a href="mailto:privacy@aitechnews.com">privacy@aitechnews.com</a></p>`,
          metaTitle: 'Privacy Policy - AI Tech News',
          metaDescription: 'Read AI Tech News privacy policy to understand how we collect, use, and protect your personal information.',
        },
      }),
      prisma.staticPage.upsert({
        where: { slug: 'terms' },
        update: {},
        create: {
          title: 'Terms of Service',
          slug: 'terms',
          content: `<h2>Terms of Service</h2>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<p>Welcome to AI Tech News. These Terms of Service ("Terms") govern your access to and use of our website and services. By accessing or using our website, you agree to be bound by these Terms.</p>

<h2>Acceptance of Terms</h2>
<p>By accessing or using AI Tech News, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with these Terms, please do not use our website.</p>

<h2>Use of the Website</h2>
<h3>Permitted Use</h3>
<p>You may use our website for personal, non-commercial purposes. You agree to:</p>
<ul>
  <li>Use the website in compliance with all applicable laws and regulations</li>
  <li>Respect the intellectual property rights of others</li>
  <li>Not interfere with or disrupt the website's operation</li>
  <li>Not attempt to gain unauthorized access to any part of the website</li>
</ul>

<h3>Prohibited Activities</h3>
<p>You agree not to:</p>
<ul>
  <li>Use the website for any illegal or unauthorized purpose</li>
  <li>Transmit any harmful code, viruses, or malicious software</li>
  <li>Engage in any form of data mining, scraping, or harvesting</li>
  <li>Impersonate any person or entity</li>
  <li>Post false, misleading, or defamatory content</li>
  <li>Violate any applicable laws or regulations</li>
</ul>

<h2>Content and Intellectual Property</h2>
<h3>Our Content</h3>
<p>All content on AI Tech News, including articles, images, logos, and design elements, is owned by us or our licensors and is protected by copyright, trademark, and other intellectual property laws.</p>

<h3>User-Generated Content</h3>
<p>If you post comments or other content on our website, you grant us a non-exclusive, royalty-free license to use, modify, and display that content. You represent that you have the right to grant this license.</p>

<h3>Attribution</h3>
<p>You may share our articles with proper attribution. You may not republish our content without permission, except for brief excerpts for commentary or criticism.</p>

<h2>Newsletter and Subscriptions</h2>
<p>By subscribing to our newsletter, you agree to receive periodic emails from us. You can unsubscribe at any time using the link provided in our emails.</p>

<h2>Third-Party Links</h2>
<p>Our website may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of service of these external sites.</p>

<h2>Disclaimer of Warranties</h2>
<p>Our website is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the website will be uninterrupted, error-free, or secure.</p>

<h2>Limitation of Liability</h2>
<p>To the fullest extent permitted by law, AI Tech News shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website.</p>

<h2>Indemnification</h2>
<p>You agree to indemnify and hold harmless AI Tech News and its affiliates from any claims, damages, or expenses arising from your use of the website or violation of these Terms.</p>

<h2>Modifications to Terms</h2>
<p>We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting the updated Terms on this page. Your continued use of the website after changes constitutes acceptance of the new Terms.</p>

<h2>Termination</h2>
<p>We reserve the right to suspend or terminate your access to the website at any time, with or without cause or notice, for any reason, including violation of these Terms.</p>

<h2>Governing Law</h2>
<p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AI Tech News operates, without regard to its conflict of law provisions.</p>

<h2>Contact Information</h2>
<p>If you have questions about these Terms, please contact us at:</p>
<p><strong>Email:</strong> <a href="mailto:legal@aitechnews.com">legal@aitechnews.com</a></p>

<h2>Severability</h2>
<p>If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.</p>`,
          metaTitle: 'Terms of Service - AI Tech News',
          metaDescription: 'Read the Terms of Service for AI Tech News to understand the rules and guidelines for using our website.',
        },
      }),
    ])
  } catch (error) {
    if (!error.message?.includes('Unique constraint')) {
      console.warn('Warning creating static pages:', error.message)
    }
  }

  console.log('✅ Seeded: settings, editors, categories, articles, sponsored banners, subscribers, comments, scheduled articles, and static pages')
  console.log(`✅ Created ${await prisma.article.count()} articles`)
  console.log(`✅ Created ${await prisma.category.count()} categories`)
  console.log(`✅ Created ${await prisma.editor.count()} editors`)
  console.log(`✅ Created ${await prisma.sponsoredBanner.count()} sponsored banners`)
  console.log(`✅ Created ${await prisma.subscriber.count()} subscribers`)
  console.log(`✅ Created ${await prisma.comment.count()} comments`)
  console.log(`✅ Created ${await prisma.staticPage.count()} static pages`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
