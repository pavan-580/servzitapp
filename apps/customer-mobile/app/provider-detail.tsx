import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DistanceBadge, RatingBadge, StatusPill, VerifiedBadge } from '../src/components/common/Badge';
import { Button } from '../src/components/common/Button';
import { Icon } from '../src/components/common/Icon';
import { useMarketplace } from '../src/context/MarketplaceContext';
import { MOCK_PROVIDERS, MockProvider } from '../src/data/mockMarketplace';
import { Colors, Radius, Shadows, Typography } from '../src/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProviderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [activeTab, setActiveTab] = useState<'services' | 'about' | 'reviews'>('services');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const { providers } = useMarketplace();
  const provider: MockProvider =
    providers.find((p) => p.id === params.id) ||
    MOCK_PROVIDERS.find((p) => p.id === params.id) ||
    MOCK_PROVIDERS[0];

  const handleCall = () => {
    const phone = provider.phone || '+919876543210';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Direct Call', `Calling ${phone}`);
    });
  };

  const handleWhatsApp = () => {
    const raw = (provider.phone || '919876543210').replace(/[^0-9]/g, '');
    const cleanPhone = raw.startsWith('91') ? raw : `91${raw}`;
    const text = encodeURIComponent(
      `Hello ${provider.businessName}, I found your listing on Servzit Marketplace. I would like more details.`
    );
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Message ${provider.businessName} at +${cleanPhone}`);
    });
  };

  // Category-specific details & labels
  let kicker = 'STARTING FROM';
  let formattedPrice = `₹${provider.startingPrice}`;
  let ctaLabel = 'Request Booking';

  switch (provider.categorySlug) {
    case 'hostel-pg':
      kicker = 'HOSTEL / PG RENT';
      formattedPrice = '₹6,500 / mo with Food';
      ctaLabel = 'Schedule Hostel Visit';
      break;
    case 'shamiyana-events':
      kicker = 'SHAMIYANA & SOUND';
      formattedPrice = 'From ₹8,000 Package';
      ctaLabel = 'Book Event Setup';
      break;
    case 'land-sale':
      kicker = 'PLOT PRICING';
      formattedPrice = provider.attributes?.pricePerSqYd
        ? `₹${provider.attributes.pricePerSqYd.toLocaleString('en-IN')} / Yd`
        : 'Free Site Visit';
      ctaLabel = 'Book Free Site Visit';
      break;
    case 'priest':
      kicker = 'VEDIC DAKSHINA';
      formattedPrice = `₹${provider.startingPrice.toLocaleString('en-IN')} / Pooja`;
      ctaLabel = 'Book Vedic Pooja';
      break;
    case 'car-rentals':
      kicker = 'CHAUFFEUR FLEET';
      formattedPrice = 'From ₹11 / km';
      ctaLabel = 'Book Chauffeur Ride';
      break;
    case 'photography':
      kicker = 'EVENT PACKAGE';
      formattedPrice = `₹${provider.startingPrice.toLocaleString('en-IN')} / Day`;
      ctaLabel = 'Reserve Event Date';
      break;
    case 'property-rent':
      kicker = 'MONTHLY RENT';
      formattedPrice = `₹${provider.startingPrice.toLocaleString('en-IN')} / mo`;
      ctaLabel = 'Schedule House Visit';
      break;
    default:
      if (provider.pricingModel === 'inspection') {
        kicker = 'INSPECTION FEE';
        formattedPrice = `₹${provider.startingPrice} Visit`;
        ctaLabel = 'Book Technician';
      }
      break;
  }

  const photos = provider.photos || [];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          Provider Profile
        </Text>
        <View style={styles.headerActionBtn}>
          <Icon name="heart" size={20} color={Colors.textSecondary} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photo Gallery Banner / Carousel if provider has photos */}
        {photos.length > 0 && (
          <View style={styles.galleryContainer}>
            <Image
              source={{ uri: photos[activePhotoIdx] }}
              style={styles.mainGalleryImage}
            />
            {/* Overlay Badges */}
            <View style={styles.galleryOverlayTop}>
              <View style={styles.galleryCategoryBadge}>
                <Text style={styles.galleryCategoryBadgeText}>
                  {provider.categoryNameEn.toUpperCase()}
                </Text>
              </View>
              <View style={styles.galleryCountBadge}>
                <Text style={styles.galleryCountBadgeText}>
                  📷 {activePhotoIdx + 1}/{photos.length}
                </Text>
              </View>
            </View>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailStrip}
              >
                {photos.map((uri, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => setActivePhotoIdx(idx)}
                    style={[
                      styles.thumbnailBox,
                      activePhotoIdx === idx && styles.thumbnailBoxActive,
                    ]}
                  >
                    <Image source={{ uri }} style={styles.thumbnailImg} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: provider.avatarBg || Colors.primaryMuted },
              ]}
            >
              <Text style={styles.avatarLetter}>{provider.avatarLetter}</Text>
            </View>
            <View style={styles.heroBadges}>
              {provider.isVerified ? <VerifiedBadge size="md" /> : null}
              <StatusPill
                status={
                  provider.isAvailableNow ? 'available_now' : 'outside_hours'
                }
              />
            </View>
          </View>

          <Text style={styles.businessName}>{provider.businessName}</Text>
          <Text style={styles.tagline}>{provider.tagline}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <RatingBadge
                rating={provider.rating}
                reviewCount={provider.reviewCount}
                size="md"
              />
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{provider.experienceYears}+ Yrs</Text>
              <Text style={styles.metricSub}>Experience</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{provider.completedJobs}+</Text>
              <Text style={styles.metricSub}>Jobs Done</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <DistanceBadge distanceMeters={provider.distanceKm * 1000} />
            </View>
          </View>
        </View>

        {/* Skazo Quick Contact Strip: Direct WhatsApp & Call */}
        <View style={styles.quickContactCard}>
          <View style={styles.quickContactInfo}>
            <Text style={styles.quickContactTitle}>Direct Merchant Connect</Text>
            <Text style={styles.quickContactSub}>Connect directly for inquiries, rates & visits</Text>
          </View>
          <View style={styles.quickContactActions}>
            <Pressable onPress={handleWhatsApp} style={styles.whatsappActionBtn}>
              <Text style={styles.whatsappActionText}>💬 WhatsApp</Text>
            </Pressable>
            <Pressable onPress={handleCall} style={styles.callActionBtn}>
              <Text style={styles.callActionText}>📞 Call</Text>
            </Pressable>
          </View>
        </View>

        {/* Category-Specific Specifications Card: Hostel & PG */}
        {provider.categorySlug === 'hostel-pg' && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="bed" size={16} color="#EA580C" />
              <Text style={styles.domainSpecTitle}>Hostel & PG Amenities</Text>
            </View>
            <View style={styles.domainGrid}>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>HOSTEL CATEGORY</Text>
                <Text style={styles.domainVal}>{provider.attributes.hostelType || "Men's & Women's PG"}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>FOOD INCLUDED</Text>
                <Text style={styles.domainValHighlight}>{provider.attributes.foodFacility || '3 Times Unlimited'}</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>ROOM SHARING OPTIONS</Text>
                <Text style={styles.domainVal}>
                  {provider.attributes.sharingTypes?.join(' • ') || 'Single • 2-Sharing • 3-Sharing • 4-Sharing'}
                </Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>INCLUDED AMENITIES</Text>
                <View style={styles.amenityChipRow}>
                  {['High-Speed Wi-Fi', 'Daily Room Cleaning', 'RO Drinking Water', 'Washing Machines', 'Geyser in Bathrooms', '24x7 CCTV & Biometric', 'Power Backup Generator'].map((am, i) => (
                    <View key={i} style={styles.amenityChip}>
                      <Text style={styles.amenityChipText}>✓ {am}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>GATE CLOSING TIME</Text>
                <Text style={styles.domainVal}>10:30 PM (Biometric)</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>ZERO BROKERAGE</Text>
                <Text style={styles.domainValHighlight}>Direct Warden Contact</Text>
              </View>
            </View>
          </View>
        )}

        {/* Category-Specific Specifications Card: Shamiyana & Sound */}
        {provider.categorySlug === 'shamiyana-events' && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="tent" size={16} color="#DC2626" />
              <Text style={styles.domainSpecTitle}>Event Tent, Sound & Stage Specifications</Text>
            </View>
            <View style={styles.domainGrid}>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>TENT & SHADOW STRUCTURES</Text>
                <Text style={styles.domainVal}>
                  {provider.attributes.tentTypes?.join(' • ') || 'German Hangar • Waterproof Shamiyana • Pagoda'}
                </Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>SOUND SYSTEM & AUDIO SPECS</Text>
                <Text style={styles.domainValHighlight}>
                  {provider.attributes.soundSystemSpecs || 'JBL Dual 15" VRX Line Array + 4x Wireless Mics + Yamaha Mixer'}
                </Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>SILENT GENERATOR</Text>
                <Text style={styles.domainVal}>{provider.attributes.generatorCapacityKva || 25} kVA Silent DG Set</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>FURNITURE INVENTORY</Text>
                <Text style={styles.domainVal}>500 VIP Chairs • 20 Tables</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>POPULAR EVENT PACKAGES</Text>
                <Text style={styles.domainVal}>
                  {provider.attributes.packageTiers?.join(' • ') || 'Haldi / Mehendi • Wedding Reception • Corporate Stage'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Category-Specific Specifications Card */}
        {provider.categorySlug === 'land-sale' && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="shield-check" size={16} color="#059669" />
              <Text style={styles.domainSpecTitle}>HMDA & RERA Layout Approvals</Text>
            </View>
            <View style={styles.domainGrid}>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>APPROVAL AUTHORITY</Text>
                <Text style={styles.domainVal}>{provider.attributes.approvalAuthority || 'HMDA'}</Text>
                <Text style={styles.domainSubVal}>{provider.attributes.approvalNumber}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>SURVEY NUMBER</Text>
                <Text style={styles.domainVal}>{provider.attributes.surveyNo}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>AVAILABLE SIZES</Text>
                <Text style={styles.domainVal}>{provider.attributes.plotSizesSqYd?.join(' • ')}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>ROAD WIDTH</Text>
                <Text style={styles.domainVal}>{provider.attributes.roadWidthFt}ft BT Blacktop</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>TITLE STATUS & LEGAL</Text>
                <Text style={styles.domainVal}>{provider.attributes.titleClearStatus}</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>SITE VISIT TRANSPORT</Text>
                <Text style={styles.domainValHighlight}>{provider.attributes.siteVisitTransport}</Text>
              </View>
            </View>
          </View>
        )}

        {provider.categorySlug === 'priest' && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="om" size={16} color="#CA8A04" />
              <Text style={styles.domainSpecTitle}>Vedic Tradition & Pooja Credentials</Text>
            </View>
            <View style={styles.domainGrid}>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>VEDIC TRADITION</Text>
                <Text style={styles.domainVal}>{provider.attributes.vedicTradition}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>VEDA PATASHALA</Text>
                <Text style={styles.domainVal}>{provider.attributes.patashalaEducation}</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>POOJA SAMAGRI INCLUSION</Text>
                <Text style={styles.domainValHighlight}>
                  {provider.attributes.samagriKitProvided
                    ? 'Pure Cow Ghee & Complete Homa Dravyam Kit Included (or bring own)'
                    : 'List provided on WhatsApp'}
                </Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>RITUAL SPECIALIZATION</Text>
                <Text style={styles.domainVal}>
                  {provider.attributes.ritualsSpecialization?.join(' • ')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {provider.categorySlug === 'car-rentals' && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="car" size={16} color="#4F46E5" />
              <Text style={styles.domainSpecTitle}>Fleet Specs & Commercial Permits</Text>
            </View>
            <View style={styles.domainGrid}>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>AVAILABLE FLEET & RATES</Text>
                {provider.attributes.fleetModels?.map((car, idx) => (
                  <View key={idx} style={styles.fleetRow}>
                    <Text style={styles.fleetName}>{car.name}</Text>
                    <Text style={styles.fleetRate}>₹{car.perKm}/km</Text>
                  </View>
                ))}
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>CHAUFFEUR</Text>
                <Text style={styles.domainVal}>Police Verified in Uniform</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>PERMIT COVERAGE</Text>
                <Text style={styles.domainVal}>All India Tourist Permit</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>TOLL & PARKING</Text>
                <Text style={styles.domainVal}>{provider.attributes.tollParkingPolicy}</Text>
              </View>
            </View>
          </View>
        )}

        {provider.categorySlug === 'photography' && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="camera" size={16} color="#DB2777" />
              <Text style={styles.domainSpecTitle}>Gear Inventory & Deliverables</Text>
            </View>
            <View style={styles.domainGrid}>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>CAMERA GEAR & DRONES</Text>
                <Text style={styles.domainVal}>
                  {[...(provider.attributes.cameraBodies || []), ...(provider.attributes.lensesAndDrones || [])].join(' • ')}
                </Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>CLIENT DELIVERABLES</Text>
                {provider.attributes.deliverables?.map((d, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>✓</Text>
                    <Text style={styles.bulletText}>{d}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>ALBUM CRAFT</Text>
                <Text style={styles.domainVal}>{provider.attributes.albumType}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>DELIVERY TIMELINE</Text>
                <Text style={styles.domainValHighlight}>{provider.attributes.turnaroundDays} Days Total</Text>
              </View>
            </View>
          </View>
        )}

        {provider.categorySlug === 'property-rent' && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="building" size={16} color="#334155" />
              <Text style={styles.domainSpecTitle}>Apartment Specs & Society Amenities</Text>
            </View>
            <View style={styles.domainGrid}>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>AVAILABLE CONFIGURATIONS</Text>
                <Text style={styles.domainVal}>{provider.attributes.availableConfigs?.join(' • ')}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>FURNISHING</Text>
                <Text style={styles.domainVal}>{provider.attributes.furnishing}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>SECURITY DEPOSIT</Text>
                <Text style={styles.domainVal}>{provider.attributes.securityDepositMonths} Months Advance</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>WATER SUPPLY</Text>
                <Text style={styles.domainVal}>{provider.attributes.waterSupply}</Text>
              </View>
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>POWER BACKUP</Text>
                <Text style={styles.domainVal}>{provider.attributes.powerBackup}</Text>
              </View>
            </View>
          </View>
        )}

        {['electrical', 'plumbing', 'ac-service', 'cleaning'].includes(provider.categorySlug) && provider.attributes && (
          <View style={styles.domainSpecCard}>
            <View style={styles.domainSpecHeader}>
              <Icon name="shield-check" size={16} color={Colors.primary} />
              <Text style={styles.domainSpecTitle}>Certified Technical Standards</Text>
            </View>
            <View style={styles.domainGrid}>
              {provider.attributes.tradeLicenseNumber ? (
                <View style={styles.domainItem}>
                  <Text style={styles.domainLabel}>LICENSE NUMBER</Text>
                  <Text style={styles.domainVal}>{provider.attributes.tradeLicenseNumber}</Text>
                </View>
              ) : null}
              <View style={styles.domainItem}>
                <Text style={styles.domainLabel}>RE-WORK WARRANTY</Text>
                <Text style={styles.domainValHighlight}>{provider.attributes.reworkWarrantyDays}-Day Free Re-work</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>DIAGNOSTIC TOOLS EQUIPPED</Text>
                <Text style={styles.domainVal}>{provider.attributes.toolsEquipped?.join(' • ')}</Text>
              </View>
              <View style={styles.domainItemFull}>
                <Text style={styles.domainLabel}>SPARE PARTS POLICY</Text>
                <Text style={styles.domainVal}>{provider.attributes.sparePartsPolicy}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabsRow}>
          {[
            { id: 'services', label: `Services (${provider.services.length})` },
            { id: 'about', label: 'About & Hours' },
            { id: 'reviews', label: `Reviews (${provider.reviews.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id as typeof activeTab)}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    isActive && styles.tabBtnTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab 1: Services List */}
        {activeTab === 'services' && (
          <View style={styles.tabContent}>
            {provider.services.map((svc) => (
              <View key={svc.id} style={styles.serviceItemCard}>
                <View style={styles.svcTop}>
                  <Text style={styles.svcTitle}>{svc.name}</Text>
                  <Text style={styles.svcPrice}>₹{svc.price}</Text>
                </View>
                <Text style={styles.svcDesc}>{svc.description}</Text>
                <View style={styles.svcBottom}>
                  <View style={styles.durationTag}>
                    <Icon name="clock" size={11} color={Colors.textSecondary} />
                    <Text style={styles.durationText}>{svc.durationMin} mins</Text>
                  </View>
                  <Button
                    label={ctaLabel}
                    size="sm"
                    onPress={() => {
                      router.push({
                        pathname: '/book-service',
                        params: {
                          providerId: provider.id,
                          businessName: provider.businessName,
                          categorySlug: provider.categorySlug,
                          serviceName: svc.name,
                          price: String(svc.price),
                          pricingModel: svc.pricingModel,
                        },
                      });
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 2: About & Hours */}
        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Service Area Coverage</Text>
              <Text style={styles.infoText}>
                Covers up to 10 km radius around {provider.locality}, {provider.city} including Gachibowli, Jubilee Hills, and Hitec City.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Weekly Working Hours</Text>
              {[
                { day: 'Monday - Friday', hours: '09:00 AM - 07:30 PM' },
                { day: 'Saturday', hours: '09:00 AM - 08:00 PM' },
                { day: 'Sunday', hours: '10:00 AM - 04:00 PM (Emergency only)' },
              ].map((sch, i) => (
                <View key={i} style={styles.scheduleRow}>
                  <Text style={styles.scheduleDay}>{sch.day}</Text>
                  <Text style={styles.scheduleHours}>{sch.hours}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Verification & Compliance</Text>
              <View style={styles.verifyRow}>
                <Icon name="shield-check" size={16} color={Colors.primary} />
                <Text style={styles.verifyText}>Aadhaar & Police Verification: Verified</Text>
              </View>
              <View style={styles.verifyRow}>
                <Icon name="shield-check" size={16} color={Colors.primary} />
                <Text style={styles.verifyText}>Trade / Government License: Active</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            {provider.reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <Text style={styles.reviewLocality}>{r.locality} • {r.date}</Text>
                  </View>
                  <RatingBadge rating={r.rating} size="sm" />
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Persistent Bottom Booking Action Bar */}
      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.stickyPriceCol}>
          <Text style={styles.stickyKicker}>{kicker}</Text>
          <Text style={styles.stickyPrice}>{formattedPrice}</Text>
        </View>

        <View style={styles.stickyActionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call merchant"
            onPress={handleCall}
            style={styles.stickyCallBtn}
          >
            <Icon name="phone" size={16} color="#3B49DF" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="WhatsApp merchant"
            onPress={handleWhatsApp}
            style={styles.stickyWaBtn}
          >
            <Icon name="whatsapp" size={16} color="#FFFFFF" />
          </Pressable>
          <Button
            label={ctaLabel}
            size="md"
            style={styles.stickyBookBtn}
            onPress={() => {
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
              });
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    ...Shadows.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  heroBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.md,
    padding: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricSub: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  tabBtnActive: {
    backgroundColor: Colors.primaryMuted,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  tabContent: {
    gap: 12,
  },
  serviceItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Shadows.sm,
  },
  svcTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  svcTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  svcPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  svcDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  svcBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Shadows.sm,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  scheduleDay: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scheduleHours: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  verifyText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  reviewLocality: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  reviewComment: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.lg,
  },
  stickyPriceCol: {
    flex: 1,
  },
  stickyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stickyCallBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyWaBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.textTertiary,
  },
  stickyPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  stickyPricingType: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stickyBookBtn: {
    minWidth: 140,
  },
  galleryContainer: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginBottom: 16,
    ...Shadows.sm,
  },
  mainGalleryImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  galleryOverlayTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryCategoryBadge: {
    backgroundColor: 'rgba(5, 107, 66, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  galleryCategoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  galleryCountBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  galleryCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  thumbnailStrip: {
    padding: 10,
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  thumbnailBox: {
    width: 60,
    height: 45,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.7,
  },
  thumbnailBoxActive: {
    borderColor: '#056B42',
    opacity: 1,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  quickContactCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#BBF7D0',
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  quickContactInfo: {
    flex: 1,
    marginRight: 10,
  },
  quickContactTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  quickContactSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  quickContactActions: {
    flexDirection: 'row',
    gap: 6,
  },
  whatsappActionBtn: {
    backgroundColor: '#25D366',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  whatsappActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  callActionBtn: {
    backgroundColor: '#3B49DF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  callActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  amenityChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  amenityChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amenityChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  domainSpecCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    ...Shadows.sm,
  },
  domainSpecHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  domainSpecTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  domainItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  domainItemFull: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  domainLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  domainVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 16,
  },
  domainSubVal: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  domainValHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 16,
  },
  fleetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  fleetName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  fleetRate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 3,
  },
  bulletDot: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  bulletText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
});

