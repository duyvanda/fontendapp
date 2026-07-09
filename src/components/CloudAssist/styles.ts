import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '@/styles/global';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const biraStyles = StyleSheet.create({
  // Modal & Overlay
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '85%',
    width: '100%',
    alignSelf: 'center',
    maxWidth: isTablet ? 600 : '100%',
    ...shadows.lg,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    backgroundColor: colors.primarySubtle,
    padding: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textCaption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },

  // Messages Area
  messagesList: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageWrapper: {
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  messageUser: {
    alignSelf: 'flex-end',
  },
  messageBot: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  messageTextUser: {
    ...typography.body,
    color: colors.textInverse,
  },
  messageTextBot: {
    ...typography.body,
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textCaption,
    marginTop: 4,
    marginHorizontal: 4,
  },
  timestampUser: {
    alignSelf: 'flex-end',
  },
  timestampBot: {
    alignSelf: 'flex-start',
  },

  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  attachButton: {
    padding: spacing.sm,
    marginRight: 4,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    ...shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },

  // Suggestions
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 13,
  },

  // Attachments
  attachmentsArea: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  attachmentName: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    marginLeft: 6,
    marginRight: spacing.sm,
  },

  // Limit Badge
  limitBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginLeft: 4,
  },
  limitBadgeWarning: {
    backgroundColor: colors.warningLight,
  },
  limitBadgeDanger: {
    backgroundColor: colors.error,
  },
  limitText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textCaption,
  },
  limitTextDanger: {
    color: colors.textInverse,
  },
});
