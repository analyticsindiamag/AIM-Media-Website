/**
 * Design System Utility
 * Manages design system settings and generates CSS variables
 */

export interface DesignSystemColors {
  // Background colors
  bgWhite: string;
  bgBlack: string;
  bgDarkGray: string;
  bgLightGray: string;
  bgTicker: string;
  
  // Text colors
  textBlack: string;
  textWhite: string;
  textDarkGray: string;
  textMediumGray: string;
  textLightGray: string;
  
  // Border colors
  borderLight: string;
  borderMedium: string;
  borderDark: string;
  borderQuote: string; // New: for quote borders
  
  // Accent colors
  bluePrimary: string;
  blueHover: string;
  blueLight: string;
  redNegative: string;
  greenPositive: string;
  
  // Overlay colors
  overlayDark: string;
  overlayLight: string;
}

export interface DesignSystemTypography {
  // Font families
  fontSerif: string;
  fontSans: string;
  
  // Font sizes
  fontSizeTicker: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeBase: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontSize3xl: string;
  fontSize4xl: string;
  fontSize5xl: string;
  fontSize6xl: string;
  fontSize7xl: string;
  fontSizeQuote: string; // New: for pull quotes
  
  // Font weights
  fontWeightLight: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightSemibold: string;
  fontWeightBold: string;
  
  // Line heights
  lineHeightTight: string;
  lineHeightNormal: string;
  lineHeightRelaxed: string;
  lineHeightDeck: string; // New: for subheadings and quotes
  lineHeightLoose: string;
  lineHeightArticle: string;
}

export interface DesignSystemSpacing {
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  spacing3xl: string;
}

export interface DesignSystemLayout {
  containerMaxWidth: string;
  containerPaddingX: string;
  containerPaddingXMd: string;
  articleMaxWidth: string;
  headerTopHeight: string;
  headerLogoSize: string;
  headerNavHeight: string;
  buttonBorderRadius: string;
  buttonPaddingX: string;
  buttonPaddingY: string;
  borderWidth: string;
  borderRadius: string;
  transitionFast: string;
  transitionBase: string;
  transitionSlow: string;
}

export interface DesignSystem {
  colors: DesignSystemColors;
  typography: DesignSystemTypography;
  spacing: DesignSystemSpacing;
  layout: DesignSystemLayout;
}

