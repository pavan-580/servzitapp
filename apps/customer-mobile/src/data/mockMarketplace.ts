/**
 * Production-Grade Seed & Demo Data for SERVZ'IT
 * Region: Andhra Pradesh & Telangana (Hyderabad, Vijayawada, Visakhapatnam)
 * Real Coordinates, Authentic Local Services, Verified Professionals
 */

export interface CategoryAttributes {
  // Common highlights
  highlightPills?: string[];
  
  // Real Estate / Land Sale (land-sale)
  surveyNo?: string;
  approvalAuthority?: 'HMDA' | 'DTCP' | 'RERA' | 'Panchayat';
  approvalNumber?: string;
  plotSizesSqYd?: string[];
  facingOptions?: string[];
  pricePerSqYd?: number;
  roadWidthFt?: number;
  gatedAmenities?: string[];
  titleClearStatus?: string;
  siteVisitTransport?: string;
  bankLoanAvailable?: boolean;

  // Vedic Purohit / Priest (priest)
  vedicTradition?: 'Telugu Smartha' | 'Vaidika' | 'Vaishnava' | 'Madhwa';
  patashalaEducation?: string;
  ritualsSpecialization?: string[];
  samagriKitProvided?: boolean;
  samagriKitPrice?: number;
  languagesFluent?: string[];
  muhurthamConsultation?: boolean;
  dakshinaPolicy?: string;

  // Car Rentals & Fleets (car-rentals)
  fleetModels?: Array<{ name: string; seats: number; ac: boolean; perKm: number }>;
  tripTypesAvailable?: string[];
  chauffeurIncluded?: boolean;
  permitCoverage?: string;
  minimumRentalHours?: number;
  tollParkingPolicy?: string;

  // Wedding & Event Photography (photography)
  cameraBodies?: string[];
  lensesAndDrones?: string[];
  deliverables?: string[];
  albumType?: string;
  turnaroundDays?: number;
  cinematicVideo?: boolean;

  // Property Rentals (property-rent)
  availableConfigs?: string[];
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  securityDepositMonths?: number;
  waterSupply?: string;
  powerBackup?: string;
  gatedSociety?: boolean;
  preferredTenants?: string;

  // Hostel & PG Accommodations (hostel-pg)
  hostelType?: "Men's PG" | "Women's PG" | 'Co-Living' | 'Student Hostel';
  sharingTypes?: string[];
  foodFacility?: string;
  amenitiesIncluded?: string[];
  rulesPolicy?: string;

  // Shamiyana, Sound & Events (shamiyana-events)
  tentTypes?: string[];
  soundSystemSpecs?: string;
  eventServices?: string[];
  generatorCapacityKva?: number;
  packageTiers?: Array<{ name: string; pax: number; price: number; inclusions: string }>;

  // Repair & Technical Services (electrical, plumbing, ac-service, cleaning, etc.)
  tradeLicenseNumber?: string;
  visitingInspectionFee?: number;
  reworkWarrantyDays?: number;
  emergencyAvailable?: boolean;
  toolsEquipped?: string[];
  sparePartsPolicy?: string;
}

export interface MockProvider {
  id: string;
  businessName: string;
  tagline: string;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameTe: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  locality: string;
  city: string;
  pricingModel: 'fixed' | 'inspection' | 'quote';
  startingPrice: number;
  currency: string;
  isVerified: boolean;
  isAvailableNow: boolean;
  avatarLetter: string;
  avatarBg: string;
  experienceYears: number;
  completedJobs: number;
  phone?: string;
  photos?: string[];
  attributes?: CategoryAttributes;
  services: Array<{
    id: string;
    name: string;
    nameTe?: string;
    description: string;
    price: number;
    pricingModel: 'fixed' | 'inspection' | 'quote';
    durationMin: number;
  }>;
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    locality: string;
  }>;
}

export interface PromoBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  categorySlug: string;
}

export interface LocalBusiness {
  id: string;
  name: string;
  category: string;
  locality: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  offerText: string;
}

export interface PropertyListing {
  id: string;
  title: string;
  type: 'buy' | 'rent' | 'commercial';
  propertyType: 'apartment' | 'villa' | 'commercial' | 'plot';
  locality: string;
  city: string;
  priceFormatted: string;
  bhk?: string;
  sqft?: number;
  isVerified: boolean;
  features: string[];
}

