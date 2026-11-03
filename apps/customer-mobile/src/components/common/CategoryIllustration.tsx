import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';
import { Icon, IconName } from './Icon';

export interface CategoryVisual {
  slug: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  icon: IconName;
  bg: string;
  accent: string;
  badge?: string;
  descriptionEn?: string;
}

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  electrical: {
    slug: 'electrical',
    nameEn: 'Electrician',
    nameTe: 'విద్యుత్ పనులు',
    nameHi: 'इलेक्ट्रीशियन',
    icon: 'bolt',
    bg: '#EFF6FF',
    accent: '#2563EB',
    badge: 'Popular',
    descriptionEn: 'Wiring, MCB switches & fan repair',
  },
  plumbing: {
    slug: 'plumbing',
    nameEn: 'Plumber',
    nameTe: 'ప్లంబర్',
    nameHi: 'प्लंबर',
    icon: 'wrench',
    bg: '#F0FDF4',
    accent: '#16A34A',
    descriptionEn: 'Taps, leaks, motor & pipeline works',
  },
  'ac-service': {
    slug: 'ac-service',
    nameEn: 'AC Service',
    nameTe: 'ఏసీ సర్వీస్',
    nameHi: 'एसी सर्विस',
    icon: 'snowflake',
    bg: '#ECFEFF',
    accent: '#0891B2',
    badge: 'Trending',
    descriptionEn: 'Jet foam wash, gas charging & PCB repair',
  },
  cleaning: {
    slug: 'cleaning',
    nameEn: 'Cleaning',
    nameTe: 'క్లీనింగ్',
    nameHi: 'सफाई',
    icon: 'sparkles',
    bg: '#FAF5FF',
    accent: '#9333EA',
    descriptionEn: 'Deep cleaning, kitchen & bathroom sanitization',
  },
  carpentry: {
    slug: 'carpentry',
    nameEn: 'Carpenter',
    nameTe: 'వడ్రంగి',
    nameHi: 'बढ़ई',
    icon: 'hammer',
    bg: '#FFFBEB',
    accent: '#D97706',
    descriptionEn: 'Furniture repair, locks, doors & woodcraft',
  },
  painting: {
    slug: 'painting',
    nameEn: 'Painting',
    nameTe: 'పెయింటింగ్',
    nameHi: 'पेंटिंग',
    icon: 'brush',
    bg: '#FFF1F2',
    accent: '#E11D48',
    descriptionEn: 'Interior, exterior, waterproofing & distemper',
  },
  'pest-control': {
    slug: 'pest-control',
    nameEn: 'Pest Control',
    nameTe: 'క్రిమి నియంత్రణ',
    nameHi: 'कीट नियंत्रण',
    icon: 'bug',
    bg: '#FEF3C7',
    accent: '#B45309',
    descriptionEn: 'Termite, cockroach & bed bug elimination',
  },
  moving: {
    slug: 'moving',
    nameEn: 'Packers & Movers',
    nameTe: 'ప్యాకర్స్ & మూవర్స్',
    nameHi: 'पैकर्स और मूवर्स',
    icon: 'truck',
    bg: '#F0F9FF',
    accent: '#0284C7',
    descriptionEn: 'Safe home shifting & transport within AP/TS',
  },
  'appliance-repair': {
    slug: 'appliance-repair',
    nameEn: 'Appliance Repair',
    nameTe: 'రిపేర్ సర్వీసులు',
    nameHi: 'उपकरण मरम्मत',
    icon: 'tv',
    bg: '#F5F3FF',
    accent: '#7C3AED',
    descriptionEn: 'Washing machine, fridge, microwave & TV repair',
  },
  solar: {
    slug: 'solar',
    nameEn: 'Solar & Inverter',
    nameTe: 'సోలార్ & ఇన్వర్టర్',
    nameHi: 'सोलर और इन्वर्टर',
    icon: 'sun',
    bg: '#FFF7ED',
    accent: '#EA580C',
    descriptionEn: 'Rooftop solar, net metering & inverter setup',
  },
  photography: {
    slug: 'photography',
    nameEn: 'Photography',
    nameTe: 'ఫోటోగ్రఫీ',
    nameHi: 'फोटोग्राफी',
    icon: 'camera',
    bg: '#FDF2F8',
    accent: '#DB2777',
    badge: 'Events',
    descriptionEn: 'Weddings, candid shoots, drone video & albums',
  },
  priest: {
    slug: 'priest',
    nameEn: 'Purohit & Pandit',
    nameTe: 'పురోహితులు',
    nameHi: 'पंडित - पुजारी',
    icon: 'om',
    bg: '#FEFCE8',
    accent: '#CA8A04',
    badge: 'Spiritual',
    descriptionEn: 'Satyanarayana Vratham, Grihapravesham & Poojas',
  },
  'car-rentals': {
    slug: 'car-rentals',
    nameEn: 'Car Rentals',
    nameTe: 'కార్ల అద్దె',
    nameHi: 'कार रेंटल',
    icon: 'car',
    bg: '#EEF2FF',
    accent: '#4F46E5',
    descriptionEn: 'Self-drive & chauffeur cabs for city & outstation',
  },
  'land-sale': {
    slug: 'land-sale',
    nameEn: 'Plots & Land',
    nameTe: 'స్థలాలు - ప్లాట్లు',
    nameHi: 'प्लॉट और जमीन',
    icon: 'land',
    bg: '#ECFDF5',
    accent: '#059669',
    badge: 'Invest',
    descriptionEn: 'HMDA & DTCP open plots, farm land for sale',
  },
  'property-rent': {
    slug: 'property-rent',
    nameEn: 'House Rentals',
    nameTe: 'ఇళ్ల అద్దెలు',
    nameHi: 'मकान किराया',
    icon: 'building',
    bg: '#F1F5F9',
    accent: '#334155',
    descriptionEn: '1BHK, 2BHK, 3BHK flats, villas & commercial space',
  },
  'vehicle-mechanic': {
    slug: 'vehicle-mechanic',
    nameEn: 'Vehicle Mechanic',
    nameTe: 'వెహికల్ మెకానిక్',
    nameHi: 'वाहन मैकेनिक',
    icon: 'wrench',
    bg: '#F8FAFC',
    accent: '#475569',
    descriptionEn: 'Doorstep bike & car servicing, breakdown help',
  },
  'salon-grooming': {
    slug: 'salon-grooming',
    nameEn: 'Salon at Home',
    nameTe: 'బ్యూటీ & సెలూన్',
    nameHi: 'सैलून एट होम',
    icon: 'scissors',
    bg: '#FDF4FF',
    accent: '#C026D3',
    descriptionEn: 'Haircuts, facials, waxing & grooming at home',
  },
  'cctv-security': {
    slug: 'cctv-security',
    nameEn: 'CCTV Security',
    nameTe: 'సీసీటీవీ సెక్యూరిటీ',
    nameHi: 'सीसीटीवी सुरक्षा',
    icon: 'cctv',
    bg: '#F0FDFA',
    accent: '#0D9488',
    descriptionEn: 'Camera installation, WiFi NVR setup & home safety',
  },
  'hostel-pg': {
    slug: 'hostel-pg',
    nameEn: 'Hostel & PG',
    nameTe: 'హాస్టల్స్ & పీజీ',
    nameHi: 'हॉस्टल और पीजी',
    icon: 'bed',
    bg: '#FFF7ED',
    accent: '#EA580C',
    badge: 'Trending',
    descriptionEn: "Men's, Women's PG & Co-living with food and Wi-Fi",
  },
  'shamiyana-events': {
    slug: 'shamiyana-events',
    nameEn: 'Shamiyana & Sounds',
    nameTe: 'షామియానా & సౌండ్స్',
    nameHi: 'शामियाना और साउंड',
    icon: 'tent',
    bg: '#FEF2F2',
    accent: '#DC2626',
    badge: 'Events',
    descriptionEn: 'Waterproof tents, JBL sound, stage decor & lighting',
  },
};