// Default design system values (matching reference design system)
export const defaultDesignSystem: DesignSystem = {
  colors: {
    bgWhite: '#FFFFFF',
    bgBlack: '#000000',
    bgDarkGray: '#1a1a1a',
    bgLightGray: '#F8F8F8',
    bgTicker: '#2a2a2a',
    textBlack: '#111111',
    textWhite: '#ffffff',
    textDarkGray: '#333333',
    textMediumGray: '#666666',
    textLightGray: '#999999',
    borderLight: '#E5E5E5',
    borderMedium: '#cccccc',
    borderDark: '#333333',
    borderQuote: '#DDDDDD',
    bluePrimary: '#0050A4',
    blueHover: '#003d82',
    blueLight: '#0070f3',
    redNegative: '#dc3545',
    greenPositive: '#28a745',
    overlayDark: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
  typography: {
    fontSerif: "'Old Standard TT', 'EB Garamond', Georgia, 'Times', serif",
    fontSans: "'Merriweather', Georgia, serif",
    fontSizeTicker: '11px',
    fontSizeXs: '12px',
    fontSizeSm: '14px',
    fontSizeBase: '16px',
    fontSizeMd: '18px',
    fontSizeLg: '20px',
    fontSizeXl: '22px',
    fontSize2xl: '24px',
    fontSize3xl: '28px',
    fontSize4xl: '32px',
    fontSize5xl: '36px',
    fontSize6xl: '42px',
    fontSize7xl: '48px',
    fontSizeQuote: '20px',
    fontWeightLight: '300',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',
    lineHeightTight: '1.2',
    lineHeightNormal: '1.25',
    lineHeightRelaxed: '1.3',
    lineHeightDeck: '1.4',
    lineHeightLoose: '1.5',
    lineHeightArticle: '1.6',
  },
  spacing: {
    spacingXs: '0.25rem',
    spacingSm: '0.5rem',
    spacingMd: '1rem',
    spacingLg: '1.5rem',
    spacingXl: '2rem',
    spacing2xl: '2.5rem',
    spacing3xl: '4rem',
  },
  layout: {
    containerMaxWidth: '1200px',
    containerPaddingX: '1rem',
    containerPaddingXMd: '1.5rem',
    articleMaxWidth: '850px',
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
};

/**
 * Parse design system from database JSON strings
 */
export function parseDesignSystem(
  colorsJson?: string | null,
  typographyJson?: string | null,
  spacingJson?: string | null,
  layoutJson?: string | null
): DesignSystem {
  const colors: DesignSystemColors = colorsJson
    ? { ...defaultDesignSystem.colors, ...JSON.parse(colorsJson) }
    : defaultDesignSystem.colors;

  const typography: DesignSystemTypography = typographyJson
    ? { ...defaultDesignSystem.typography, ...JSON.parse(typographyJson) }
    : defaultDesignSystem.typography;

  const spacing: DesignSystemSpacing = spacingJson
    ? { ...defaultDesignSystem.spacing, ...JSON.parse(spacingJson) }
    : defaultDesignSystem.spacing;

  const layout: DesignSystemLayout = layoutJson
    ? { ...defaultDesignSystem.layout, ...JSON.parse(layoutJson) }
    : defaultDesignSystem.layout;

  return { colors, typography, spacing, layout };
}

/**
 * Generate CSS variables string from design system
 */
export function generateCSSVariables(designSystem: DesignSystem): string {
  const { colors, typography, spacing, layout } = designSystem;

  return `
    /* === COLORS === */
    --wsj-bg-white: ${colors.bgWhite};
    --wsj-bg-black: ${colors.bgBlack};
    --wsj-bg-dark-gray: ${colors.bgDarkGray};
    --wsj-bg-light-gray: ${colors.bgLightGray};
    --wsj-bg-ticker: ${colors.bgTicker};
    --wsj-text-black: ${colors.textBlack};
    --wsj-text-white: ${colors.textWhite};
    --wsj-text-dark-gray: ${colors.textDarkGray};
    --wsj-text-medium-gray: ${colors.textMediumGray};
    --wsj-text-light-gray: ${colors.textLightGray};
    --wsj-border-light: ${colors.borderLight};
    --wsj-border-medium: ${colors.borderMedium};
    --wsj-border-dark: ${colors.borderDark};
    --wsj-border-quote: ${colors.borderQuote};
    --wsj-blue-primary: ${colors.bluePrimary};
    --wsj-blue-hover: ${colors.blueHover};
    --wsj-blue-light: ${colors.blueLight};
    --wsj-red-negative: ${colors.redNegative};
    --wsj-green-positive: ${colors.greenPositive};
    --wsj-overlay-dark: ${colors.overlayDark};
    --wsj-overlay-light: ${colors.overlayLight};
    
    /* === TYPOGRAPHY === */
    --wsj-font-serif: ${typography.fontSerif};
    --wsj-font-sans: ${typography.fontSans};
    --wsj-font-size-ticker: ${typography.fontSizeTicker};
    --wsj-font-size-xs: ${typography.fontSizeXs};
    --wsj-font-size-sm: ${typography.fontSizeSm};
    --wsj-font-size-base: ${typography.fontSizeBase};
    --wsj-font-size-md: ${typography.fontSizeMd};
    --wsj-font-size-lg: ${typography.fontSizeLg};
    --wsj-font-size-xl: ${typography.fontSizeXl};
    --wsj-font-size-2xl: ${typography.fontSize2xl};
    --wsj-font-size-3xl: ${typography.fontSize3xl};
    --wsj-font-size-4xl: ${typography.fontSize4xl};
    --wsj-font-size-5xl: ${typography.fontSize5xl};
    --wsj-font-size-6xl: ${typography.fontSize6xl};
    --wsj-font-size-7xl: ${typography.fontSize7xl};
    --wsj-font-size-quote: ${typography.fontSizeQuote};
    --wsj-font-weight-light: ${typography.fontWeightLight};
    --wsj-font-weight-normal: ${typography.fontWeightNormal};
    --wsj-font-weight-medium: ${typography.fontWeightMedium};
    --wsj-font-weight-semibold: ${typography.fontWeightSemibold};
    --wsj-font-weight-bold: ${typography.fontWeightBold};
    --wsj-line-height-tight: ${typography.lineHeightTight};
    --wsj-line-height-normal: ${typography.lineHeightNormal};
    --wsj-line-height-relaxed: ${typography.lineHeightRelaxed};
    --wsj-line-height-deck: ${typography.lineHeightDeck};
    --wsj-line-height-loose: ${typography.lineHeightLoose};
    --wsj-line-height-article: ${typography.lineHeightArticle};
    
    /* === SPACING === */
    --wsj-spacing-xs: ${spacing.spacingXs};
    --wsj-spacing-sm: ${spacing.spacingSm};
    --wsj-spacing-md: ${spacing.spacingMd};
    --wsj-spacing-lg: ${spacing.spacingLg};
    --wsj-spacing-xl: ${spacing.spacingXl};
    --wsj-spacing-2xl: ${spacing.spacing2xl};
    --wsj-spacing-3xl: ${spacing.spacing3xl};
    
    /* === LAYOUT === */
    --wsj-container-max-width: ${layout.containerMaxWidth};
    --wsj-container-padding-x: ${layout.containerPaddingX};
    --wsj-container-padding-x-md: ${layout.containerPaddingXMd};
    --wsj-article-max-width: ${layout.articleMaxWidth};
    --wsj-header-top-height: ${layout.headerTopHeight};
    --wsj-header-logo-size: ${layout.headerLogoSize};
    --wsj-header-nav-height: ${layout.headerNavHeight};
    --wsj-button-border-radius: ${layout.buttonBorderRadius};
    --wsj-button-padding-x: ${layout.buttonPaddingX};
    --wsj-button-padding-y: ${layout.buttonPaddingY};
    --wsj-border-width: ${layout.borderWidth};
    --wsj-border-radius: ${layout.borderRadius};
    --wsj-transition-fast: ${layout.transitionFast};
    --wsj-transition-base: ${layout.transitionBase};
    --wsj-transition-slow: ${layout.transitionSlow};
  `.trim();
}

