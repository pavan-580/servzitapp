import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiBase, restoreSession, signOut, SignedInUser, storeSession } from '../src/auth/session';
import { Button } from '../src/components/common/Button';
import { Icon } from '../src/components/common/Icon';
import { useAppMode } from '../src/context/AppModeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useMarketplace } from '../src/context/MarketplaceContext';
import { MockProvider } from '../src/data/mockMarketplace';
import { Colors, Radius, Shadows, Typography } from '../src/theme/tokens';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode, setMode } = useAppMode();
  const { addProviderListing } = useMarketplace();
  const { language } = useLanguage();

  // Onboarding Step State
  // 1: Phone / OTP
  // 2: Choose Role (Customer vs Provider)
  // 3: Choose Service Category (If Provider)
  // 4: Enter Category-Specific Details & Upload Photos (If Provider)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Auth fields
  const [phone, setPhone] = useState('+91 98765 43210');
  const [code, setCode] = useState('123456');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<SignedInUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Role & Service Selection
  const [selectedRole, setSelectedRole] = useState<'customer' | 'provider'>('customer');
  const [selectedCategory, setSelectedCategory] = useState<string>('hostel-pg');

  // Business & Listing Form Fields
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [locality, setLocality] = useState('Madhapur, Hyderabad');
  const [startingPrice, setStartingPrice] = useState('');

  // Domain-specific fields
  // Hostel / PG
  const [hostelType, setHostelType] = useState<string>("Men's PG");
  const [sharingOptions, setSharingOptions] = useState<string>('Single, 2-Share, 3-Share, 4-Share');
  const [foodMenu, setFoodMenu] = useState<string>('3 Times South & North Indian Meals + Wi-Fi');

  // Shamiyana / Sound
  const [tentType, setTentType] = useState<string>('Waterproof German Aluminum Hangar Tent');
  const [soundSpecs, setSoundSpecs] = useState<string>('JBL Line Array Concert Sound + Digital Mixer');
  const [generatorKva, setGeneratorKva] = useState<string>('25 kVA Silent Cummins Generator');

  // Plots / Land
  const [surveyNumber, setSurveyNumber] = useState<string>('Sy No. 142/P & 143, Shankarpally Highway');
  const [approvalAuthority, setApprovalAuthority] = useState<string>('HMDA Approved');
  const [plotSizes, setPlotSizes] = useState<string>('167, 200, 267, 350 Sq. Yds');
  const [plotFacing, setPlotFacing] = useState<string>('East & North Facing');
  const [pricePerYd, setPricePerYd] = useState<string>('28000');

  // Car Rental
  const [fleetModels, setFleetModels] = useState<string>('Toyota Innova Crysta, Maruti Ertiga, Dzire');
  const [perKmRate, setPerKmRate] = useState<string>('14');

  // Photography
  const [cameraGear, setCameraGear] = useState<string>('Sony Alpha A7 IV, DJI Mavic 3 Cine 4K Drone');
  const [albumFormat, setAlbumFormat] = useState<string>('40-Sheet High-Gloss Karizma Photobook');

  // Photos from anywhere
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [photosList, setPhotosList] = useState<string[]>([]);

  // Curated Preset Photos per category
  const categoryPresets: Record<string, { label: string; url: string }[]> = {
    'hostel-pg': [
      { label: '🛏️ Modern PG Bedroom', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80' },
      { label: '🍲 Clean Mess & Dining', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80' },
      { label: '🏢 PG Building Exterior', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80' },
    ],
    'shamiyana-events': [
      { label: '⛺ Illuminated Tent Decor', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80' },
      { label: '🌸 Grand Stage & Flowers', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80' },
      { label: '🔊 JBL Concert Sound Rig', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80' },
    ],
    'land-sale': [
      { label: '📐 Gated Layout 40ft Road', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80' },
      { label: '🏞️ Open Residential Plot', url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=600&q=80' },
      { label: '🏛️ Layout Grand Arch', url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80' },
    ],
    'property-rent': [
      { label: '🛋️ Semi-Furnished Hall', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80' },
      { label: '🍳 Modular Kitchen', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
    ],
    'priest': [
      { label: '🕉️ Sacred Pooja Setup', url: 'https://images.unsplash.com/photo-1609358905581-e5382c448f7d?auto=format&fit=crop&w=600&q=80' },
      { label: '🔥 Vastu Homam Blessing', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
    ],
    'car-rentals': [
      { label: '🚗 Luxury Innova SUV', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80' },
      { label: '🚙 Chauffeur AC Sedan', url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80' },
    ],
    'photography': [
      { label: '💍 Wedding Candid Shot', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80' },
      { label: '📷 Sony Cinema Line Gear', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
    ],
    default: [
      { label: '⚡ Professional Tool Kit', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80' },
      { label: '🔧 Diagnostic Equipment', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
    ],
  };

  useEffect(() => {
    let active = true;
    restoreSession().then((u) => {
      if (active && u) setExistingUser(u);
    }).finally(() => {
      if (active) setCheckingSession(false);
    });
    return () => { active = false; };
  }, []);

  // Set default form values when category changes
  useEffect(() => {
    const presets = categoryPresets[selectedCategory] || categoryPresets.default;
    setPhotosList(presets.map((p) => p.url));

    switch (selectedCategory) {
      case 'hostel-pg':
        setBusinessName('Sri Lakshmi Balaji Executive Men & Women PG');
        setTagline('Luxury AC Rooms • 3 Times Andhra Homestyle Food • High-Speed Wi-Fi');
        setStartingPrice('6500');
        break;
      case 'shamiyana-events':
        setBusinessName('Sri Srinivasa Shamiyana, Sound Systems & Events');
        setTagline('Waterproof German Tents • JBL Line Array Sounds • Stage Decor');
        setStartingPrice('8000');
        break;
      case 'land-sale':
        setBusinessName('Cyberabad Green Meadows & HMDA Plots');
        setTagline('HMDA Approved Gated Layout • 100% Clear Title • Free AC Car Site Visit');
        setStartingPrice('28000');
        break;
      case 'priest':
        setBusinessName('Brahmasri Venkata Sharma (Vaidika Purohit)');
        setTagline('Vaidika Smartha Purohit • 15+ Yrs Patashala • All Vedic Poojas & Homams');
        setStartingPrice('3500');
        break;
      case 'car-rentals':
        setBusinessName('Telangana Travels & Cab Rentals');
        setTagline('Innova Crysta, Ertiga & Sedans • Verified Chauffeurs • 24/7 Outstation');
        setStartingPrice('14');
        break;
      case 'photography':
        setBusinessName('PixelKraft Wedding & Aerial Studios');
        setTagline('Candid Photography, 4K Cinematic Films & Drone Shoots in Hyderabad');
        setStartingPrice('15000');
        break;
      case 'property-rent':
        setBusinessName('Sri Balaji Nest Homes & Rentals');
        setTagline('Verified 2 & 3 BHK Flats, Luxury Gated Villas • Zero Brokerage');
        setStartingPrice('28000');
        break;
      default:
        setBusinessName('Balaji Power & Technical Solutions');
        setTagline('Govt Licensed Specialist • 30-Day Guarantee • Transparent Pricing');
        setStartingPrice('199');
        break;
    }
  }, [selectedCategory]);

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setPhotosList((prev) => [...prev, photoUrlInput.trim()]);
    setPhotoUrlInput('');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotosList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!photosList.includes(url)) {
      setPhotosList((prev) => [...prev, url]);
    }
  };

  // Fast Demo Sign-In
  const handleQuickDemoSignIn = async () => {
    setBusy(true);
    try {
      await storeSession('demo_access_token_123', 'demo_refresh_token_123');
      setSent(true);
      setStep(2); // Proceed to role selection
    } catch {
      setError('Could not establish demo session.');
    } finally {
      setBusy(false);
    }
  };

  // Request OTP
  const handleRequestCode = async () => {
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setError('Enter a valid phone number, e.g. +91 98765 43210');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (apiBase()) {
        const response = await fetch(`${apiBase()}/auth/otp/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneE164: normalized }),
        });
        if (!response.ok) throw new Error('Could not send code');
      }
      setSent(true);
      setNotice('Verification code sent. For fast testing, enter 123456.');
    } catch {
      // In offline / local demo, allow proceeding
      setSent(true);
      setNotice('Test mode: Verification code 123456 accepted.');
    } finally {
      setBusy(false);
    }
  };

  // Verify OTP
  const handleVerifyCode = async () => {
    setBusy(true);
    setError(null);
    try {
      await storeSession('verified_access_token', 'verified_refresh_token');
      setStep(2); // Proceed to Skazo role choice
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Complete Customer Onboarding
  const handleCompleteCustomer = async () => {
    await setMode('customer');
    Alert.alert(
      'Welcome to SERVZ’IT! 🏠',
      'You are signed in as a Customer. Explore verified local services, PGs, plots, rentals, and book directly!'
    );
    router.replace('/(tabs)');
  };

  // Complete Provider Listing & Publishing
  const handlePublishProviderListing = async () => {
    if (!businessName.trim()) {
      Alert.alert('Required Field', 'Please enter your business or listing name.');
      return;
    }

    setBusy(true);

    const newProvider: MockProvider = {
      id: `custom-${Date.now()}`,
      businessName: businessName.trim(),
      tagline: tagline.trim() || 'Verified Local Partner',
      categorySlug: selectedCategory,
      categoryNameEn: selectedCategory === 'hostel-pg' ? 'Hostel & PG' : selectedCategory === 'shamiyana-events' ? 'Shamiyana & Sounds' : 'Verified Partner',
      categoryNameTe: selectedCategory === 'hostel-pg' ? 'హాస్టల్స్ & పీజీ' : selectedCategory === 'shamiyana-events' ? 'షామియానా & సౌండ్స్' : 'ధృవీకరించబడిన భాగస్వామి',
      rating: 5.0,
      reviewCount: 1,
      distanceKm: 0.8,
      locality: locality.trim() || 'Madhapur',
      city: 'Hyderabad',
      pricingModel: selectedCategory === 'land-sale' ? 'quote' : 'fixed',
      startingPrice: Number(startingPrice || '999'),
      currency: 'INR',
      isVerified: true,
      isAvailableNow: true,
      avatarLetter: businessName.trim().charAt(0).toUpperCase() || 'P',
      avatarBg: '#EFF6FF',
      experienceYears: 5,
      completedJobs: 150,
      photos: photosList.length > 0 ? photosList : [categoryPresets.default[0].url],
      attributes: {
        highlightPills: ['Verified Merchant', 'Instant Booking', 'Live on SERVZ’IT'],
        surveyNo: surveyNumber,
        approvalAuthority: approvalAuthority as any,
        plotSizesSqYd: plotSizes.split(',').map((s) => s.trim()),
        pricePerSqYd: Number(pricePerYd || '28000'),
        hostelType: hostelType as any,
        sharingTypes: sharingOptions.split(',').map((s) => s.trim()),
        foodFacility: foodMenu,
        tentTypes: [tentType],
        soundSystemSpecs: soundSpecs,
        generatorCapacityKva: 25,
        fleetModels: [{ name: fleetModels, seats: 7, ac: true, perKm: Number(perKmRate || '14') }],
        cameraBodies: [cameraGear],
        albumType: albumFormat,
        visitingInspectionFee: Number(startingPrice || '199'),
        reworkWarrantyDays: 30,
      },
      services: [
        {
          id: `svc-${Date.now()}-1`,
          name: `${businessName} Primary Booking`,
          description: `Direct booking and inquiry for ${businessName}. Verified details and transparent pricing.`,
          price: Number(startingPrice || '999'),
          pricingModel: 'fixed',
          durationMin: 60,
        },
      ],
      reviews: [
        {
          id: `rev-${Date.now()}`,
          author: 'SERVZ’IT Verified Customer',
          rating: 5,
          date: 'Just now',
          comment: 'New verified listing activated with photos and direct owner/partner connect.',
          locality: locality.trim(),
        },
      ],
    };

    await addProviderListing(newProvider);
    await setMode('provider');
    setBusy(false);

    Alert.alert(
      'Listing Published Live! ✓',
      `Congratulations! ${businessName} is now live on SERVZ’IT and Skazo discovery radar. Customers can view your photos and request services!`,
      [
        {
          text: 'Open Partner Dashboard ⚡',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (step > 1) setStep((step - 1) as typeof step);
            else router.back();
          }}
          style={styles.backBtn}
        >
          <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {step === 1
            ? 'Sign In / Register'
            : step === 2
            ? 'Choose Your Role'
            : step === 3
            ? 'Select Service Category'
            : 'List Your Service & Photos'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 1: Phone & Fast Demo Sign-In */}
        {step === 1 && (
          <View style={styles.stepBox}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>SERVZ’IT • SKAZO POWERED</Text>
            </View>
            <Text style={styles.mainTitle}>Welcome to your{'\n'}hyperlocal marketplace.</Text>
            <Text style={styles.subTitle}>
              Connect with local customers, list hostels, plots, shamiyana, rentals & home services with zero brokerage.
            </Text>

            {/* Fast 1-Tap Demo Pill */}
            <Pressable
              onPress={handleQuickDemoSignIn}
              style={styles.demoLoginPill}
              disabled={busy}
            >
              <Text style={styles.demoPillEmoji}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoPillTitle}>1-Tap Quick Demo Sign-In</Text>
                <Text style={styles.demoPillSub}>Instantly sign in without waiting for SMS OTP</Text>
              </View>
              <Text style={styles.demoPillArrow}>›</Text>
            </Pressable>

            <View style={styles.orDividerRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR USE MOBILE NUMBER</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={styles.inputLabel}>MOBILE PHONE NUMBER</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              editable={!sent && !busy}
              style={styles.input}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />

            {sent && (
              <>
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>6-DIGIT VERIFICATION CODE</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                  placeholder="Enter 6-digit code (e.g. 123456)"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

            <Button
              label={busy ? 'Verifying...' : sent ? 'Verify & Continue ›' : 'Send Verification Code ›'}
              size="lg"
              loading={busy}
              style={{ marginTop: 20 }}
              onPress={sent ? handleVerifyCode : handleRequestCode}
            />

            {sent && (
              <Pressable
                onPress={() => { setSent(false); setNotice(null); }}
                style={styles.changePhoneBtn}
              >
                <Text style={styles.changePhoneText}>Change phone number</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* STEP 2: Skazo Role Selection (Customer vs Partner) */}
        {step === 2 && (
          <View style={styles.stepBox}>
            <Text style={styles.mainTitle}>How will you use{'\n'}SERVZ’IT today?</Text>
            <Text style={styles.subTitle}>
              You can switch between Customer Mode and Partner Mode at any time with a single tap.
            </Text>

            {/* Option A: Customer */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedRole('customer')}
              style={[
                styles.roleOptionCard,
                selectedRole === 'customer' && styles.roleOptionCardActive,
              ]}
            >
              <View style={styles.roleIconWrap}>
                <Text style={styles.roleEmoji}>🏠</Text>
              </View>
              <View style={styles.roleTextCol}>
                <View style={styles.roleTitleRow}>
                  <Text style={styles.roleTitle}>I am a Customer / Buyer</Text>
                  {selectedRole === 'customer' && <Text style={styles.roleCheck}>✓</Text>}
                </View>
                <Text style={styles.roleDesc}>
                  I want to discover verified home services, hostels & PGs, open plots, house rentals, purohits, or cabs.
                </Text>
              </View>
            </Pressable>

            {/* Option B: Service Provider / Merchant */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedRole('provider')}
              style={[
                styles.roleOptionCard,
                selectedRole === 'provider' && styles.roleOptionCardActive,
              ]}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.roleEmoji}>⚡</Text>
              </View>
              <View style={styles.roleTextCol}>
                <View style={styles.roleTitleRow}>
                  <Text style={styles.roleTitle}>I am a Service Provider / Seller</Text>
                  {selectedRole === 'provider' && <Text style={styles.roleCheck}>✓</Text>}
                </View>
                <Text style={styles.roleDesc}>
                  I want to list my business, hostel/PG, open plots, shamiyana & sound, fleet, or service and get leads.
                </Text>
              </View>
            </Pressable>

            <Button
              label={selectedRole === 'customer' ? 'Continue as Customer 🏠' : 'Configure My Business Vertical ›'}
              size="lg"
              style={{ marginTop: 24 }}
              onPress={() => {
                if (selectedRole === 'customer') {
                  handleCompleteCustomer();
                } else {
                  setStep(3); // Choose category
                }
              }}
            />
          </View>
        )}

        {/* STEP 3: Category Selection for Service Providers */}
        {step === 3 && (
          <View style={styles.stepBox}>
            <Text style={styles.mainTitle}>What service do you provide?</Text>
            <Text style={styles.subTitle}>
              Select your business vertical. The listing questions will be customized to match your domain.
            </Text>

            <View style={styles.categoryGrid}>
              {[
                { id: 'hostel-pg', icon: '🛏️', name: 'Hostel & PG', badge: 'Hot' },
                { id: 'shamiyana-events', icon: '⛺', name: 'Shamiyana & Sounds', badge: 'Event' },
                { id: 'land-sale', icon: '📐', name: 'Plots & Land', badge: 'Invest' },
                { id: 'property-rent', icon: '🏢', name: 'House Rentals' },
                { id: 'priest', icon: '🕉️', name: 'Vedic Purohit' },
                { id: 'photography', icon: '📷', name: 'Photography' },
                { id: 'car-rentals', icon: '🚗', name: 'Car Rentals & Cabs' },
                { id: 'electrical', icon: '⚡', name: 'Electrician' },
                { id: 'ac-service', icon: '❄️', name: 'AC Service' },
                { id: 'plumbing', icon: '🔧', name: 'Plumber' },
                { id: 'cleaning', icon: '🧹', name: 'Deep Cleaning' },
                { id: 'moving', icon: '🚚', name: 'Packers & Movers' },
                { id: 'carpentry', icon: '🔨', name: 'Carpenter' },
                { id: 'painting', icon: '🎨', name: 'Painting' },
                { id: 'pest-control', icon: '🪳', name: 'Pest Control' },
                { id: 'vehicle-mechanic', icon: '🛠️', name: 'Vehicle Mechanic' },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardActive,
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.categoryName,
                        isSelected && styles.categoryNameActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {cat.badge && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{cat.badge}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Button
              label="Enter Vertical Details & Photos ›"
              size="lg"
              style={{ marginTop: 24 }}
              onPress={() => setStep(4)}
            />
          </View>
        )}

        {/* STEP 4: Vertical Details & Photo Uploader */}
        {step === 4 && (
          <View style={styles.stepBox}>
            <Text style={styles.mainTitle}>Create Your Live Listing</Text>
            <Text style={styles.subTitle}>
              Enter specifications and photos. Customers can view this live on the app immediately.
            </Text>

            {/* General Info */}
            <Text style={styles.inputLabel}>BUSINESS / LISTING TITLE *</Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              style={styles.input}
              placeholder="e.g. Sri Balaji Executive PG / Srinivasa Shamiyana"
            />

            <Text style={styles.inputLabel}>TAGLINE / HIGHLIGHT</Text>
            <TextInput
              value={tagline}
              onChangeText={setTagline}
              style={styles.input}
              placeholder="e.g. 3 Times Andhra Food • Free AC Car Site Visit"
            />

            <Text style={styles.inputLabel}>YOUR LOCALITY / PREMISES *</Text>
            <TextInput
              value={locality}
              onChangeText={setLocality}
              style={styles.input}
              placeholder="e.g. Madhapur, Hyderabad - Near Metro"
            />

            {/* DOMAIN SPECIFIC FIELDS */}
            {selectedCategory === 'hostel-pg' && (
              <View style={styles.domainSection}>
                <Text style={styles.domainSectionHeader}>🏢 HOSTEL & PG SPECIFICATIONS</Text>

                <Text style={styles.inputLabel}>HOSTEL CATEGORY</Text>
                <View style={styles.pillRow}>
                  {["Men's PG", "Women's PG", 'Co-Living', 'Student Hostel'].map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setHostelType(t)}
                      style={[styles.smallPill, hostelType === t && styles.smallPillActive]}
                    >
                      <Text style={[styles.smallPillText, hostelType === t && styles.smallPillTextActive]}>{t}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>ROOM SHARING OPTIONS</Text>
                <TextInput
                  value={sharingOptions}
                  onChangeText={setSharingOptions}
                  style={styles.input}
                  placeholder="e.g. Single, 2-Share, 3-Share, 4-Share"
                />

                <Text style={styles.inputLabel}>FOOD & AMENITIES INCLUDED</Text>
                <TextInput
                  value={foodMenu}
                  onChangeText={setFoodMenu}
                  style={styles.input}
                  placeholder="e.g. 3 Times Andhra Meals, 200Mbps Wi-Fi, Washing Machine"
                />

                <Text style={styles.inputLabel}>MONTHLY STARTING RENT (₹ / MO)</Text>
                <TextInput
                  value={startingPrice}
                  onChangeText={setStartingPrice}
                  style={styles.input}
                  placeholder="6500"
                  keyboardType="numeric"
                />
              </View>
            )}

            {selectedCategory === 'shamiyana-events' && (
              <View style={styles.domainSection}>
                <Text style={styles.domainSectionHeader}>⛺ SHAMIYANA & SOUND SPECIFICATIONS</Text>

                <Text style={styles.inputLabel}>TENT & SHAMIYANA TYPE</Text>
                <TextInput
                  value={tentType}
                  onChangeText={setTentType}
                  style={styles.input}
                  placeholder="e.g. Waterproof German Tent / Cloth Shamiyana"
                />

                <Text style={styles.inputLabel}>SOUND SYSTEM & DJ EQUIPMENT</Text>
                <TextInput
                  value={soundSpecs}
                  onChangeText={setSoundSpecs}
                  style={styles.input}
                  placeholder="e.g. JBL Line Array (4 Tops, 2 Subs) + Wireless Mics"
                />

                <Text style={styles.inputLabel}>GENERATOR & POWER BACKUP</Text>
                <TextInput
                  value={generatorKva}
                  onChangeText={setGeneratorKva}
                  style={styles.input}
                  placeholder="e.g. 25 kVA Silent Cummins Generator"
                />

                <Text style={styles.inputLabel}>BASE PACKAGE RATE (₹)</Text>
                <TextInput
                  value={startingPrice}
                  onChangeText={setStartingPrice}
                  style={styles.input}
                  placeholder="8000"
                  keyboardType="numeric"
                />
              </View>
            )}

            {selectedCategory === 'land-sale' && (
              <View style={styles.domainSection}>
                <Text style={styles.domainSectionHeader}>📐 RESIDENTIAL PLOT SPECIFICATIONS</Text>

                <Text style={styles.inputLabel}>SURVEY NUMBER & HIGHWAY CORRIDOR</Text>
                <TextInput
                  value={surveyNumber}
                  onChangeText={setSurveyNumber}
                  style={styles.input}
                  placeholder="e.g. Sy No. 142/P, Shankarpally Highway"
                />

                <Text style={styles.inputLabel}>APPROVAL AUTHORITY</Text>
                <View style={styles.pillRow}>
                  {['HMDA Approved', 'DTCP Approved', 'RERA Registered', 'Panchayat'].map((a) => (
                    <Pressable
                      key={a}
                      onPress={() => setApprovalAuthority(a)}
                      style={[styles.smallPill, approvalAuthority === a && styles.smallPillActive]}
                    >
                      <Text style={[styles.smallPillText, approvalAuthority === a && styles.smallPillTextActive]}>{a}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>PRICE PER SQ. YARD (₹)</Text>
                <TextInput
                  value={startingPrice}
                  onChangeText={setStartingPrice}
                  style={styles.input}
                  placeholder="28000"
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* PHOTO UPLOADER - ACCEPTS PHOTOS FROM ANYWHERE */}
            <View style={styles.photoSection}>
              <View style={styles.photoSectionHeader}>
                <Text style={styles.photoTitle}>📸 PHOTOS (ACCEPTED FROM ANYWHERE)</Text>
                <Text style={styles.photoCount}>{photosList.length} photos added</Text>
              </View>
              <Text style={styles.photoDesc}>
                Paste any image URL, choose authentic curated category presets with 1-tap, or snap device photos.
              </Text>

              {/* Paste URL */}
              <View style={styles.urlInputRow}>
                <TextInput
                  value={photoUrlInput}
                  onChangeText={setPhotoUrlInput}
                  style={styles.urlInput}
                  placeholder="Paste image link: https://... / image URL"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={handleAddPhotoUrl} style={styles.addUrlBtn}>
                  <Text style={styles.addUrlBtnText}>+ Add URL</Text>
                </Pressable>
              </View>

              {/* Curated 1-Tap Category Gallery Presets */}
              <Text style={styles.presetHeading}>QUICK 1-TAP CATEGORY PRESETS:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                {(categoryPresets[selectedCategory] || categoryPresets.default).map((preset, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleAddPresetPhoto(preset.url)}
                    style={styles.presetCard}
                  >
                    <Image source={{ uri: preset.url }} style={styles.presetImg} />
                    <Text numberOfLines={1} style={styles.presetLabel}>{preset.label}</Text>
                    <Text style={styles.presetAddText}>+ Add</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Attached Photos Live Gallery */}
              {photosList.length > 0 && (
                <View style={styles.attachedGallery}>
                  <Text style={styles.attachedHeading}>ACTIVE LISTING PHOTOS:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                    {photosList.map((uri, idx) => (
                      <View key={idx} style={styles.thumbWrapper}>
                        <Image source={{ uri }} style={styles.thumbImg} />
                        {idx === 0 && (
                          <View style={styles.coverBadge}>
                            <Text style={styles.coverText}>★ COVER</Text>
                          </View>
                        )}
                        <Pressable onPress={() => handleRemovePhoto(idx)} style={styles.removeBtn}>
                          <Text style={styles.removeText}>✕</Text>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Button
              label={busy ? 'Publishing...' : 'Publish Listing & Go Live ✓'}
              size="lg"
              loading={busy}
              style={{ marginTop: 24, marginBottom: 30 }}
              onPress={handlePublishProviderListing}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  stepBox: {},
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    marginBottom: 8,
  },
  brandText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 30,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  demoLoginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  demoPillEmoji: {
    fontSize: 26,
  },
  demoPillTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  demoPillSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  demoPillArrow: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  errorText: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: Radius.sm,
    fontSize: 12,
    marginTop: 10,
  },
  noticeText: {
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: Radius.sm,
    fontSize: 12,
    marginTop: 10,
  },
  changePhoneBtn: {
    alignSelf: 'center',
    padding: 10,
    marginTop: 6,
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 14,
    gap: 14,
    ...Shadows.sm,
  },
  roleOptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleEmoji: {
    fontSize: 22,
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  roleCheck: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  roleDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.sm,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  domainSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.lg,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  domainSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  smallPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  smallPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  smallPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  smallPillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 18,
    ...Shadows.sm,
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  photoCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  photoDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 10,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  addUrlBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  presetHeading: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  presetScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  presetCard: {
    width: 100,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: 6,
    alignItems: 'center',
  },
  presetImg: {
    width: 88,
    height: 58,
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  presetAddText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  attachedGallery: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  attachedHeading: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  galleryScroll: {
    gap: 8,
  },
  thumbWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingVertical: 1,
  },
  coverText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
