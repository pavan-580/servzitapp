import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PromoBanner } from '../../data/mockMarketplace';
import { Colors, Radius, Shadows } from '../../theme/tokens';
import { Icon } from '../common/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 44;

interface BannerCarouselProps {
  banners: PromoBanner[];
  onSelectBanner: (banner: PromoBanner) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  onSelectBanner,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} banner`}
            onPress={() => onSelectBanner(item)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: item.bgColor },
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                ]}
              >
                <Text style={[styles.badgeText, { color: item.accentColor }]}>
                  {item.badge}
                </Text>
              </View>
              <View style={styles.verifiedIconWrap}>
                <Icon name="shield-check" size={14} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.title, { color: item.textColor }]}>
              {item.title}
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.subtitle,
                { color: 'rgba(255, 255, 255, 0.85)' },
              ]}
            >
              {item.subtitle}
            </Text>

            <View style={styles.footerRow}>
              <View
                style={[
                  styles.ctaButton,
                  { backgroundColor: item.accentColor },
                ]}
              >
                <Text style={styles.ctaText}>{item.ctaText}</Text>
                <Icon name="chevron-right" size={12} color="#0F172A" />
              </View>
              <Text style={styles.guaranteeText}>SERVZ'IT Assured</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.xl,
    padding: 18,
    justifyContent: 'space-between',
    minHeight: 140,
    ...Shadows.md,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  verifiedIconWrap: {
    opacity: 0.8,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: Radius.full,
    gap: 4,
  },
  ctaText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  guaranteeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
});