interface CategoryTileProps {
  slug: string;
  language?: 'en' | 'te' | 'hi';
  nameEn?: string;
  nameTe?: string;
  nameHi?: string;
  selected?: boolean;
  size?: 'normal' | 'compact';
  style?: ViewStyle;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({
  slug,
  language = 'en',
  nameEn,
  nameTe,
  nameHi,
  selected = false,
  size = 'normal',
  style,
}) => {
  const visual = CATEGORY_VISUALS[slug] || {
    slug,
    nameEn: nameEn || slug,
    nameTe: nameTe || nameEn || slug,
    nameHi: nameHi || nameEn || slug,
    icon: 'store',
    bg: '#F8FAFC',
    accent: Colors.primary,
  };

  const isCompact = size === 'compact';
  const boxDimension = isCompact ? 52 : 62;
  const iconSize = isCompact ? 22 : 28;

  // STRICT SINGLE LANGUAGE: Never show two languages at once
  const label =
    language === 'te'
      ? visual.nameTe
      : language === 'hi'
      ? visual.nameHi
      : visual.nameEn;

  return (
    <View style={[styles.container, selected && styles.containerSelected, style]}>
      <View
        style={[
          styles.iconBox,
          {
            width: boxDimension,
            height: boxDimension,
            borderRadius: isCompact ? Radius.lg : Radius.xl,
            backgroundColor: visual.bg,
            borderColor: selected ? visual.accent : visual.accent + '30',
          },
          selected && styles.iconBoxSelected,
        ]}
      >
        <Icon name={visual.icon} size={iconSize} color={visual.accent} />
        {visual.badge ? (
          <View style={[styles.badge, { backgroundColor: visual.accent }]}>
            <Text style={styles.badgeText}>{visual.badge}</Text>
          </View>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.name,
          isCompact && styles.nameCompact,
          selected && { color: visual.accent, fontWeight: '800' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 78,
  },
  containerSelected: {
    transform: [{ scale: 1.03 }],
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBoxSelected: {
    borderWidth: 2.5,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  nameCompact: {
    fontSize: 10,
    marginTop: 4,
  },
});
