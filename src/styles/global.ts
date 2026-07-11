import { StyleSheet } from 'react-native';

// ─── App Color System ────────────────────────────────────────────────────────
export const colors = {
  // Primary — Teal gradient
  primary: '#00A79D',
  primaryDark: '#00766E',
  primaryLight: '#e6f9f8',
  primarySubtle: 'rgba(0,167,157,0.1)',

  // Background
  background: '#f8fafc',
  surface: '#ffffff',

  // Text hierarchy
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textCaption: '#94a3b8',
  textInverse: '#ffffff',

  // Border
  border: '#e2e8f0',
  borderFocus: '#00A79D',

  // Semantic
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Favorites
  star: '#f5c518',

  // Overlays
  overlay: 'rgba(0,0,0,0.4)',
  cardShadowColor: '#000000',
};

// ─── Spacing System (8px base) ─────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius ─────────────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 50,
  full: 9999,
};

// ─── Typography ────────────────────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, color: colors.textCaption, letterSpacing: 0.5 },
  label: { fontSize: 12, fontWeight: '700' as const, color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' as const },
  button: { fontSize: 15, fontWeight: '700' as const, color: colors.textInverse, letterSpacing: 0.3 },
};

// ─── Shadows ───────────────────────────────────────────────────────────────────
export const shadows = {
  none: {},
  sm: {
    shadowColor: colors.cardShadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.cardShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.cardShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  teal: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
export const globalStyles = StyleSheet.create({
  ...typography,
  // Containers
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.md,
  },
  cardLg: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    ...shadows.teal,
  },
  btnPrimaryText: {
    ...typography.button,
    color: colors.textInverse,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  btnSecondaryText: {
    ...typography.button,
    color: colors.primary,
  },
  btnDanger: {
    backgroundColor: colors.error,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Input
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    ...shadows.teal,
  },

  // Section header
  sectionHeader: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  dividerDashed: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },

  // Row/flex helpers
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  // Badge/chip
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.primary,
  },

  // Empty / error states
  emptyContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textCaption,
    textAlign: 'center' as const,
    marginTop: spacing.md,
  },
});
