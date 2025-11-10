/* eslint-disable no-console */
/* eslint-disable no-console-Testing */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Default design system values (matching reference design system)
  const defaultDesignSystem = {
    colors: {
      bgWhite: '#FFFFFF',
      bgBlack: '#000000',
      bgDarkGray: '#1a1a1a',
      bgLightGray: '#F8F8F8', // Updated: was #f5f5f5
      bgTicker: '#2a2a2a',
      textBlack: '#111111', // Updated: was rgb(34, 34, 34) / #222222
      textWhite: '#ffffff',
      textDarkGray: '#333333',
      textMediumGray: '#666666',
      textLightGray: '#999999',
      borderLight: '#E5E5E5', // Updated: was #e6e6e6
      borderMedium: '#cccccc',
      borderDark: '#333333',
      borderQuote: '#DDDDDD', // New: soft gray for quote borders
      bluePrimary: '#0050A4', // Updated: was #0066cc - muted blue for links
      blueHover: '#003d82', // Updated: darker shade of new blue
      blueLight: '#0070f3',
      redNegative: '#dc3545',
      greenPositive: '#28a745',
      overlayDark: 'rgba(0, 0, 0, 0.5)',
      overlayLight: 'rgba(0, 0, 0, 0.3)',
    },
    typography: {
      fontSerif: "'Old Standard TT', 'EB Garamond', Georgia, 'Times', serif", // Display font
      fontSans: "'Merriweather', Georgia, serif", // Body text - should be serif per spec
      fontSizeTicker: '11px',
      fontSizeXs: '12px', // Updated: was 11px
      fontSizeSm: '14px', // Updated: was 13px - for meta/nav
      fontSizeBase: '16px', // Body text
      fontSizeMd: '18px', // Updated: was 17px
      fontSizeLg: '20px', // Updated: was 19px - for decks/subheadings
      fontSizeXl: '22px', // Updated: was 21px
      fontSize2xl: '24px', // H3
      fontSize3xl: '28px', // H2
      fontSize4xl: '32px',
      fontSize5xl: '34px',
      fontSize6xl: '36px', // H1
      fontSize7xl: '42px', // H1 on desktop
      fontSizeQuote: '20px', // New: for pull quotes (18-22px range)
      fontWeightLight: '300',
      fontWeightNormal: '400', // Updated: was 350
      fontWeightMedium: '500',
      fontWeightSemibold: '600',
      fontWeightBold: '700',
      lineHeightTight: '1.2', // Updated: was 1.15 - for headings
      lineHeightNormal: '1.25', // Updated: was 1.17
      lineHeightRelaxed: '1.3',
      lineHeightDeck: '1.4', // New: for subheadings and quotes
      lineHeightLoose: '1.5', // Body text (24px / 16px)
      lineHeightArticle: '1.6', // Comfortable reading
    },
    spacing: {
      spacingXs: '0.25rem', // 4px
      spacingSm: '0.5rem', // 8px - base grid unit
      spacingMd: '1rem', // 16px - paragraph spacing
      spacingLg: '1.5rem', // 24px - gutters
      spacingXl: '2rem', // 32px - gutters/padding
      spacing2xl: '2.5rem', // 40px - section padding (updated: was 3rem/48px)
      spacing3xl: '4rem', // 64px
    },
    layout: {
      containerMaxWidth: '1200px', // Updated: was 1280px
      containerPaddingX: '1rem', // 16px mobile
      containerPaddingXMd: '1.5rem', // 24px desktop (updated: was 2rem/32px)
      articleMaxWidth: '850px', // Updated: was 1200px - optimal for 60-75 chars
      headerTopHeight: '32px',
      headerLogoSize: '40px',
      headerNavHeight: '44px',
      buttonBorderRadius: '2px',
      buttonPaddingX: '16px',
      buttonPaddingY: '8px',
      borderWidth: '1px',
      borderRadius: '0',
      transitionFast: '150ms',
      transitionBase: '200ms',
      transitionSlow: '300ms',
    },
  }

  // Basic settings - includes all new fields including design system
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {
      siteName: 'AI Tech News',
      logoUrl: '/logo.png',
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
      designSystemColorsJson: JSON.stringify(defaultDesignSystem.colors),
      designSystemTypographyJson: JSON.stringify(defaultDesignSystem.typography),
      designSystemSpacingJson: JSON.stringify(defaultDesignSystem.spacing),
      designSystemLayoutJson: JSON.stringify(defaultDesignSystem.layout),
    },
    create: {
      id: 'default',
      siteName: 'AI Tech News',
      logoUrl: '/logo.png',
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
      // Design system settings with defaults
      designSystemColorsJson: JSON.stringify(defaultDesignSystem.colors),
      designSystemTypographyJson: JSON.stringify(defaultDesignSystem.typography),
      designSystemSpacingJson: JSON.stringify(defaultDesignSystem.spacing),
      designSystemLayoutJson: JSON.stringify(defaultDesignSystem.layout),
    },
  })

  // NOTE: Editors, Categories, and Articles are imported from WordPress
  // Use the WordPress import script: npm run import:wordpress
  // This seed file only contains essential non-WordPress data (settings, static pages, subscribers)

  // Subscribers - sample email list (not imported from WordPress)
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

  console.log('✅ Seeded: settings, subscribers, and static pages')
  console.log(`✅ Created ${await prisma.subscriber.count()} subscribers`)
  console.log(`✅ Created ${await prisma.staticPage.count()} static pages`)
  console.log('\n📝 Note: Editors, Categories, and Articles should be imported from WordPress using:')
  console.log('   npm run import:wordpress -- --url https://your-wordpress-site.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
