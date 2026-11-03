import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/tokens';

export type IconName =
  | 'home'
  | 'explore'
  | 'calendar'
  | 'chat'
  | 'user'
  | 'search'
  | 'location'
  | 'filter'
  | 'star'
  | 'shield-check'
  | 'verified'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'clock'
  | 'phone'
  | 'whatsapp'
  | 'check'
  | 'close'
  | 'share'
  | 'heart'
  | 'heart-filled'
  | 'bolt'
  | 'wrench'
  | 'snowflake'
  | 'sparkles'
  | 'hammer'
  | 'brush'
  | 'bug'
  | 'truck'
  | 'tv'
  | 'sun'
  | 'store'
  | 'home-modern'
  | 'key'
  | 'tag'
  | 'info'
  | 'bell'
  | 'camera'
  | 'om'
  | 'car'
  | 'land'
  | 'building'
  | 'scissors'
  | 'shield'
  | 'cctv'
  | 'tent'
  | 'bed'
  | 'speaker'
  | 'image'
  | 'plus'
  | 'trash';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
  variant?: 'plain' | 'circle' | 'squircle';
  bgColor?: string;
}

// Crisp, high-contrast, platform-consistent glyphs & micro-vectors
const glyphMap: Record<IconName, string> = {
  home: '⌂',
  explore: '✦',
  calendar: '▤',
  chat: '●',
  user: '👤',
  search: '⚲',
  location: '📍',
  filter: '⑉',
  star: '★',
  'shield-check': '🛡',
  verified: '✓',
  'chevron-right': '›',
  'chevron-left': '‹',
  'chevron-down': '⌄',
  clock: '◷',
  phone: '📞',
  whatsapp: '💬',
  check: '✓',
  close: '✕',
  share: '↗',
  heart: '♡',
  'heart-filled': '♥',
  bolt: '⚡',
  wrench: '🔧',
  snowflake: '❄',
  sparkles: '✨',
  hammer: '🔨',
  brush: '🖌',
  bug: '🐜',
  truck: '🚚',
  tv: '📺',
  sun: '☀️',
  store: '🏪',
  'home-modern': '🏢',
  key: '🔑',
  tag: '🏷',
  info: 'ℹ',
  bell: '🔔',
  camera: '📷',
  om: '🕉',
  car: '🚗',
  land: '🏞',
  building: '🏢',
  scissors: '✂',
  shield: '🛡',
  cctv: '📹',
  tent: '⛺',
  bed: '🛏',
  speaker: '🔊',
  image: '🖼',
  plus: '+',
  trash: '✕',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = Colors.textPrimary,
  style,
  variant = 'plain',
  bgColor,
}) => {
  // Verified emblem badge
  if (name === 'verified') {
    return (
      <View
        style={[
          styles.verifiedBadge,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color || Colors.primary,
          },
          style,
        ]}
      >
        <Text style={[styles.verifiedCheck, { fontSize: size * 0.65 }]}>✓</Text>
      </View>
    );
  }

  // Star Rating Badge
  if (name === 'star') {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Text style={[styles.starGlyph, { fontSize: size * 0.95, color }]}>★</Text>
      </View>
    );
  }

  // WhatsApp Icon
  if (name === 'whatsapp') {
    return (
      <View
        style={[
          styles.whatsappCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      >
        <Text style={[styles.whatsappText, { fontSize: size * 0.65 }]}>✆</Text>
      </View>
    );
  }

  const glyph = glyphMap[name] || '•';

  // Circle or Squircle container wrapper for ultra-premium look
  if (variant === 'circle' || variant === 'squircle') {
    const containerRadius = variant === 'circle' ? size * 0.8 : size * 0.35;
    return (
      <View
        style={[
          styles.badgedContainer,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: containerRadius,
            backgroundColor: bgColor || Colors.primaryMuted,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.glyph,
            {
              fontSize: size * 0.9,
              color,
            },
          ]}
        >
          {glyph}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text
        style={[
          styles.glyph,
          {
            fontSize: size * 0.88,
            color,
            lineHeight: size,
          },
        ]}
      >
        {glyph}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    textAlign: 'center',
  },
  starGlyph: {
    textAlign: 'center',
    lineHeight: 18,
  },
  verifiedBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },
  whatsappCircle: {
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },
});
