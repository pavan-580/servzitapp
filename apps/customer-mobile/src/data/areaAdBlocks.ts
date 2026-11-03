/**
 * Area-Based Ad & Promotional Campaign Blocks
 * Controlled by Admin CRM Portal
 */

export interface AreaAdBlock {
  id: string;
  targetAreaId: string; // 'all' or specific area ID like 'hyd-madhapur'
  targetAreaName: string;
  title: string;
  subtitle: string;
  badge: string;
  couponCode: string;
  discountPercentage: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  isActive: boolean;
  categorySlug?: string;
}

export const INITIAL_AREA_AD_BLOCKS: AreaAdBlock[] = [
  {
    id: 'ad-madhapur-1',
    targetAreaId: 'hyd-madhapur',
    targetAreaName: 'Madhapur, Hyderabad',
    title: 'Madhapur Resident Privilege',
    subtitle: 'Flat ₹150 OFF on full electrical inspection & switchboard fix',
    badge: 'MADHAPUR EXCLUSIVE',
    couponCode: 'MADHAPUR150',
    discountPercentage: 25,
    bgColor: '#0A5C36',
    textColor: '#FFFFFF',
    accentColor: '#F59E0B',
    isActive: true,
    categorySlug: 'electrical',
  },
  {
    id: 'ad-gachibowli-1',
    targetAreaId: 'hyd-gachibowli',
    targetAreaName: 'Gachibowli, Hyderabad',
    title: 'Gachibowli AC Jet Wash Offer',
    subtitle: 'High-pressure foam coil washing at just ₹449 with 30-day cooling warranty',
    badge: 'GACHIBOWLI SPECIAL',
    couponCode: 'GACHI40',
    discountPercentage: 20,
    bgColor: '#0284C7',
    textColor: '#FFFFFF',
    accentColor: '#38BDF8',
    isActive: true,
    categorySlug: 'ac-service',
  },
  {
    id: 'ad-all-1',
    targetAreaId: 'all',
    targetAreaName: 'All AP & Telangana',
    title: 'Transparent Pricing Guarantee',
    subtitle: 'Zero hidden visiting charges. Pay via UPI or Cash only after work is done.',
    badge: 'PHONEPE TRUST',
    couponCode: 'SAFETYFREE',
    discountPercentage: 10,
    bgColor: '#1E293B',
    textColor: '#FFFFFF',
    accentColor: '#10B981',
    isActive: true,
    categorySlug: 'home-maintenance',
  },
  {
    id: 'ad-vja-1',
    targetAreaId: 'vja-benzcircle',
    targetAreaName: 'Benz Circle, Vijayawada',
    title: 'Vijayawada Express Launch',
    subtitle: '15-minute guaranteed technician arrival near Benz Circle & MG Road',
    badge: 'VIJAYAWADA EXCLUSIVE',
    couponCode: 'VJAEXPRESS',
    discountPercentage: 30,
    bgColor: '#7C3AED',
    textColor: '#FFFFFF',
    accentColor: '#FBBF24',
    isActive: true,
    categorySlug: 'plumbing',
  },
];

