import React from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MockProvider } from '../../data/mockMarketplace';
import { Colors, Radius, Shadows } from '../../theme/tokens';
import { DistanceBadge, RatingBadge, StatusPill, VerifiedBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

interface ProviderCardProps {
  provider: MockProvider;
  onPress: () => void;
  onBookNow: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onPress,
  onBookNow,
}) => {
  // Category-specific pricing kicker & custom formatting
  let kicker = 'STARTING AT';
  let formattedPrice = `₹${provider.startingPrice}`;
  let ctaLabel = 'Book Now';

  switch (provider.categorySlug) {
    case 'hostel-pg':
      kicker = 'HOSTEL / PG RENT';
      formattedPrice = '₹6,500 / mo with Food';
      ctaLabel = 'Visit Hostel';
      break;
    case 'shamiyana-events':
      kicker = 'SHAMIYANA & SOUND';
      formattedPrice = 'From ₹8,000 Package';
      ctaLabel = 'Book Setup';
      break;
    case 'land-sale':
      kicker = 'PLOT SPECIFICATION';
      formattedPrice = provider.attributes?.pricePerSqYd
        ? `₹${provider.attributes.pricePerSqYd.toLocaleString('en-IN')} / Yd`
        : 'Free Site Visit';
      ctaLabel = 'Free Site Visit';
      break;
    case 'priest':
      kicker = 'VEDIC DAKSHINA';
      formattedPrice = `₹${provider.startingPrice.toLocaleString('en-IN')} / Pooja`;
      ctaLabel = 'Book Pooja';
      break;
    case 'car-rentals':
      kicker = 'CHAUFFEUR FLEET';
      formattedPrice = 'From ₹11 / km';
      ctaLabel = 'Book Ride';
      break;
    case 'photography':
      kicker = 'EVENT PACKAGE';
      formattedPrice = `₹${provider.startingPrice.toLocaleString('en-IN')} / Day`;
      ctaLabel = 'Reserve Date';
      break;
    case 'property-rent':
      kicker = 'MONTHLY RENT';
      formattedPrice = `₹${provider.startingPrice.toLocaleString('en-IN')} / mo`;
      ctaLabel = 'Visit Flat';
      break;
    default:
      if (provider.pricingModel === 'inspection') {
        kicker = 'INSPECTION CHARGE';
        formattedPrice = `₹${provider.startingPrice} Visit`;
        ctaLabel = 'Book Visit';
      } else if (provider.pricingModel === 'quote') {
        kicker = 'CUSTOM QUOTE';
        formattedPrice = 'Free Estimate';
        ctaLabel = 'Get Quote';
      } else {
        kicker = 'SERVICE RATE';
        formattedPrice = `₹${provider.startingPrice}`;
        ctaLabel = 'Book Service';
      }
      break;
  }

  const highlightPills = provider.attributes?.highlightPills || [];
  const hasPhotos = provider.photos && provider.photos.length > 0;

  const handleCall = (e: any) => {
    e.stopPropagation();
    Alert.alert(
      `Call ${provider.businessName}`,
      'Initiating direct partner voice call via SERVZ’IT / Skazo direct connect.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Call Now', onPress: () => Linking.openURL('tel:+919876543210') }]
    );
  };

  const handleWhatsApp = (e: any) => {
    e.stopPropagation();
    Alert.alert(
      `WhatsApp ${provider.businessName}`,
      'Opening WhatsApp chat to inquire about pricing, availability and photos.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Open WhatsApp', onPress: () => Linking.openURL('https://wa.me/919876543210') }]
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${provider.businessName} profile`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Photo Preview Thumbnail Banner if Available */}
      {hasPhotos && (
        <View style={styles.photoBannerWrapper}>
          <Image source={{ uri: provider.photos![0] }} style={styles.photoBanner} />
          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountText}>📷 {provider.photos!.length} Photos</Text>
          </View>
          <View style={styles.categoryPillOverPhoto}>
            <Text style={styles.categoryPillOverPhotoText}>
              {provider.categoryNameEn.toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {/* Top Header Row */}
      <View style={styles.topRow}>
        {!hasPhotos && (
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: provider.avatarBg || Colors.primaryMuted },
              ]}
            >
              <Text style={styles.avatarLetter}>{provider.avatarLetter}</Text>
            </View>
          </View>
        )}

        <View style={styles.titleColumn}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.businessName}>
              {provider.businessName}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.tagline}>
            {provider.tagline}
          </Text>
          <View style={styles.badgeRow}>
            {provider.isVerified ? <VerifiedBadge size="sm" /> : null}
            <RatingBadge
              rating={provider.rating}
              reviewCount={provider.reviewCount}
              size="sm"
            />
            <DistanceBadge distanceMeters={provider.distanceKm * 1000} />
          </View>
        </View>
      </View>

      {/* Domain-Specific Highlight Pills */}
      {highlightPills.length > 0 && (
        <View style={styles.highlightPillsContainer}>
          {highlightPills.slice(0, 3).map((pill, idx) => (
            <View key={idx} style={styles.domainPill}>
              <Text style={styles.domainPillText}>{pill}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Middle Service / Specs Row with Direct Call & WhatsApp */}
      <View style={styles.specsRow}>
        <View style={styles.localityItem}>
          <Icon name="location" size={12} color={Colors.textTertiary} />
          <Text numberOfLines={1} style={styles.localityText}>
            {provider.locality}, {provider.city}
          </Text>
        </View>

        {/* Skazo Quick Action Pills: Call & WhatsApp */}
        <View style={styles.quickContactRow}>
          <Pressable onPress={handleWhatsApp} style={styles.whatsappBtn}>
            <Text style={styles.whatsappBtnText}>💬 WhatsApp</Text>
          </Pressable>
          <Pressable onPress={handleCall} style={styles.callBtn}>
            <Text style={styles.callBtnText}>📞 Call</Text>
          </Pressable>
        </View>
      </View>

      {/* Pricing & Booking CTA Footer */}
      <View style={styles.footerRow}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceKicker}>{kicker}</Text>
          <Text style={styles.priceAmount}>{formattedPrice}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={styles.detailsBtn}
          >
            <Text style={styles.detailsBtnText}>Details</Text>
          </Pressable>

          <Button
            label={ctaLabel}
            size="sm"
            onPress={onBookNow}
            accessibilityLabel={`Book service with ${provider.businessName}`}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 15,
    marginBottom: 14,
    ...Shadows.sm,
  },
  cardPressed: {
    borderColor: Colors.primaryBorder,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  titleColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  tagline: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  highlightPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  domainPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  domainPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  localityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  localityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceColumn: {},
  priceKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.textTertiary,
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceMuted,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  photoBannerWrapper: {
    height: 140,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  photoBanner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryPillOverPhoto: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(5, 107, 66, 0.9)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: Radius.full,
  },
  categoryPillOverPhotoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quickContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whatsappBtn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  whatsappBtnText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  callBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  callBtnText: {
    color: '#3B49DF',
    fontSize: 10,
    fontWeight: '800',
  },
});

