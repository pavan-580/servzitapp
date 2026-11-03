import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CATEGORY_VISUALS,
  CategoryVisual,
} from '../src/components/common/CategoryIllustration';
import { Icon } from '../src/components/common/Icon';
import { ProviderCard } from '../src/components/home/ProviderCard';
import { useLanguage } from '../src/context/LanguageContext';
import { MOCK_PROVIDERS } from '../src/data/mockMarketplace';
import { Colors, Radius, Shadows, Typography } from '../src/theme/tokens';

export default function CategoryDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const params = useLocalSearchParams<{
    slug?: string;
    nameEn?: string;
    nameTe?: string;
    nameHi?: string;
    title?: string;
  }>();

  const slug = params.slug || 'electrical';
  const visual: CategoryVisual = CATEGORY_VISUALS[slug] || {
    slug,
    nameEn: params.nameEn || params.title || 'Services',
    nameTe: params.nameTe || 'సేవలు',
    nameHi: params.nameHi || 'सेवाएं',
    icon: 'store',
    bg: '#EFF6FF',
    accent: '#2563EB',
  };

  // Strictly single language label
  const categoryTitle =
    language === 'te'
      ? visual.nameTe
      : language === 'hi'
      ? visual.nameHi
      : visual.nameEn;

  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  // Form states for dynamic listing questions
  const [plotArea, setPlotArea] = useState('200 Sq. Yards');
  const [plotFacing, setPlotFacing] = useState('East Facing');
  const [plotApproval, setPlotApproval] = useState('HMDA Approved');
  const [plotPrice, setPlotPrice] = useState('₹28,000 / Sq. Yd');
  const [plotLocation, setPlotLocation] = useState('Shankarpally Highway, Hyderabad');

  const [poojaType, setPoojaType] = useState('Satyanarayana Swamy Vratham');
  const [poojaSamagri, setPoojaSamagri] = useState('Purohit will bring all Samagri');
  const [poojaMuhurtham, setPoojaMuhurtham] = useState('Tomorrow, 08:30 AM');

  const [carType, setCarType] = useState('Innova Crysta 7-Seater');
  const [carMode, setCarMode] = useState('With Chauffeur / Driver');

  const [photoType, setPhotoType] = useState('Candid Wedding & Drone Video');

  const categoryProviders = MOCK_PROVIDERS.filter((p) => p.categorySlug === slug);

  const handlePostListing = () => {
    Alert.alert(
      'Listing Submitted Successfully! ✓',
      'Your verified listing has been published to the SERVZ\'IT marketplace catalogue for public viewing.'
    );
    setIsListingModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar with Dynamic Safe Area padding */}
      <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text numberOfLines={1} style={styles.navTitle}>
          {categoryTitle}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsListingModalOpen(true)}
          style={styles.postListingBtn}
        >
          <Text style={styles.postListingBtnText}>+ List Here</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 },
        ]}
      >
        {/* Category Hero Banner */}
        <View style={[styles.heroCard, { backgroundColor: visual.bg }]}>
          <View style={styles.heroTextCol}>
            <View style={styles.verifiedRow}>
              <Icon name="shield-check" size={14} color={visual.accent} />
              <Text style={[styles.verifiedText, { color: visual.accent }]}>
                SERVZ'IT VERIFIED MARKETPLACE
              </Text>
            </View>
            <Text style={styles.heroTitle}>{categoryTitle}</Text>
            {visual.descriptionEn ? (
              <Text style={styles.heroDescription}>{visual.descriptionEn}</Text>
            ) : null}
          </View>
          <View
            style={[
              styles.heroIconBox,
              { backgroundColor: '#FFFFFF', borderColor: visual.accent + '40' },
            ]}
          >
            <Icon name={visual.icon} size={32} color={visual.accent} />
          </View>
        </View>

        {/* Dynamic Category Attributes / Questions Section */}
        {slug === 'land-sale' ? (
          <View style={styles.attributeCard}>
            <View style={styles.attributeHeader}>
              <Text style={styles.attributeKicker}>PLOT SPECIFICATIONS & DETAILS</Text>
              <Pressable onPress={() => setIsListingModalOpen(true)}>
                <Text style={styles.attributeActionText}>+ Post a Plot</Text>
              </Pressable>
            </View>

            <View style={styles.attributeGrid}>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>STANDARD SIZES</Text>
                <Text style={styles.attrValue}>150 - 500 Sq. Yds</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>APPROVAL TYPES</Text>
                <Text style={styles.attrValue}>HMDA / DTCP / RERA</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>PREFERRED FACING</Text>
                <Text style={styles.attrValue}>East & North Facing</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>PRICE RANGE</Text>
                <Text style={styles.attrValue}>₹18,000 - ₹35,000/Yd</Text>
              </View>
            </View>
          </View>
        ) : slug === 'priest' ? (
          <View style={styles.attributeCard}>
            <View style={styles.attributeHeader}>
              <Text style={styles.attributeKicker}>POOJA & RITUAL OFFERINGS</Text>
              <Pressable onPress={() => setIsListingModalOpen(true)}>
                <Text style={styles.attributeActionText}>+ List as Purohit</Text>
              </Pressable>
            </View>

            <View style={styles.attributeGrid}>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>POPULAR VRATHAMS</Text>
                <Text style={styles.attrValue}>Satyanarayana / Ganapathi</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>VEDIC TRADITION</Text>
                <Text style={styles.attrValue}>Telugu Smartha / Vaidika</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>SAMAGRI SUPPORT</Text>
                <Text style={styles.attrValue}>Complete Kit Provided</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>DAKSHINA ESTIMATE</Text>
                <Text style={styles.attrValue}>₹2,500 - ₹5,000</Text>
              </View>
            </View>
          </View>
        ) : slug === 'car-rentals' ? (
          <View style={styles.attributeCard}>
            <View style={styles.attributeHeader}>
              <Text style={styles.attributeKicker}>FLEET & RENTAL OPTIONS</Text>
              <Pressable onPress={() => setIsListingModalOpen(true)}>
                <Text style={styles.attributeActionText}>+ List Vehicle</Text>
              </Pressable>
            </View>

            <View style={styles.attributeGrid}>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>SEDAN / HATCH</Text>
                <Text style={styles.attrValue}>Dzire / Swift (₹12/km)</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>7-SEATER SUV</Text>
                <Text style={styles.attrValue}>Innova Crysta (₹18/km)</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>TRIP MODES</Text>
                <Text style={styles.attrValue}>Local / Outstation / Airport</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>CHAUFFEUR</Text>
                <Text style={styles.attrValue}>Verified & Uniformed</Text>
              </View>
            </View>
          </View>
        ) : slug === 'photography' ? (
          <View style={styles.attributeCard}>
            <View style={styles.attributeHeader}>
              <Text style={styles.attributeKicker}>STUDIO & MEDIA COVERAGE</Text>
              <Pressable onPress={() => setIsListingModalOpen(true)}>
                <Text style={styles.attributeActionText}>+ List Studio</Text>
              </Pressable>
            </View>

            <View style={styles.attributeGrid}>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>SERVICES</Text>
                <Text style={styles.attrValue}>Candid, Drone & 4K Video</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>DELIVERABLES</Text>
                <Text style={styles.attrValue}>Raw Photos + Album Book</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>EVENTS</Text>
                <Text style={styles.attrValue}>Weddings & Pre-shoots</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>DAILY PACKAGES</Text>
                <Text style={styles.attrValue}>From ₹12,000 / Day</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.attributeCard}>
            <Text style={styles.attributeKicker}>STANDARD ESTIMATES & VISITS</Text>
            <View style={styles.attributeGrid}>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>INSPECTION FEE</Text>
                <Text style={styles.attrValue}>₹199 Upfront</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>VISITING CHARGE</Text>
                <Text style={styles.attrValue}>FREE on Premises</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>WARRANTY</Text>
                <Text style={styles.attrValue}>30 Days Guaranteed</Text>
              </View>
              <View style={styles.attrBox}>
                <Text style={styles.attrLabel}>PAYMENT</Text>
                <Text style={styles.attrValue}>Pay After Service</Text>
              </View>
            </View>
          </View>
        )}

        {/* Verified Professionals & Active Listings in this Category */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Verified Listings on Your Premises ({categoryProviders.length || 1})
          </Text>
        </View>

        {categoryProviders.length > 0 ? (
          categoryProviders.map((provider) => (
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
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Open Marketplace Slot</Text>
            <Text style={styles.emptySub}>
              Be the first verified provider or property owner to list in{' '}
              {categoryTitle}.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsListingModalOpen(true)}
              style={styles.emptyBtn}
            >
              <Text style={styles.emptyBtnText}>+ Create Listing Now</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Dynamic Listing Creation Modal (Questions change based on category!) */}
      <Modal
        visible={isListingModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsListingModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>List in {categoryTitle}</Text>
                <Text style={styles.modalSub}>
                  Publish to verified local public in Andhra Pradesh & Telangana
                </Text>
              </View>
              <Pressable
                onPress={() => setIsListingModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Icon name="close" size={16} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {slug === 'land-sale' ? (
                <>
                  <Text style={styles.inputLabel}>Plot Area (Sq. Yards / Acres)</Text>
                  <TextInput
                    value={plotArea}
                    onChangeText={setPlotArea}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Facing</Text>
                  <TextInput
                    value={plotFacing}
                    onChangeText={setPlotFacing}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Authority Approval</Text>
                  <TextInput
                    value={plotApproval}
                    onChangeText={setPlotApproval}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Asking Price per Sq. Yard (₹)</Text>
                  <TextInput
                    value={plotPrice}
                    onChangeText={setPlotPrice}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Exact Locality / Landmark</Text>
                  <TextInput
                    value={plotLocation}
                    onChangeText={setPlotLocation}
                    style={styles.modalInput}
                  />
                </>
              ) : slug === 'priest' ? (
                <>
                  <Text style={styles.inputLabel}>Pooja / Ritual Type</Text>
                  <TextInput
                    value={poojaType}
                    onChangeText={setPoojaType}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Pooja Samagri Arrangement</Text>
                  <TextInput
                    value={poojaSamagri}
                    onChangeText={setPoojaSamagri}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Muhurtham Date & Slot</Text>
                  <TextInput
                    value={poojaMuhurtham}
                    onChangeText={setPoojaMuhurtham}
                    style={styles.modalInput}
                  />
                </>
              ) : slug === 'car-rentals' ? (
                <>
                  <Text style={styles.inputLabel}>Vehicle Model & Seating</Text>
                  <TextInput
                    value={carType}
                    onChangeText={setCarType}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Driver / Self-Drive Option</Text>
                  <TextInput
                    value={carMode}
                    onChangeText={setCarMode}
                    style={styles.modalInput}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Service / Offering Name</Text>
                  <TextInput
                    defaultValue="Professional Service"
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Standard Rate / Inspection Fee (₹)</Text>
                  <TextInput
                    defaultValue="₹199"
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Your Premises / Locality</Text>
                  <TextInput
                    defaultValue="Madhapur, Hyderabad"
                    style={styles.modalInput}
                  />
                </>
              )}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={handlePostListing}
              style={styles.submitListingBtn}
            >
              <Text style={styles.submitListingBtnText}>Publish Verified Listing ›</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  postListingBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  postListingBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: Radius.xxl,
    marginBottom: 16,
  },
  heroTextCol: {
    flex: 1,
    marginRight: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  heroDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  attributeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attributeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  attributeKicker: {
    ...Typography.kicker,
    fontSize: 9,
    color: Colors.primaryDark,
  },
  attributeActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  attributeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attrBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  attrLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  attrValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Shadows.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  submitListingBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitListingBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