export const MOCK_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'b1',
    badge: 'LIMITED OFFER',
    title: 'Monsoon Home Safety',
    subtitle: 'Full electrical & circuit checkup by certified engineers at ₹199',
    ctaText: 'Book Now',
    bgColor: '#0A5C36',
    textColor: '#FFFFFF',
    accentColor: '#F59E0B',
    categorySlug: 'electrical',
  },
  {
    id: 'b2',
    badge: 'SUMMER CARE',
    title: 'AC Deep Foam Cleaning',
    subtitle: 'Jet-pump cleaning + gas pressure test with 30-day guarantee',
    ctaText: 'Explore',
    bgColor: '#0284C7',
    textColor: '#FFFFFF',
    accentColor: '#38BDF8',
    categorySlug: 'ac-service',
  },
  {
    id: 'b3',
    badge: 'PHONEPE TRUST',
    title: 'Transparent Pricing Guarantee',
    subtitle: 'No hidden visit charges. Pay only after work completion.',
    ctaText: 'Learn More',
    bgColor: '#1E293B',
    textColor: '#FFFFFF',
    accentColor: '#10B981',
    categorySlug: 'home-maintenance',
  },
];

export const MOCK_PROVIDERS: MockProvider[] = [
  {
    id: 'p1',
    businessName: 'Sri Sai Electrical & Power Solutions',
    tagline: 'Govt Licensed Wireman • Switchboard, MCB & Inverter Specialist',
    categorySlug: 'electrical',
    categoryNameEn: 'Electrician',
    categoryNameTe: 'విద్యుత్ పనులు',
    rating: 4.9,
    reviewCount: 342,
    distanceKm: 1.4,
    locality: 'Madhapur',
    city: 'Hyderabad',
    pricingModel: 'inspection',
    startingPrice: 199,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'S',
    avatarBg: '#EFF6FF',
    experienceYears: 8,
    completedJobs: 1420,
    photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['Govt Licensed Wireman', '30-Day Guarantee', 'No Hidden Charges'],
      tradeLicenseNumber: 'TS-TEL-LIC-48192',
      visitingInspectionFee: 199,
      reworkWarrantyDays: 30,
      emergencyAvailable: true,
      toolsEquipped: ['Digital Multimeter', 'Fluke Insulation Tester', 'Heavy Impact Drill', 'Concealed Wire Detector'],
      sparePartsPolicy: 'Anchor / Havells genuine spares with GST invoice and manufacturer warranty',
    },
    services: [
      {
        id: 's101',
        name: 'General Electrical Inspection & Troubleshooting',
        nameTe: 'విద్యుత్ తనిఖీ మరియు లోప నివారణ',
        description: 'Comprehensive checkup of MCB trips, wiring leaks, voltage fluctuations',
        price: 199,
        pricingModel: 'inspection',
        durationMin: 45,
      },
      {
        id: 's102',
        name: 'Ceiling Fan & Light Fixture Installation',
        nameTe: 'ఫ్యాన్ మరియు లైట్ అమరిక',
        description: 'Professional mounting and wire connection with safety checks',
        price: 249,
        pricingModel: 'fixed',
        durationMin: 30,
      },
      {
        id: 's103',
        name: 'Inverter & Battery Wiring Setup',
        nameTe: 'ఇన్వర్టర్ వైరింగ్ సెటప్',
        description: 'Dual battery and inverter installation with backup load testing',
        price: 899,
        pricingModel: 'fixed',
        durationMin: 90,
      },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Kalyan Rao',
        rating: 5,
        date: 'Yesterday',
        comment: 'Came within 25 minutes to Madhapur. Fixed tripping MCB quickly without extra drama. Very professional!',
        locality: 'Madhapur',
      },
      {
        id: 'r2',
        author: 'Deepa Varma',
        rating: 5,
        date: '3 days ago',
        comment: 'Clear explanation of the problem, reasonable price and polite behaviour.',
        locality: 'Jubilee Hills',
      },
    ],
  },
  {
    id: 'p2',
    businessName: 'Hyderabad Cool Tech AC Services',
    tagline: 'Split & Window AC Jet Pump Servicing • Gas Top-up Specialist',
    categorySlug: 'ac-service',
    categoryNameEn: 'AC Service',
    categoryNameTe: 'ఏసీ సర్వీస్',
    rating: 4.8,
    reviewCount: 285,
    distanceKm: 2.1,
    locality: 'Gachibowli',
    city: 'Hyderabad',
    pricingModel: 'fixed',
    startingPrice: 499,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'H',
    avatarBg: '#ECFEFF',
    experienceYears: 11,
    completedJobs: 2190,
    attributes: {
      highlightPills: ['Jet Pump Deep Wash', 'R32/R410A Genuine Gas', '60-Day Leak Warranty'],
      tradeLicenseNumber: 'AC-HVAC-9281',
      visitingInspectionFee: 299,
      reworkWarrantyDays: 60,
      emergencyAvailable: true,
      toolsEquipped: ['120-Bar High Pressure Jet Pump', 'Nitrogen Leak Detection Kit', 'Digital Manifold Gauge'],
      sparePartsPolicy: '100% pure copper condenser coils and OEM capacitors',
    },
    services: [
      {
        id: 's201',
        name: 'Deep Jet Pump Foam Service (Split AC)',
        description: 'High-pressure water washing of outdoor/indoor coils with antibacterial foam',
        price: 499,
        pricingModel: 'fixed',
        durationMin: 60,
      },
      {
        id: 's202',
        name: 'AC Gas Leak Diagnosis & R32/R410A Refill',
        description: 'Nitrogen pressure leak test, brazing repairs, and full refrigerant recharge',
        price: 1899,
        pricingModel: 'fixed',
        durationMin: 90,
      },
    ],
    reviews: [
      {
        id: 'r3',
        author: 'Venkat Narayana',
        rating: 5,
        date: '5 days ago',
        comment: 'AC cooling improved dramatically after jet wash. Provided invoice and guarantee card.',
        locality: 'Gachibowli',
      },
    ],
  },
  {
    id: 'p3',
    businessName: 'Krishna River Plumbing & Sanitary Care',
    tagline: 'Leak Detection • Pipe Repairs • Bathroom Fitting Installations',
    categorySlug: 'plumbing',
    categoryNameEn: 'Plumber',
    categoryNameTe: 'ప్లంబర్',
    rating: 4.7,
    reviewCount: 198,
    distanceKm: 2.8,
    locality: 'Kondapur',
    city: 'Hyderabad',
    pricingModel: 'inspection',
    startingPrice: 199,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: false,
    avatarLetter: 'K',
    avatarBg: '#F0FDF4',
    experienceYears: 6,
    completedJobs: 890,
    attributes: {
      highlightPills: ['Acoustic Leak Locator', 'No-Breakage Repair', '30-Day Guarantee'],
      tradeLicenseNumber: 'PLUMB-AP-1049',
      visitingInspectionFee: 199,
      reworkWarrantyDays: 30,
      emergencyAvailable: true,
      toolsEquipped: ['Electric Drain Snake Auger (30ft)', 'Acoustic Pipe Leak Detector', 'Teflon Sealing Gear'],
      sparePartsPolicy: 'Jaquar / Astral / Ashirvad genuine CPVC & brass fittings',
    },
    services: [
      {
        id: 's301',
        name: 'Water Leakage & Pipe Blockage Inspection',
        description: 'Drain snake cleaning, concealed pipe acoustic leak check',
        price: 199,
        pricingModel: 'inspection',
        durationMin: 40,
      },
      {
        id: 's302',
        name: 'Tap / Shower Diverter & Mixer Replacement',
        description: 'Wall diverter replacement with Teflon sealing',
        price: 349,
        pricingModel: 'fixed',
        durationMin: 45,
      },
    ],
    reviews: [
      {
        id: 'r4',
        author: 'Suresh Reddy',
        rating: 4.8,
        date: '1 week ago',
        comment: 'Prompt service and genuine spare parts used for kitchen sink leak.',
        locality: 'Kondapur',
      },
    ],
  },
  {
    id: 'p4',
    businessName: 'Deccan Royal Deep Cleaning & Sanitization',
    tagline: 'Full Villa & Apartment Deep Cleaning • Sofa & Carpet Shampooing',
    categorySlug: 'cleaning',
    categoryNameEn: 'Cleaning',
    categoryNameTe: 'క్లీనింగ్',
    rating: 4.9,
    reviewCount: 412,
    distanceKm: 3.5,
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    pricingModel: 'fixed',
    startingPrice: 1299,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'D',
    avatarBg: '#FAF5FF',
    experienceYears: 9,
    completedJobs: 1750,
    attributes: {
      highlightPills: ['Single-Disc Machine Buffing', 'Hospital-Grade Sanitizers', 'Infant-Safe Chemicals'],
      visitingInspectionFee: 0,
      reworkWarrantyDays: 7,
      emergencyAvailable: false,
      toolsEquipped: ['Kärcher Industrial Wet/Dry Vacuum', 'Taski Single Disc Buffing Machine', 'Steam Extraction Upholstery Unit'],
      sparePartsPolicy: '100% Diversey chemicals safe for infants and indoor pets',
    },
    services: [
      {
        id: 's401',
        name: 'Bathroom Deep Chemical Scrub & Scale Removal',
        description: 'Hard water tile descaling, toilet bowl sanitization, fixture shine',
        price: 499,
        pricingModel: 'fixed',
        durationMin: 60,
      },
      {
        id: 's402',
        name: '2 BHK Complete Home Deep Cleaning',
        description: 'Balcony, kitchen degreasing, bathroom scrubbing, floor buffing',
        price: 2499,
        pricingModel: 'fixed',
        durationMin: 240,
      },
    ],
    reviews: [
      {
        id: 'r5',
        author: 'Padmaja K.',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Team arrived on time with industrial vacuum and machinery. Spotless clean!',
        locality: 'Banjara Hills',
      },
    ],
  },
  {
    id: 'p5',
    businessName: 'Brahmasri Venkata Sharma (Purohit)',
    tagline: 'Vaidika Smartha Purohit • 15+ Years Experience • All Vedic Poojas & Homams',
    categorySlug: 'priest',
    categoryNameEn: 'Purohit & Pandit',
    categoryNameTe: 'పురోహితులు',
    rating: 4.98,
    reviewCount: 210,
    distanceKm: 1.1,
    locality: 'Madhapur',
    city: 'Hyderabad',
    pricingModel: 'fixed',
    startingPrice: 3500,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'V',
    avatarBg: '#FEFCE8',
    experienceYears: 15,
    completedJobs: 980,
    photos: [
      'https://images.unsplash.com/photo-1609358905581-e5382c448f7d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['Vaidika Smartha Sampradayam', 'Complete Samagri Kit Included', 'Muhurtham Guidance'],
      vedicTradition: 'Telugu Smartha',
      patashalaEducation: 'Sri Venkateswara Veda Patashala, Tirumala (Rigveda Smartha Adhyayanam)',
      ritualsSpecialization: [
        'Sri Satyanarayana Swamy Vratham',
        'Grihapravesham & Vastu Homam',
        'Ganapathi & Navagraha Homam',
        'Vivaham (Vedic Wedding Rituals)',
        'Namakaranam & Ayushya Homam',
        'Shop / Office Inauguration Pooja',
      ],
      samagriKitProvided: true,
      samagriKitPrice: 1500,
      languagesFluent: ['Telugu (మాతృభాష)', 'Sanskrit (సంస్కృతం)', 'Hindi'],
      muhurthamConsultation: true,
      dakshinaPolicy: 'Transparent dakshina inclusive of ritual guidance. Pay after pooja blessings.',
    },
    services: [
      {
        id: 's501',
        name: 'Sri Satyanarayana Swamy Vratham (With Samagri Kit)',
        description: 'Complete Vratha Katha, Kalasa Sthapana, Prasadam guidance & Archana. Pure cow ghee & homa dravyam included.',
        price: 3500,
        pricingModel: 'fixed',
        durationMin: 150,
      },
      {
        id: 's502',
        name: 'Grihapravesham & Vastu Shanti Homam',
        description: 'Auspicious new home entry, Navagraha & Ganapathi Homam, Punyahavachanam & blessings',
        price: 5500,
        pricingModel: 'fixed',
        durationMin: 210,
      },
      {
        id: 's503',
        name: 'Ganapathi & Lakshmi Kubera Homam',
        description: 'Financial prosperity & obstacle removal ritual for homes, business shops & offices',
        price: 4000,
        pricingModel: 'fixed',
        durationMin: 120,
      },
    ],
    reviews: [
      {
        id: 'r51',
        author: 'Raghava Raju',
        rating: 5,
        date: '3 days ago',
        comment: 'Purohit garu performed our Satyanarayana Vratham with complete devotion and clear explanation in Telugu.',
        locality: 'Kondapur',
      },
      {
        id: 'r52',
        author: 'Subramanyam K.',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Arrived right on time for our early morning 06:15 AM Grihapravesham muhurtham. Brought pure samagri.',
        locality: 'Madhapur',
      },
    ],
  },
  {
    id: 'p6',
    businessName: 'PixelKraft Wedding & Aerial Studios',
    tagline: 'Candid Photography, 4K Cinematic Films & Drone Shoots in Hyderabad',
    categorySlug: 'photography',
    categoryNameEn: 'Photography',
    categoryNameTe: 'ఫోటోగ్రఫీ',
    rating: 4.92,
    reviewCount: 145,
    distanceKm: 1.8,
    locality: 'Madhapur',
    city: 'Hyderabad',
    pricingModel: 'quote',
    startingPrice: 15000,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'P',
    avatarBg: '#FDF2F8',
    experienceYears: 7,
    completedJobs: 420,
    photos: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['Sony Alpha A7 IV', 'DJI Mavic 3 Cine Drone', '40-Sheet Karizma Photobook'],
      cameraBodies: ['Sony Alpha A7 IV (Dual Slot)', 'Sony FX3 Cinema Line', 'Sony A7R V High-Res'],
      lensesAndDrones: ['Sony 24-70mm f/2.8 GM II', 'Sony 70-200mm f/2.8 GM OSS II', 'DJI Mavic 3 Cine 4K Drone', 'DJI RS3 Pro Gimbal'],
      deliverables: [
        '40-Sheet High-Gloss Karizma Hardbound Photobook',
        '3-5 Min 4K Cinematic Instagram Teaser (within 7 days)',
        'Full Traditional HD Video on 128GB Wooden Pen Drive',
        'All RAW and Edited High-Res Photos via Google Drive Cloud',
      ],
      albumType: 'Non-tearable waterproof Italian Leatherette Cover (12x36 spread)',
      turnaroundDays: 14,
      cinematicVideo: true,
    },
    services: [
      {
        id: 's601',
        name: 'Grand Wedding & Reception Candid Package',
        description: '2 Senior Photographers, 1 Traditional Video, Drone Aerial Coverage & 40-page Album',
        price: 35000,
        pricingModel: 'quote',
        durationMin: 480,
      },
      {
        id: 's602',
        name: 'Birthday, Cradle & Half Saree Event Coverage',
        description: '4-hour event shoot with instant digital photo edits within 48 hours',
        price: 12000,
        pricingModel: 'fixed',
        durationMin: 240,
      },
      {
        id: 's603',
        name: 'Cinematic Pre-Wedding / Couple Outdoor Shoot',
        description: 'Full day scenic location shoot with 4K drone cinematography & 50 retouched photos',
        price: 18000,
        pricingModel: 'quote',
        durationMin: 360,
      },
    ],
    reviews: [
      {
        id: 'r61',
        author: 'Sindhuja M.',
        rating: 5,
        date: '1 week ago',
        comment: 'Amazing candid shots and cinematic video. Delivered the teaser within 5 days! Highly recommended.',
        locality: 'Gachibowli',
      },
    ],
  },
  {
    id: 'p7',
    businessName: 'Telangana Travels & Cab Rentals',
    tagline: 'Innova Crysta, Ertiga & Sedans • Verified Chauffeurs • 24/7 Outstation & City',
    categorySlug: 'car-rentals',
    categoryNameEn: 'Car Rentals',
    categoryNameTe: 'కార్ల అద్దె',
    rating: 4.88,
    reviewCount: 310,
    distanceKm: 0.9,
    locality: 'Madhapur',
    city: 'Hyderabad',
    pricingModel: 'fixed',
    startingPrice: 799,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'T',
    avatarBg: '#EEF2FF',
    experienceYears: 10,
    completedJobs: 2400,
    photos: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['Innova Crysta Luxury', 'Police Verified Chauffeur', 'Zero Cancellation Charge'],
      fleetModels: [
        { name: 'Toyota Innova Crysta (7-Seater Luxury)', seats: 7, ac: true, perKm: 18 },
        { name: 'Maruti Ertiga Smart Hybrid (7-Seater)', seats: 7, ac: true, perKm: 14 },
        { name: 'Maruti Suzuki Dzire AC (4-Seater Sedan)', seats: 4, ac: true, perKm: 11 },
        { name: 'Force Urbania AC Luxury (12-Seater Group)', seats: 12, ac: true, perKm: 26 },
      ],
      tripTypesAvailable: ['Outstation Round-Trip', 'One-Way Drop', 'Airport Transfer (RGIA)', 'City Package (8hr / 80km)'],
      chauffeurIncluded: true,
      permitCoverage: 'All India Tourist Permit (Telangana, Andhra Pradesh, Karnataka, Tamil Nadu)',
      minimumRentalHours: 8,
      tollParkingPolicy: 'Tolls, parking and state entry tax billed strictly at actual FASTag receipt',
    },
    services: [
      {
        id: 's701',
        name: 'Airport Pickup / Drop (AC Sedan)',
        description: 'Clean AC Dzire/Aura, toll included, no surge pricing guarantee',
        price: 799,
        pricingModel: 'fixed',
        durationMin: 60,
      },
      {
        id: 's702',
        name: 'Innova Crysta Outstation (8 Hrs / 80 Km Package)',
        description: 'Spacious 7-seater luxury with verified professional chauffeur and bottled water',
        price: 2800,
        pricingModel: 'fixed',
        durationMin: 480,
      },
      {
        id: 's703',
        name: 'Hyderabad to Vijayawada / Tirupati Round Trip',
        description: 'Interstate travel package with verified highway driver. Per-km billing beyond minimums.',
        price: 4999,
        pricingModel: 'quote',
        durationMin: 720,
      },
    ],
    reviews: [
      {
        id: 'r71',
        author: 'Vamshi Krishna',
        rating: 5,
        date: 'Yesterday',
        comment: 'Punctual arrival at 4 AM for Rajiv Gandhi Airport drop. Smooth ride and very clean car!',
        locality: 'Hitech City',
      },
    ],
  },
  {
    id: 'p8',
    businessName: 'Cyberabad Land & Plot Advisors',
    tagline: 'HMDA & DTCP Approved Gated Plots • Clear Title & Free Site Visit Transport',
    categorySlug: 'land-sale',
    categoryNameEn: 'Plots & Land',
    categoryNameTe: 'స్థలాలు - ప్లాట్లు',
    rating: 4.95,
    reviewCount: 95,
    distanceKm: 2.5,
    locality: 'Madhapur',
    city: 'Hyderabad',
    pricingModel: 'quote',
    startingPrice: 0,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'C',
    avatarBg: '#ECFDF5',
    experienceYears: 12,
    completedJobs: 340,
    photos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['HMDA & DTCP Approved', '100% Clear Title & Link Docs', 'Free AC Car Site Visit'],
      surveyNo: 'Sy No. 142/P & 143, Shankarpally Highway Corridor',
      approvalAuthority: 'HMDA',
      approvalNumber: 'HMDA LP No: 000214/LO/Plg/HMDA/2023',
      plotSizesSqYd: ['167 Sq. Yds', '200 Sq. Yds', '267 Sq. Yds', '350 Sq. Yds', '500 Sq. Yds Corner'],
      facingOptions: ['East Facing (100% Vastu)', 'North Facing', 'West Facing', 'North-East Corner'],
      pricePerSqYd: 28000,
      roadWidthFt: 40,
      gatedAmenities: [
        '40ft & 60ft Black Top BT Roads with Footpaths',
        'Underground Drainage, Water & Electrical Cabling',
        'Compound Wall with 24/7 Security & CCTV',
        'Landscaped Avenue Plantation & Children Play Park',
        'Overhead Water Tank with Connection to Every Plot',
      ],
      titleClearStatus: 'Bank Approved (SBI, HDFC, ICICI). 30-Year Encumbrance & Link Documents Verified.',
      siteVisitTransport: 'Complimentary Chauffeur AC Car pickup & drop from your doorstep in Hyderabad',
      bankLoanAvailable: true,
    },
    services: [
      {
        id: 's801',
        name: 'Free Plot Site Visit & Transport (Shankarpally & Mokila)',
        description: 'Chauffeur AC car arranged for physical site inspection of HMDA approved layouts with relationship manager',
        price: 0,
        pricingModel: 'fixed',
        durationMin: 180,
      },
      {
        id: 's802',
        name: 'Full Legal Title Search & Document Scrutiny',
        description: 'EC, Link Documents, Pahani & RERA registration verification by senior High Court advocate',
        price: 2499,
        pricingModel: 'fixed',
        durationMin: 120,
      },
      {
        id: 's803',
        name: 'Plot Demarcation & Boundary Peg Marking',
        description: 'Total station survey verification with boundary corner stones fixed on site',
        price: 1500,
        pricingModel: 'fixed',
        durationMin: 90,
      },
    ],
    reviews: [
      {
        id: 'r81',
        author: 'Naresh G.',
        rating: 5,
        date: '5 days ago',
        comment: 'Helped us purchase a 250 sq yd plot in Shankarpally. Transparent paperwork, free car visit and spot registration.',
        locality: 'Jubilee Hills',
      },
      {
        id: 'r82',
        author: 'Prasanna Kumar',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Got SBI housing loan approved within 10 days because layout papers were 100% clear. Excellent team!',
        locality: 'Kondapur',
      },
    ],
  },
  {
    id: 'p9',
    businessName: 'Sri Balaji Nest Homes & Rentals',
    tagline: 'Verified 2 & 3 BHK Flats, Luxury Gated Villas • Zero Brokerage Assistance',
    categorySlug: 'property-rent',
    categoryNameEn: 'House Rentals',
    categoryNameTe: 'ఇళ్ల అద్దెలు',
    rating: 4.86,
    reviewCount: 178,
    distanceKm: 1.6,
    locality: 'Gachibowli',
    city: 'Hyderabad',
    pricingModel: 'quote',
    startingPrice: 28000,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'B',
    avatarBg: '#F1F5F9',
    experienceYears: 8,
    completedJobs: 560,
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['Gated Society High-Rise', 'Zero Brokerage Option', 'Near Hitec City Metro'],
      availableConfigs: [
        '1 BHK Studio Flat (₹15,000 / mo)',
        '2 BHK Semi-Furnished Gated (₹28,000 / mo)',
        '3 BHK Luxury High-Rise (₹48,000 / mo)',
        'Independent Villa (₹85,000 / mo)',
      ],
      furnishing: 'Semi-Furnished',
      securityDepositMonths: 2,
      waterSupply: '24/7 Manjeera & Continuous Borewell Water',
      powerBackup: '100% DG Power Backup for lights, fans, ACs & appliances',
      gatedSociety: true,
      preferredTenants: 'Families & Working IT Professionals',
    },
    services: [
      {
        id: 's901',
        name: '2 BHK Flat Guided House Visit (Gachibowli & Madhapur)',
        description: 'Physical walkthrough of semi-furnished flats with covered car parking and clubhouse access',
        price: 0,
        pricingModel: 'fixed',
        durationMin: 60,
      },
      {
        id: 's902',
        name: '3 BHK Luxury Gated Society Inspection & Agreement',
        description: 'Walkthrough of premium apartment with modular kitchen, gym, pool and direct owner lease agreement',
        price: 0,
        pricingModel: 'fixed',
        durationMin: 90,
      },
      {
        id: 's903',
        name: 'Rental Agreement Drafting & Notary Delivery',
        description: 'Legally vetted 11-month lease deed drafted on stamp paper and delivered to doorstep',
        price: 799,
        pricingModel: 'fixed',
        durationMin: 45,
      },
    ],
    reviews: [
      {
        id: 'r91',
        author: 'Arun Teja',
        rating: 5,
        date: '4 days ago',
        comment: 'Found a 2BHK flat in Madhapur within 2 days of inquiry. Verified owner and no brokerage hassle!',
        locality: 'Madhapur',
      },
    ],
  },
  {
    id: 'p10',
    businessName: 'Sri Lakshmi Balaji Executive Men & Women PG',
    tagline: 'Luxury AC Rooms • 3 Times Andhra Homestyle Food • High-Speed Wi-Fi',
    categorySlug: 'hostel-pg',
    categoryNameEn: 'Hostel & PG',
    categoryNameTe: 'హాస్టల్స్ & పీజీ',
    rating: 4.91,
    reviewCount: 320,
    distanceKm: 0.6,
    locality: 'Madhapur',
    city: 'Hyderabad',
    pricingModel: 'fixed',
    startingPrice: 6500,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'L',
    avatarBg: '#FFF7ED',
    experienceYears: 6,
    completedJobs: 1120,
    photos: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['3 Times Andhra Food', 'High-Speed Wi-Fi', 'Near Madhapur Metro'],
      hostelType: "Men's PG",
      sharingTypes: ['Single Room (₹12,000/mo)', '2-Share (₹8,500/mo)', '3-Share (₹7,000/mo)', '4-Share (₹6,500/mo)'],
      foodFacility: '3 Times South & North Indian Meals, Sunday Special Biryani, Purified RO Water',
      amenitiesIncluded: [
        'Automatic Washing Machines on Every Floor',
        'High-Speed 200 Mbps Wi-Fi with Power Backup',
        'Attached Washrooms with 24/7 Hot Water Geysers',
        'Daily Room Housekeeping & Sanitization',
        '24/7 CCTV Surveillance & Biometric Security',
      ],
      rulesPolicy: 'No gate curfew for working professionals with biometric access',
    },
    services: [
      {
        id: 's1001',
        name: 'Schedule Hostel & Room Physical Walkthrough',
        description: 'Guided visit of rooms, mess dining area, Wi-Fi speed check & food tasting',
        price: 0,
        pricingModel: 'fixed',
        durationMin: 30,
      },
      {
        id: 's1002',
        name: '3-Share Room Admission with Food & Wi-Fi',
        description: 'Includes wooden cot, spring mattress, wardrobe, 3 meals daily & laundry facilities',
        price: 7000,
        pricingModel: 'fixed',
        durationMin: 45,
      },
      {
        id: 's1003',
        name: '2-Share AC Executive Room Admission',
        description: 'Split AC room with attached balcony, refrigerator and separate study tables',
        price: 8500,
        pricingModel: 'fixed',
        durationMin: 45,
      },
    ],
    reviews: [
      {
        id: 'r101',
        author: 'Karthik Varma',
        rating: 5,
        date: 'Yesterday',
        comment: 'Best food among all PGs in Madhapur. Clean rooms, high speed internet and very friendly warden.',
        locality: 'Madhapur',
      },
      {
        id: 'r102',
        author: 'Sravan Kumar',
        rating: 5,
        date: '1 week ago',
        comment: 'Walkable from Madhapur Metro. Washing machines and hot water are always available.',
        locality: 'Hitech City',
      },
    ],
  },
  {
    id: 'p11',
    businessName: 'Sri Srinivasa Shamiyana, Sound Systems & Events',
    tagline: 'Waterproof German Tents • JBL Line Array Sounds • Grand Stage & Flower Decor',
    categorySlug: 'shamiyana-events',
    categoryNameEn: 'Shamiyana & Sounds',
    categoryNameTe: 'షామియానా & సౌండ్స్',
    rating: 4.96,
    reviewCount: 240,
    distanceKm: 1.7,
    locality: 'Kukatpally',
    city: 'Hyderabad',
    pricingModel: 'fixed',
    startingPrice: 8000,
    currency: 'INR',
    isVerified: true,
    isAvailableNow: true,
    avatarLetter: 'S',
    avatarBg: '#FEF2F2',
    experienceYears: 14,
    completedJobs: 1850,
    photos: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    ],
    attributes: {
      highlightPills: ['Waterproof German Tents', 'JBL Line Array Sound', '25 kVA Silent Generator'],
      tentTypes: ['Waterproof German Aluminum Hangar', 'Traditional Festive Shamiyana', 'Pagoda / Canopy Tents'],
      soundSystemSpecs: 'JBL VRX Line Array (4 Tops, 2 Heavy Bass Subs), Soundcraft Digital Mixer, Dual Shure Wireless Mics',
      eventServices: [
        'Grand Stage Decoration with Fresh Exotic Flowers & LED Backdrop',
        'Waterproof German Tent Setup with Ceiling Drapery & Chandeliers',
        'Heavy Concert Sound System with Sound Engineer Support',
        '25 kVA & 40 kVA Silent Cummins Generator Backup',
        'Complete Buffet Food Counters, Warmers & Steel Cooking Vessels',
      ],
      generatorCapacityKva: 25,
      packageTiers: [
        { name: 'Small Home Function / Birthday (100 Pax)', pax: 100, price: 8000, inclusions: 'Shamiyana 20x30, 2 JBL Speakers, 50 VIP Chairs' },
        { name: 'Medium Reception / Half Saree (300 Pax)', pax: 300, price: 22000, inclusions: 'Waterproof Tent 40x60, Flower Stage, Line Array, Generator' },
        { name: 'Grand Wedding & Convention (1000 Pax)', pax: 1000, price: 65000, inclusions: 'Full Hangar Tent, Grand Stage, Truss Lighting, 40kVA Gen' },
      ],
    },
    services: [
      {
        id: 's1101',
        name: 'Home Function Shamiyana & Sound Setup (100 Pax)',
        description: 'Waterproof ceiling tent, 50 cushioned banquet chairs, 2 JBL PA speakers, ambient LED focus lights',
        price: 8000,
        pricingModel: 'fixed',
        durationMin: 360,
      },
      {
        id: 's1102',
        name: 'Wedding & Reception Stage Decor + Line Array Sound',
        description: '30ft grand floral stage, DJ line array sound system, truss moving heads & 25kVA silent generator',
        price: 28000,
        pricingModel: 'fixed',
        durationMin: 720,
      },
      {
        id: 's1103',
        name: '25 kVA Silent Diesel Generator with Operator',
        description: 'Uninterrupted power supply for weddings and outdoor events. Includes diesel and qualified technician.',
        price: 6500,
        pricingModel: 'fixed',
        durationMin: 480,
      },
    ],
    reviews: [
      {
        id: 'r111',
        author: 'Chaitanya Raju',
        rating: 5,
        date: '3 days ago',
        comment: 'Arranged waterproof tent and sound for our housewarming in heavy rain. Flawless setup without a drop of leak!',
        locality: 'Kukatpally',
      },
    ],
  },
];

