import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { restoreSession, SignedInUser } from '../../src/auth/session';
import {
  CategoryTile,
  CATEGORY_VISUALS,
} from '../../src/components/common/CategoryIllustration';
import { Icon } from '../../src/components/common/Icon';
import { BannerCarousel } from '../../src/components/home/BannerCarousel';
import { LocationHeader } from '../../src/components/home/LocationHeader';
import { ProviderCard } from '../../src/components/home/ProviderCard';
import { SearchBarHero } from '../../src/components/home/SearchBarHero';
import { PartnerDashboardView } from '../../src/components/partner/PartnerDashboardView';
import { useAppMode } from '../../src/context/AppModeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useLocationContext } from '../../src/context/LocationContext';
import { useMarketplace } from '../../src/context/MarketplaceContext';
import { INITIAL_AREA_AD_BLOCKS } from '../../src/data/areaAdBlocks';
import {
  MOCK_LOCAL_BUSINESSES,
  MOCK_PROPERTIES,
  MOCK_PROVIDERS,
  MockProvider,
  PromoBanner,
} from '../../src/data/mockMarketplace';
import { Colors, Radius, Shadows, Typography } from '../../src/theme/tokens';

export default function UnifiedHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { mode } = useAppMode();
  const { currentArea, openAreaModal } = useLocationContext();
  const { providers } = useMarketplace();

  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    restoreSession().then((user) => {
      if (active) setSignedInUser(user);
    });
    return () => {
      active = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // If in Provider / Partner Mode, render the Partner Business Dashboard directly!
  if (mode === 'provider') {
    return <PartnerDashboardView />;
  }

  // Filter Area-targeted Ad Banners
  const areaBanners: PromoBanner[] = INITIAL_AREA_AD_BLOCKS.filter(
    (b) =>
      b.isActive &&
      (b.targetAreaId === 'all' ||
        b.targetAreaId === currentArea.id ||
        b.targetAreaName.toLowerCase().includes(currentArea.name.toLowerCase()))
  ).map((b) => ({
    id: b.id,
    badge: b.badge,
    title: b.title,
    subtitle: b.subtitle,
    ctaText: `${b.discountPercentage}% OFF`,
    bgColor: b.bgColor,
    textColor: b.textColor,
    accentColor: b.accentColor,
    categorySlug: b.categorySlug || 'electrical',
  }));

  // All 18 categories for comprehensive local services & commerce
  const allCategories = Object.values(CATEGORY_VISUALS);

  // Filter providers dynamically based on selected locality
  const areaProviders = providers.filter(
    (p) =>
      p.locality.toLowerCase().includes(currentArea.name.toLowerCase()) ||
      p.city.toLowerCase().includes(currentArea.city.toLowerCase()) ||
      currentArea.name === 'Madhapur'
  );

  const filteredProviders = selectedCategory
    ? areaProviders.filter((p) => p.categorySlug === selectedCategory)
    : areaProviders;

  return (
    <View style={styles.container}>
      {/* Location Header - with built-in PhonePe-style pulsing radar & 1-tap mode switch */}
      <LocationHeader
        locality={currentArea.name}
        city={currentArea.city}
        pincode={currentArea.pincode}
        userInitial={signedInUser?.displayName?.slice(0, 1) || 'S'}
        onPressLocation={openAreaModal}
        onPressProfile={() => router.push('/(tabs)/profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 70 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Prominent Search Bar */}
        <SearchBarHero
          onPress={() => router.push('/search')}
          placeholder={t.searchPlaceholder}
        />

        {/* Dynamic Hyper-Local Promotional Campaign Banners */}
        {areaBanners.length > 0 ? (
          <BannerCarousel
            banners={areaBanners}
            onSelectBanner={(banner) => {
              router.push({
                pathname: '/category-detail',
                params: {
                  slug: banner.categorySlug,
                  title: banner.title,
                },
              });
            }}
          />
        ) : null}

        {/* Service & Commerce Categories Grid (Comprehensive 18 Categories) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>{t.whatDoYouNeed}</Text>
              <Text style={styles.sectionTitle}>{t.servicesAndRepairs}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.seeAllText}>
                {t.seeAll} ({allCategories.length}) ›
              </Text>
            </Pressable>
          </View>

          <View style={styles.categoryGrid}>
            {allCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <Pressable
                  key={cat.slug}
                  accessibilityRole="button"
                  accessibilityLabel={`Select category ${cat.nameEn}`}
                  onPress={() => {
                    router.push({
                      pathname: '/category-detail',
                      params: {
                        slug: cat.slug,
                        nameEn: cat.nameEn,
                        nameTe: cat.nameTe,
                        nameHi: cat.nameHi,
                      },
                    });
                  }}
                  style={styles.categoryItem}
                >
                  <CategoryTile
                    slug={cat.slug}
                    language={language}
                    selected={isSelected}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Dedicated Future Ad Space / Sponsored Video Slot */}
        <View style={styles.adShowcaseContainer}>
          <View style={styles.adShowcaseHeader}>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>SPONSORED SHOWCASE</Text>
            </View>
            <Text style={styles.adAreaTag}>Targeted: {currentArea.name}</Text>
          </View>

          <View style={styles.adShowcaseCard}>
            <View style={styles.adCardBody}>
              <View style={styles.adIconBox}>
                <Text style={{ fontSize: 24 }}>📺</Text>
              </View>
              <View style={styles.adContentCol}>
                <Text style={styles.adTitle}>
                  {language === 'te'
                    ? 'మీ ఏరియా స్థానిక వ్యాపార ఆఫర్లు'
                    : language === 'hi'
                    ? 'आपके क्षेत्र के स्थानीय व्यापार ऑफर'
                    : 'Local Business Video & Campaign Space'}
                </Text>
                <Text style={styles.adSubtitle}>
                  {language === 'te'
                    ? 'స్థానిక ఎలక్ట్రానిక్స్, కార్ల అద్దెలు మరియు రియల్ ఎస్టేట్ కోసం ప్రత్యేక స్థలం'
                    : language === 'hi'
                    ? 'स्थानीय इलेक्ट्रॉनिक्स, कार रेंटल और रियल एस्टेट हेतु विशेष स्थान'
                    : 'Dedicated slot for hyper-local video promos, verified offers & merchant spotlight'}
                </Text>
              </View>
            </View>
            <View style={styles.adCardFooter}>
              <Text style={styles.adFooterNote}>⚡ Admin Managed Ad Slot</Text>
              <View style={styles.adCtaPill}>
                <Text style={styles.adCtaText}>Explore Offers ›</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 1-Tap Quick Booking Fixes */}
        <View style={styles.section}>
          <Text style={styles.sectionKicker}>{t.quickFixes}</Text>
          <Text style={styles.sectionTitle}>
            {language === 'te'
              ? 'త్వరిత సేవలు & ధరలు'
              : language === 'hi'
              ? 'त्वरित सेवाएं और दरें'
              : 'Popular 1-Tap Repairs'}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickServicesScroll}
          >
            {[
              { title: 'Fan Spark Fix', price: '₹199', icon: 'bolt', slug: 'electrical' },
              { title: 'AC Jet Pump Wash', price: '₹449', icon: 'snowflake', slug: 'ac-service' },
              { title: 'Purohit Pooja Booking', price: '₹3,500', icon: 'om', slug: 'priest' },
              { title: 'Open Plot Verification', price: 'Free', icon: 'land', slug: 'land-sale' },
              { title: 'Tap Leak Repair', price: '₹199', icon: 'wrench', slug: 'plumbing' },
              { title: 'Airport Cab Rental', price: '₹799', icon: 'car', slug: 'car-rentals' },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/category-detail',
                    params: { slug: item.slug, title: item.title },
                  })
                }
                style={styles.quickServiceChip}
              >
                <View style={styles.quickIconWrap}>
                  <Icon name={item.icon as any} size={16} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.quickTitle}>{item.title}</Text>
                  <Text style={styles.quickPrice}>{item.price}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Top-Rated Verified Professionals on Premises */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>{t.verifiedPros}</Text>
              <Text style={styles.sectionTitle}>
                {t.topRatedNearYou} ({currentArea.name})
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/providers')}
            >
              <Text style={styles.seeAllText}>
                {t.seeAll} ({filteredProviders.length}) ›
              </Text>
            </Pressable>
          </View>

          {filteredProviders.slice(0, 3).map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onPress={() =>
                router.push({
                  pathname: '/provider-detail',
                  params: { id: provider.id },
                })
              }
              onBookNow={() =>
                router.push({
                  pathname: '/book-service',
                  params: {
                    providerId: provider.id,
                    businessName: provider.businessName,
                    categorySlug: provider.categorySlug,
                    serviceName: provider.services[0]?.name || 'Standard Service',
                    price: String(provider.startingPrice),
                    pricingModel: provider.pricingModel,
                  },
                })
              }
            />
          ))}
        </View>

        {/* Properties & Land Opportunities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>REAL ESTATE & PLOTS</Text>
              <Text style={styles.sectionTitle}>
                {language === 'te'
                  ? 'స్థలాలు & ఇళ్ల అద్దెలు'
                  : language === 'hi'
                  ? 'प्लॉट और मकान किराया'
                  : 'Land for Sale & Flat Rentals'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/category-detail',
                  params: { slug: 'land-sale' },
                })
              }
            >
              <Text style={styles.seeAllText}>{t.seeAll} ›</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopScroll}
          >
            {MOCK_PROPERTIES.map((prop) => (
              <Pressable
                key={prop.id}
                onPress={() =>
                  router.push({
                    pathname: '/category-detail',
                    params: { slug: prop.type === 'commercial' ? 'land-sale' : 'property-rent' },
                  })
                }
                style={styles.propertyCard}
              >
                <View style={styles.propTypeBadge}>
                  <Text style={styles.propTypeText}>
                    {prop.type === 'commercial' ? 'OPEN PLOT / LAND' : 'FLAT RENTAL'}
                  </Text>
                </View>
                <Text numberOfLines={1} style={styles.propTitle}>
                  {prop.title}
                </Text>
                <Text style={styles.propLocation}>📍 {prop.locality}, {prop.city}</Text>
                <Text style={styles.propPrice}>{prop.priceFormatted}</Text>
                <View style={styles.propFeaturesRow}>
                  {prop.features.slice(0, 2).map((f, i) => (
                    <Text key={i} style={styles.propFeaturePill}>
                      ✓ {f}
                    </Text>
                  ))}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Platform Trust & Safety Guarantee Banner */}
        <View style={styles.trustBanner}>
          <Icon name="shield-check" size={28} color={Colors.primary} />
          <View style={styles.trustTextWrapper}>
            <Text style={styles.trustTitle}>{t.customerPromise}</Text>
            <Text style={styles.trustDesc}>{t.customerPromiseDesc}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionKicker: {
    ...Typography.kicker,
    color: Colors.primaryDark,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
  },
  adShowcaseContainer: {
    marginHorizontal: 16,
    marginTop: 18,
  },
  adShowcaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  adBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.4,
  },
  adAreaTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  adShowcaseCard: {
    backgroundColor: '#0A2518',
    borderRadius: Radius.xxl,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  adCardBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  adIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adContentCol: {
    flex: 1,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  adSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
    lineHeight: 15,
  },
  adCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  adFooterNote: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '700',
  },
  adCtaPill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  adCtaText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  quickServicesScroll: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 6,
  },
  quickServiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: Radius.lg,
    gap: 8,
    ...Shadows.sm,
  },
  quickIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  shopScroll: {
    gap: 12,
  },
  propertyCard: {
    width: 220,
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: 14,
    ...Shadows.sm,
  },
  propTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  propTypeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
  },
  propTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  propLocation: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  propPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginTop: 6,
  },
  propFeaturesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  propFeaturePill: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    gap: 14,
  },
  trustTextWrapper: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  trustDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginTop: 3,
  },
});
