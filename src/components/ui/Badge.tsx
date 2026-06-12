import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, variantStyles[variant]]}>
      <Text style={[styles.text, textVariantStyles[variant]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.smallBold,
  },
});

const variantStyles: Record<BadgeVariant, { backgroundColor: string }> = {
  primary: { backgroundColor: colors.primary },
  success: { backgroundColor: colors.success },
  warning: { backgroundColor: colors.warning },
  danger: { backgroundColor: colors.danger },
  neutral: { backgroundColor: colors.textMuted },
};

const textVariantStyles: Record<BadgeVariant, { color: string }> = {
  primary: { color: colors.textInverse },
  success: { color: colors.textInverse },
  warning: { color: colors.textInverse },
  danger: { color: colors.textInverse },
  neutral: { color: colors.textInverse },
};