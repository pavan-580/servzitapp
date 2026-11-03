import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography } from '../../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const getContainerStyle = (pressed: boolean) => {
    const base: ViewStyle[] = [styles.base, styles[size]];

    switch (variant) {
      case 'primary':
        base.push(styles.primary);
        if (pressed) base.push(styles.primaryPressed);
        break;
      case 'secondary':
        base.push(styles.secondary);
        if (pressed) base.push(styles.secondaryPressed);
        break;
      case 'outline':
        base.push(styles.outline);
        if (pressed) base.push(styles.outlinePressed);
        break;
      case 'amber':
        base.push(styles.amber);
        if (pressed) base.push(styles.amberPressed);
        break;
      case 'ghost':
        base.push(styles.ghost);
        if (pressed) base.push(styles.ghostPressed);
        break;
    }

    if (disabled || loading) {
      base.push(styles.disabled);
    }

    if (style) base.push(style);
    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle[] = [styles.text, styles[`text_${size}` as keyof typeof styles] as TextStyle];

    switch (variant) {
      case 'primary':
      case 'amber':
        base.push(styles.textLight);
        break;
      case 'secondary':
        base.push(styles.textSecondary);
        break;
      case 'outline':
      case 'ghost':
        base.push(styles.textPrimaryColor);
        break;
    }

    if (textStyle) base.push(textStyle);
    return base;
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => getContainerStyle(pressed)}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' ? icon : null}
          <Text style={getTextStyle()}>{label}</Text>
          {icon && iconPosition === 'right' ? icon : null}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    gap: 8,
  },
  sm: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: Radius.lg,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  primaryPressed: {
    backgroundColor: Colors.primaryDark,
  },
  secondary: {
    backgroundColor: Colors.primaryMuted,
  },
  secondaryPressed: {
    backgroundColor: Colors.primaryBorder,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  outlinePressed: {
    backgroundColor: Colors.primaryMuted,
  },
  amber: {
    backgroundColor: Colors.accentAmberDark,
  },
  amberPressed: {
    backgroundColor: Colors.warning,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: Colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: 12,
  },
  text_md: {
    fontSize: 14,
  },
  text_lg: {
    fontSize: 16,
  },
  textLight: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: Colors.primaryDark,
  },
  textPrimaryColor: {
    color: Colors.primary,
  },
});

