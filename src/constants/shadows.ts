import { Platform, ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
  card: Platform.select({
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
  }) as ViewStyle,
  elevated: Platform.select({
    web: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  }) as ViewStyle,
};