/**
 * SERVZ'IT Design Tokens
 * Premium Indian Local Services & Commerce Marketplace
 * Brand Archetype: Emerald Trust + Amber Value + Slate Clarity
 */

export const Colors = {
  // Brand Primary: Imperial Deep Emerald (PhonePe & Indian Commerce Standard)
  primary: '#056B42',
  primaryDark: '#03452B',
  primaryLight: '#0D8F5B',
  primaryMuted: '#E8F5EF',
  primaryBorder: '#B1DFCA',
  primaryGlow: 'rgba(5, 107, 66, 0.15)',

  // Brand Secondary & Accents
  accentGreen: '#10B981',
  accentGreenLight: '#D1FAE5',
  accentAmber: '#F59E0B',
  accentAmberDark: '#D97706',
  accentAmberLight: '#FEF3C7',
  accentIndigo: '#3B49DF',
  accentIndigoLight: '#EEF2FF',
  accentBlue: '#2563EB',
  accentBlueLight: '#EFF6FF',
  accentPurple: '#7C3AED',
  accentPurpleLight: '#F5F3FF',
  accentSaffron: '#EA580C',
  accentSaffronLight: '#FFF7ED',
  accentRose: '#E11D48',
  accentRoseLight: '#FFE4E6',

  // Semantic Status
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#EA580C',
  warningLight: '#FFEDD5',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // Verified & Trust Badges
  verified: '#056B42',
  verifiedBg: '#E8F5EF',
  starRating: '#F59E0B',
  starEmpty: '#E2E8F0',

  // Neutrals (Slate scale)
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textTertiary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Surfaces & Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfaceSubtle: '#F8FAFC',

  // Borders & Dividers
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  borderLight: '#F1F5F9',

  // Category Accent Backgrounds (Subtle, non-jarring)
  catElectric: '#EFF6FF',
  catPlumbing: '#F0FDF4',
  catCleaning: '#FAF5FF',
  catCarpentry: '#FFFBEB',
  catPainting: '#FFF1F2',
  catAc: '#ECFEFF',
  catAppliance: '#F5F3FF',
  catPest: '#FEF3C7',
  catMovers: '#F0F9FF',
  catSolar: '#FFF7ED',
  catHostel: '#FFF7ED',
  catShamiyana: '#FEF2F2',
  catPlots: '#ECFDF5',
  catRentals: '#F1F5F9',
};

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  h1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700' as const,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
  kicker: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
};