export const MOCK_LOCAL_BUSINESSES: LocalBusiness[] = [
  {
    id: 'b101',
    name: 'Balaji Hardware & Electricals',
    category: 'Hardware & Tools',
    locality: 'Madhapur',
    rating: 4.6,
    reviewCount: 164,
    distanceKm: 0.8,
    offerText: 'Flat 10% Off on Havells & Anchor Products',
  },
  {
    id: 'b102',
    name: 'Sri Venkateswara Sanitary Mart',
    category: 'Plumbing & Tiles',
    locality: 'Kondapur',
    rating: 4.5,
    reviewCount: 88,
    distanceKm: 1.6,
    offerText: 'Direct factory rate on Jaquar fittings',
  },
];

export const MOCK_PROPERTIES: PropertyListing[] = [
  {
    id: 'prop1',
    title: 'HMDA Approved 200 Sq. Yds East-Facing Plot',
    type: 'commercial',
    propertyType: 'plot',
    locality: 'Shankarpally Road',
    city: 'Hyderabad',
    priceFormatted: '₹28,000 / Sq. Yd',
    sqft: 1800,
    isVerified: true,
    features: ['HMDA Approved', '40ft BT Roads', 'Underground Drainage', 'Immediate Registration'],
  },
  {
    id: 'prop2',
    title: 'DTCP Gated Community Open Plot (167 Sq. Yds)',
    type: 'commercial',
    propertyType: 'plot',
    locality: 'Mokila',
    city: 'Hyderabad',
    priceFormatted: '₹34,000 / Sq. Yd',
    sqft: 1500,
    isVerified: true,
    features: ['RERA Registered', 'Clubhouse & Park', 'Compound Wall', 'Bank Loan Available'],
  },
  {
    id: 'prop3',
    title: 'Spacious 3 BHK Luxury Flat in Gated Community',
    type: 'rent',
    propertyType: 'apartment',
    locality: 'Gachibowli',
    city: 'Hyderabad',
    priceFormatted: '₹48,000 / mo',
    bhk: '3 BHK',
    sqft: 1850,
    isVerified: true,
    features: ['Fully Furnished', '100% Power Backup', 'Gym & Pool', 'Family Only'],
  },
  {
    id: 'prop4',
    title: 'East Facing 2 BHK Flat with Covered Parking',
    type: 'rent',
    propertyType: 'apartment',
    locality: 'Madhapur',
    city: 'Hyderabad',
    priceFormatted: '₹28,000 / mo',
    bhk: '2 BHK',
    sqft: 1220,
    isVerified: true,
    features: ['Semi Furnished', 'Near Metro', 'Lift Available', '24/7 Security'],
  },
];

export const POPULAR_SEARCH_TAGS = [
  'AC servicing',
  'Fan repair',
  'Bathroom leak',
  'Sofa cleaning',
  'Electrician near me',
  'Packers Hyderabad',
  'Inverter wiring',
  'Carpenter for door lock',
];

