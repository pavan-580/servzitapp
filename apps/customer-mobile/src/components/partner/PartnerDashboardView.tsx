import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppMode } from '../../context/AppModeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Colors, Radius, Shadows, Typography } from '../../theme/tokens';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

type PartnerCategory =
  | 'electrical'
  | 'priest'
  | 'land-sale'
  | 'car-rentals'
  | 'photography'
  | 'property-rent'
  | 'hostel-pg'
  | 'shamiyana-events';

export const PartnerDashboardView: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { mode, toggleMode, isOnline, toggleOnline } = useAppMode();
  const { currentPartnerProvider } = useMarketplace();

  const [selectedCategory, setSelectedCategory] = useState<PartnerCategory>(
    (currentPartnerProvider?.categorySlug as PartnerCategory) || 'electrical'
  );
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // Form states for dynamic category inputs
  // Plot / Land
  const [surveyNo, setSurveyNo] = useState('Sy No. 188/A, Mokila Highway');
  const [approvalAuth, setApprovalAuth] = useState('HMDA Approved');
  const [plotSize, setPlotSize] = useState('200 Sq. Yds');
  const [plotFacing, setPlotFacing] = useState('East Facing');
  const [plotPriceYd, setPlotPriceYd] = useState('₹32,000 / Sq. Yd');
  const [plotRoadWidth, setPlotRoadWidth] = useState('40ft Blacktop');

  // Purohit / Priest
  const [vedicTradition, setVedicTradition] = useState('Telugu Smartha (ఋగ్వేదం)');
  const [ritualName, setRitualName] = useState('Sri Satyanarayana Swamy Vratham');
  const [samagriIncluded, setSamagriIncluded] = useState(true);
  const [dakshinaFee, setDakshinaFee] = useState('₹3,500');

  // Car Rental / Fleet
  const [vehicleModel, setVehicleModel] = useState('Toyota Innova Crysta (7-Seater)');
  const [regNumber, setRegNumber] = useState('TS 09 UB 4821');
  const [perKmRate, setPerKmRate] = useState('₹18 / km');
  const [chauffeurBeta, setChauffeurBeta] = useState('₹400 / day');

  // Photography
  const [cameraBody, setCameraBody] = useState('Sony Alpha A7 IV (Dual Slot)');
  const [droneModel, setDroneModel] = useState('DJI Mavic 3 Cine 4K');
  const [albumSheets, setAlbumSheets] = useState('40 Sheets Karizma');
  const [dailyRate, setDailyRate] = useState('₹25,000 / Day');

  // Property Rental
  const [bhkConfig, setBhkConfig] = useState('2 BHK Semi-Furnished Flat');
  const [monthlyRent, setMonthlyRent] = useState('₹28,000 / mo');
  const [securityDeposit, setSecurityDeposit] = useState('2 Months Advance');
  const [furnishing, setFurnishing] = useState('Semi-Furnished (Modular Kitchen)');

  // Electrical / Standard
  const [licenseNumber, setLicenseNumber] = useState('TS-TEL-LIC-48192');
  const [serviceTitle, setServiceTitle] = useState('Inverter & Dual Battery Setup');
  const [visitingFee, setVisitingFee] = useState('₹199 Inspection');
  const [warrantyDays, setWarrantyDays] = useState('30 Days');

  // Category Profile Definitions
  const partnerProfiles: Record<PartnerCategory, {
    businessName: string;
    avatarEmoji: string;
    kycBadge: string;
    subText: string;
    categoryLabel: string;
    todayPayout: string;
    completedCount: string;
  }> = {
    electrical: {
      businessName: 'Sri Sai Electrical & Power Solutions',
      avatarEmoji: '⚡',
      kycBadge: 'LICENSED WIREMAN ✓',
      subText: 'Govt Class-A License TS-TEL-LIC • Madhapur',
      categoryLabel: 'Electrician',
      todayPayout: '₹1,850',
      completedCount: '4 jobs done',
    },
    priest: {
      businessName: 'Brahmasri Venkata Sharma (Purohit)',
      avatarEmoji: '🕉️',
      kycBadge: 'VEDIC CERTIFIED ✓',
      subText: 'Tirumala Veda Patashala • Telugu Smartha • Kondapur',
      categoryLabel: 'Vedic Purohit',
      todayPayout: '₹7,000',
      completedCount: '2 poojas done',
    },
    'land-sale': {
      businessName: 'Cyberabad Land & Plot Advisors',
      avatarEmoji: '📐',
      kycBadge: 'HMDA / RERA VERIFIED ✓',
      subText: 'HMDA & DTCP Approved Gated Layouts • Shankarpally',
      categoryLabel: 'Plots & Land',
      todayPayout: '₹12,500',
      completedCount: '3 visits done',
    },
    'car-rentals': {
      businessName: 'Telangana Travels & Cab Rentals',
      avatarEmoji: '🚗',
      kycBadge: 'ALL INDIA PERMIT ✓',
      subText: 'Innova Crysta, Ertiga & Sedans • Verified Chauffeurs',
      categoryLabel: 'Fleet & Cabs',
      todayPayout: '₹5,600',
      completedCount: '2 outstation trips',
    },
    photography: {
      businessName: 'PixelKraft Wedding & Aerial Studios',
      avatarEmoji: '📷',
      kycBadge: 'STUDIO PRO ✓',
      subText: 'Sony Cinema Line & 4K Drone • Madhapur',
      categoryLabel: 'Photography',
      todayPayout: '₹18,000',
      completedCount: '1 event shoot',
    },
    'property-rent': {
      businessName: 'Sri Balaji Nest Homes & Rentals',
      avatarEmoji: '🏢',
      kycBadge: 'ZERO BROKERAGE PRO ✓',
      subText: 'Gated Society Apartments & Villas • Gachibowli',
      categoryLabel: 'House Rentals',
      todayPayout: '₹4,500',
      completedCount: '3 visits done',
    },
    'hostel-pg': {
      businessName: currentPartnerProvider?.categorySlug === 'hostel-pg' ? currentPartnerProvider.businessName : 'Sri Lakshmi Balaji Executive Men & Women PG',
      avatarEmoji: '🛏️',
      kycBadge: 'VERIFIED RESIDENCE ✓',
      subText: 'Attached Washrooms, 3 Times Food & Wi-Fi • Madhapur',
      categoryLabel: 'Hostel & PG',
      todayPayout: '₹19,500',
      completedCount: '3 room visits',
    },
    'shamiyana-events': {
      businessName: currentPartnerProvider?.categorySlug === 'shamiyana-events' ? currentPartnerProvider.businessName : 'Sri Srinivasa Shamiyana, Sound Systems & Events',
      avatarEmoji: '⛺',
      kycBadge: 'EVENT PRO ✓',
      subText: 'Waterproof German Hangars, JBL Line Array & 25kVA DG • Kukatpally',
      categoryLabel: 'Shamiyana & Sounds',
      todayPayout: '₹28,000',
      completedCount: '2 events setup',
    },
  };

  // Domain-Specific Incoming Jobs
  const allCategoryJobs: Record<PartnerCategory, Array<{
    id: string;
    serviceName: string;
    customerName: string;
    locality: string;
    distanceKm: number;
    time: string;
    payout: string;
    pricingModel: string;
    note: string;
  }>> = {
    electrical: [
      {
        id: 'job-elec-1',
        serviceName: 'Tripping MCB & Main Inverter Wiring Check',
        customerName: 'Suresh Rao',
        locality: 'Madhapur (Near Durgam Cheruvu)',
        distanceKm: 1.2,
        time: 'Today, 4:30 PM',
        payout: '₹199',
        pricingModel: 'Visiting Fee',
        note: 'Main hall MCB trips on AC compressor startup. Need urgent inspection.',
      },
      {
        id: 'job-elec-2',
        serviceName: 'Havells Ceiling Fan & Regulator Installation',
        customerName: 'Anuradha Devi',
        locality: 'Kondapur (Raghavendra Colony)',
        distanceKm: 2.1,
        time: 'Today, 6:00 PM',
        payout: '₹498',
        pricingModel: 'Fixed Installation',
        note: '2 new fans to be mounted with safety hook check.',
      },
    ],
    priest: [
      {
        id: 'job-priest-1',
        serviceName: 'Sri Satyanarayana Swamy Vratham (With Samagri)',
        customerName: 'Kalyan Chakravarthy',
        locality: 'Kondapur (Raghavendra Colony)',
        distanceKm: 1.8,
        time: 'Tomorrow, 08:30 AM (Subha Muhurtham)',
        payout: '₹3,500',
        pricingModel: 'Pooja Dakshina Package',
        note: 'New home entry anniversary. Please bring pure cow ghee and homa samagri kit.',
      },
      {
        id: 'job-priest-2',
        serviceName: 'Grihapravesham & Vastu Shanti Homam',
        customerName: 'Prasanna Kumar',
        locality: 'Madhapur (Near Metro)',
        distanceKm: 2.4,
        time: 'Sunday, 05:45 AM (Brahma Muhurtham)',
        payout: '₹5,500',
        pricingModel: 'Complete Ritual Blessing',
        note: 'First house warming pooja with cow entry and Kalasa Sthapana.',
      },
    ],
    'land-sale': [
      {
        id: 'job-land-1',
        serviceName: 'Free Chauffeur Site Visit (200 Sq. Yds East Facing)',
        customerName: 'Rajesh Varma',
        locality: 'Pickup from Hitec City Phase 2',
        distanceKm: 3.1,
        time: 'Saturday, 09:30 AM (Chauffeur Batch)',
        payout: 'Lead Match',
        pricingModel: 'Complimentary Escort',
        note: 'Buyer seeking East-facing clear title plot for immediate villa construction. Bank loan pre-approved.',
      },
      {
        id: 'job-land-2',
        serviceName: 'HMDA Approved 267 Sq. Yd Corner Bit Inspection',
        customerName: 'Dr. Srinivas Reddy',
        locality: 'Pickup from Jubilee Hills Checkpost',
        distanceKm: 4.8,
        time: 'Tomorrow, 03:00 PM',
        payout: 'High Priority',
        pricingModel: 'Verified Investor',
        note: 'Interested in DTCP/HMDA legal link documents scrutiny and physical demarcation.',
      },
    ],
    'car-rentals': [
      {
        id: 'job-car-1',
        serviceName: 'Toyota Innova Crysta Outstation (Hyderabad to Vijayawada)',
        customerName: 'Naveen Chandra',
        locality: 'Pickup: Madhapur (Near Inorbit Mall)',
        distanceKm: 1.5,
        time: 'Tomorrow, 05:00 AM Departure',
        payout: '₹4,999',
        pricingModel: 'Interstate Package',
        note: '5 passengers, family trip with 3 luggage bags. Clean AC vehicle required.',
      },
      {
        id: 'job-car-2',
        serviceName: 'Maruti Ertiga Airport Transfer (RGIA Drop)',
        customerName: 'Meghana Rao',
        locality: 'Pickup: Kondapur',
        distanceKm: 2.0,
        time: 'Tonight, 11:30 PM',
        payout: '₹1,299',
        pricingModel: 'Fixed Airport Fare',
        note: 'Flight departure at 03:00 AM. Punctual highway driver needed.',
      },
    ],
    photography: [
      {
        id: 'job-photo-1',
        serviceName: 'Wedding & Reception Candid Photography + 4K Teaser',
        customerName: 'Rohit & Sindhuja',
        locality: 'Jubilee Hills Convention Centre',
        distanceKm: 3.6,
        time: 'Nov 12 & 13 (2-Day Grand Wedding)',
        payout: '₹35,000',
        pricingModel: 'Full Event Package',
        note: 'Requires 2 senior photographers, 4K drone aerial shots and 40-sheet Karizma album.',
      },
      {
        id: 'job-photo-2',
        serviceName: 'Half Saree & Cradle Ceremony Candid Shoot',
        customerName: 'Venkata Ramana',
        locality: 'Gachibowli Function Hall',
        distanceKm: 2.2,
        time: 'Sunday, 10:00 AM - 02:00 PM',
        payout: '₹12,000',
        pricingModel: 'Half Day Shoot',
        note: '4-hour coverage with fast photo preview within 48 hours.',
      },
    ],
    'property-rent': [
      {
        id: 'job-rent-1',
        serviceName: '2 BHK Gated Society Flat Physical Walkthrough',
        customerName: 'Vikram Joshi (IT Senior Manager)',
        locality: 'My Home Bhooja / Gachibowli Area',
        distanceKm: 1.9,
        time: 'Today, 06:30 PM',
        payout: 'Tenant Direct',
        pricingModel: 'Zero Brokerage',
        note: 'Family tenant moving from Bangalore. Looking for semi-furnished flat with 100% power backup.',
      },
      {
        id: 'job-rent-2',
        serviceName: '3 BHK High-Rise Flat Lease Agreement & Inspection',
        customerName: 'Harish Varma',
        locality: 'Madhapur Metro Corridor',
        distanceKm: 2.7,
        time: 'Tomorrow, 11:00 AM',
        payout: 'Tenant Direct',
        pricingModel: 'Immediate Move-in',
        note: 'Ready to pay 2 months deposit. Covered car parking is essential.',
      },
    ],
    'hostel-pg': [
      {
        id: 'job-hostel-1',
        serviceName: '2-Sharing AC Executive Room Walkthrough & Move-in',
        customerName: 'Sai Kiran (Cognizant Software Engineer)',
        locality: 'Walk-in from Mindspace Madhapur',
        distanceKm: 0.8,
        time: 'Today, 06:00 PM',
        payout: '₹7,500 / mo',
        pricingModel: 'Monthly Rent',
        note: 'Looking for peaceful room with Wi-Fi & 3 times food. Moving in this Saturday.',
      },
      {
        id: 'job-hostel-2',
        serviceName: 'Single Private Room Reservation',
        customerName: 'Pooja Reddy',
        locality: 'Hitec City Metro Station',
        distanceKm: 1.4,
        time: 'Tomorrow, 10:00 AM',
        payout: '₹11,000 / mo',
        pricingModel: 'Monthly Rent',
        note: 'Requires parking space for 2-wheeler and night shift security.',
      },
    ],
    'shamiyana-events': [
      {
        id: 'job-shamiyana-1',
        serviceName: 'Waterproof German Hangar + JBL Sound Package',
        customerName: 'Chandra Shekar Rao',
        locality: 'KPHB Colony 4th Phase Ground',
        distanceKm: 2.5,
        time: 'Sunday 6:00 AM (Full Day Event)',
        payout: '₹24,000',
        pricingModel: 'Stage & Sound Package',
        note: 'Engagement celebration with 400 guests, need 300 VIP chairs, 10 tables and sound technician.',
      },
      {
        id: 'job-shamiyana-2',
        serviceName: 'Haldi Function Shamiyana & Lighting Setup',
        customerName: 'Sujatha Rani',
        locality: 'Nizampet Main Road',
        distanceKm: 3.2,
        time: 'Friday, 02:00 PM',
        payout: '₹14,500',
        pricingModel: 'Shamiyana Package',
        note: 'Tarpaulin setup with fairy string lights and portable PA system.',
      },
    ],
  };

  const [categoryJobs, setCategoryJobs] = useState(allCategoryJobs);

  const activeJobs = categoryJobs[selectedCategory];
  const currentProfile = partnerProfiles[selectedCategory];

  const handleAccept = (id: string) => {
    Alert.alert('Booking Accepted ✓', 'Customer notified. Navigation and details unlocked.');
    setCategoryJobs((prev) => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].filter((j) => j.id !== id),
    }));
  };

  const handleDecline = (id: string) => {
    Alert.alert('Job Passed', 'The booking request has been returned to nearby partner radar.');
    setCategoryJobs((prev) => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].filter((j) => j.id !== id),
    }));
  };

  const handlePublishService = () => {
    Alert.alert(
      'Service Published Successfully! ✓',
      `Your verified listing has been published to the SERVZ'IT ${currentProfile.categoryLabel} catalogue with domain-specific specifications.`
    );
    setIsAddServiceModalOpen(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, 38) + 8,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Partner Navigation Bar with 1-Tap Customer Switch */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentProfile.avatarEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text numberOfLines={1} style={styles.partnerName}>
                {currentProfile.businessName}
              </Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.kycBadge}>
                <Text style={styles.kycText}>{currentProfile.kycBadge}</Text>
              </View>
              <Text numberOfLines={1} style={styles.partnerType}>
                {currentProfile.subText}
              </Text>
            </View>
          </View>
        </View>

        {/* Prominent 1-Tap Direct Switch to Customer Mode */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch to customer mode"
          onPress={toggleMode}
          style={styles.switchModePill}
        >
          <Text style={styles.switchModeText}>← Customer 🏠</Text>
        </Pressable>
      </View>

      {/* Live Partner Listing Banner if photos exist */}
      {currentPartnerProvider && currentPartnerProvider.photos && currentPartnerProvider.photos.length > 0 && (
        <View style={styles.liveListingBanner}>
          <Image
            source={{ uri: currentPartnerProvider.photos[0] }}
            style={styles.liveListingImg}
          />
          <View style={styles.liveListingOverlay}>
            <View style={styles.liveListingBadge}>
              <Text style={styles.liveListingBadgeText}>● LIVE ON SERVZ’IT MARKETPLACE</Text>
            </View>
            <Text style={styles.liveListingTitle}>{currentPartnerProvider.businessName}</Text>
            <Text style={styles.liveListingSub}>
              {currentPartnerProvider.locality} • Starting ₹{currentPartnerProvider.startingPrice}
            </Text>
          </View>
        </View>
      )}

      {/* Vertical Selector Pill Strip */}
      <View style={styles.verticalSelectorWrap}>
        <Text style={styles.verticalKicker}>SWITCH PARTNER VERTICAL</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.verticalScroll}
        >
          {[
            { id: 'electrical', label: '⚡ Electrical' },
            { id: 'hostel-pg', label: '🛏️ Hostel & PG' },
            { id: 'shamiyana-events', label: '⛺ Shamiyana & Sounds' },
            { id: 'priest', label: '🕉️ Vedic Purohit' },
            { id: 'land-sale', label: '📐 Plots & Land' },
            { id: 'car-rentals', label: '🚗 Fleet & Cabs' },
            { id: 'photography', label: '📷 Photography' },
            { id: 'property-rent', label: '🏢 House Rentals' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id as PartnerCategory)}
                style={[
                  styles.verticalChip,
                  isSelected && styles.verticalChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.verticalChipText,
                    isSelected && styles.verticalChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Online / Offline Status Toggle Bar */}
      <View
        style={[
          styles.onlineStatusCard,
          isOnline ? styles.onlineCard : styles.offlineCard,
        ]}
      >
        <View style={styles.onlineInfo}>
          <View
            style={[
              styles.onlineDot,
              isOnline ? styles.onlineDotActive : styles.offlineDot,
            ]}
          />
          <View>
            <Text
              style={[
                styles.onlineTitle,
                isOnline ? styles.onlineTitleText : styles.offlineTitleText,
              ]}
            >
              {isOnline ? t.onlineStatus : t.offlineStatus}
            </Text>
            <Text style={styles.onlineDesc}>
              {isOnline
                ? `Visible to nearby customers searching for ${currentProfile.categoryLabel}`
                : 'You are currently not receiving new booking leads'}
            </Text>
          </View>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnline}
          trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
          thumbColor={isOnline ? Colors.primary : '#94A3B8'}
        />
      </View>

      {/* Daily Performance Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricKicker}>TODAY'S EARNINGS</Text>
          <Text style={styles.metricVal}>{currentProfile.todayPayout}</Text>
          <Text style={styles.metricSub}>{currentProfile.completedCount}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricKicker}>ACCEPTANCE</Text>
          <Text style={[styles.metricVal, { color: '#059669' }]}>98%</Text>
          <Text style={styles.metricSub}>Top 5% Partner</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricKicker}>RATING</Text>
          <Text style={[styles.metricVal, { color: '#D97706' }]}>★ 4.96</Text>
          <Text style={styles.metricSub}>Verified Reviews</Text>
        </View>
      </View>

      {/* Incoming Job Radar Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.radarKickerWrap}>
            <View style={styles.radarPing} />
            <Text style={styles.radarKicker}>
              LIVE {currentProfile.categoryLabel.toUpperCase()} RADAR
            </Text>
          </View>
          <Text style={styles.radarCount}>
            {activeJobs.length} active leads
          </Text>
        </View>

        {activeJobs.length === 0 ? (
          <View style={styles.emptyRadarCard}>
            <Text style={styles.emptyRadarTitle}>Radar is scanning...</Text>
            <Text style={styles.emptyRadarSub}>
              New customer requests for {currentProfile.categoryLabel} in your premises will appear here instantly.
            </Text>
          </View>
        ) : (
          activeJobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeaderRow}>
                <View style={styles.jobServiceCol}>
                  <Text style={styles.jobServiceName}>{job.serviceName}</Text>
                  <Text style={styles.jobCustomerName}>
                    Customer: {job.customerName} • 📍 {job.distanceKm} km away
                  </Text>
                </View>
                <View style={styles.jobPayoutBadge}>
                  <Text style={styles.jobPayoutText}>{job.payout}</Text>
                  <Text style={styles.jobPayoutModel}>{job.pricingModel}</Text>
                </View>
              </View>

              <View style={styles.jobDetailsRow}>
                <View style={styles.jobLocationWrap}>
                  <Icon name="location" size={14} color={Colors.primary} />
                  <Text numberOfLines={1} style={styles.jobLocationText}>
                    {job.locality}
                  </Text>
                </View>
                <Text style={styles.jobTimeText}>{job.time}</Text>
              </View>

              {job.note ? (
                <View style={styles.jobNoteBox}>
                  <Text style={styles.jobNoteText}>"{job.note}"</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.jobActionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleDecline(job.id)}
                  style={styles.declineBtn}
                >
                  <Text style={styles.declineBtnText}>Pass</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleAccept(job.id)}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>Accept Booking ✓</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Services & Rate Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {currentProfile.categoryLabel} Catalog & Rate Card
          </Text>
          <Pressable onPress={() => setIsAddServiceModalOpen(true)}>
            <Text style={styles.editCatalogText}>+ Add New Listing</Text>
          </Pressable>
        </View>

        <View style={styles.catalogCard}>
          {selectedCategory === 'electrical' && (
            <>
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>General Electrical Inspection & Troubleshooting</Text>
                  <Text style={styles.catalogCategory}>MCB Tripping, Wiring Leaks & Voltage Test</Text>
                </View>
                <Text style={styles.catalogPrice}>₹199 / Visit</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Ceiling Fan & Light Fixture Installation</Text>
                  <Text style={styles.catalogCategory}>Mounting & Safety Testing</Text>
                </View>
                <Text style={styles.catalogPrice}>₹249 / Unit</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Inverter & Battery Dual Wiring Setup</Text>
                  <Text style={styles.catalogCategory}>Backup Load Testing</Text>
                </View>
                <Text style={styles.catalogPrice}>₹899</Text>
              </View>
            </>
          )}

          {selectedCategory === 'priest' && (
            <>
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Sri Satyanarayana Swamy Vratham</Text>
                  <Text style={styles.catalogCategory}>Complete Katha & Kalasa Sthapana with Samagri</Text>
                </View>
                <Text style={styles.catalogPrice}>₹3,500</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Grihapravesham & Vastu Shanti Homam</Text>
                  <Text style={styles.catalogCategory}>New Home Blessing & Punyahavachanam</Text>
                </View>
                <Text style={styles.catalogPrice}>₹5,500</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Ganapathi & Lakshmi Kubera Homam</Text>
                  <Text style={styles.catalogCategory}>Obstacle Removal & Prosperity</Text>
                </View>
                <Text style={styles.catalogPrice}>₹4,000</Text>
              </View>
            </>
          )}

          {selectedCategory === 'land-sale' && (
            <>
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Free Plot Site Visit & Transport</Text>
                  <Text style={styles.catalogCategory}>Chauffeur AC Car Escort to Shankarpally & Mokila</Text>
                </View>
                <Text style={[styles.catalogPrice, { color: '#059669' }]}>FREE (₹0)</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>HMDA / DTCP 200 Sq. Yds Open Plot</Text>
                  <Text style={styles.catalogCategory}>East Facing • 40ft BT Roads • Clear Title</Text>
                </View>
                <Text style={styles.catalogPrice}>₹28,000 / Yd</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Legal Document & Link Search Scrutiny</Text>
                  <Text style={styles.catalogCategory}>Senior High Court Advocate Verification</Text>
                </View>
                <Text style={styles.catalogPrice}>₹2,499</Text>
              </View>
            </>
          )}

          {selectedCategory === 'car-rentals' && (
            <>
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Toyota Innova Crysta (7-Seater Luxury)</Text>
                  <Text style={styles.catalogCategory}>With Chauffeur • AC • Outstation & City</Text>
                </View>
                <Text style={styles.catalogPrice}>₹18 / km</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Maruti Ertiga Smart Hybrid (7-Seater)</Text>
                  <Text style={styles.catalogCategory}>Spacious Family Travel</Text>
                </View>
                <Text style={styles.catalogPrice}>₹14 / km</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Airport Transfer Fixed Fare (Sedan)</Text>
                  <Text style={styles.catalogCategory}>RGIA Drop • Toll Included</Text>
                </View>
                <Text style={styles.catalogPrice}>₹799 Fixed</Text>
              </View>
            </>
          )}

          {selectedCategory === 'photography' && (
            <>
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Wedding & Reception Candid Package</Text>
                  <Text style={styles.catalogCategory}>2 Photographers, 4K Teaser, Drone & 40-Page Album</Text>
                </View>
                <Text style={styles.catalogPrice}>₹35,000</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>Birthday & Half Saree Event Coverage</Text>
                  <Text style={styles.catalogCategory}>4 Hours • Digital edits within 48 hours</Text>
                </View>
                <Text style={styles.catalogPrice}>₹12,000</Text>
              </View>
            </>
          )}

          {selectedCategory === 'property-rent' && (
            <>
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>2 BHK Semi-Furnished Gated Society Flat</Text>
                  <Text style={styles.catalogCategory}>Madhapur & Gachibowli • Near Metro</Text>
                </View>
                <Text style={styles.catalogPrice}>₹28,000 / mo</Text>
              </View>
              <View style={styles.catalogDivider} />
              <View style={styles.catalogItem}>
                <View>
                  <Text style={styles.catalogTitle}>3 BHK Luxury High-Rise Apartment</Text>
                  <Text style={styles.catalogCategory}>100% Power Backup, Gym, Pool & 2 Car Parks</Text>
                </View>
                <Text style={styles.catalogPrice}>₹48,000 / mo</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Dynamic Category Listing Modal */}
      <Modal
        visible={isAddServiceModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsAddServiceModalOpen(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsAddServiceModalOpen(false)} style={styles.modalBackBtn}>
              <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
            </Pressable>
            <View>
              <Text style={styles.modalTitle}>List New {currentProfile.categoryLabel}</Text>
              <Text style={styles.modalSub}>Tailored specifications for your vertical</Text>
            </View>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            {/* Category Banner */}
            <View style={styles.modalBanner}>
              <Text style={styles.modalBannerEmoji}>{currentProfile.avatarEmoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalBannerTitle}>{currentProfile.businessName}</Text>
                <Text style={styles.modalBannerSub}>
                  Fields are dynamically adjusted for {currentProfile.categoryLabel}
                </Text>
              </View>
            </View>

            {/* DOMAIN SPECIFIC FORM FIELDS */}
            {selectedCategory === 'land-sale' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>SURVEY NUMBER / LOCATION</Text>
                <TextInput
                  value={surveyNo}
                  onChangeText={setSurveyNo}
                  style={styles.modalInput}
                  placeholder="e.g. Sy No. 142/P & 143, Shankarpally"
                />

                <Text style={styles.inputLabel}>LAYOUT APPROVAL AUTHORITY</Text>
                <View style={styles.chipsRow}>
                  {['HMDA Approved', 'DTCP Approved', 'RERA Registered', 'Panchayat Layout'].map((auth) => (
                    <Pressable
                      key={auth}
                      onPress={() => setApprovalAuth(auth)}
                      style={[styles.formChip, approvalAuth === auth && styles.formChipActive]}
                    >
                      <Text style={[styles.formChipText, approvalAuth === auth && styles.formChipTextActive]}>
                        {auth}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>PLOT SIZE (SQ. YARDS)</Text>
                <TextInput
                  value={plotSize}
                  onChangeText={setPlotSize}
                  style={styles.modalInput}
                  placeholder="e.g. 200 Sq. Yds"
                />

                <Text style={styles.inputLabel}>PREFERRED FACING</Text>
                <View style={styles.chipsRow}>
                  {['East Facing', 'North Facing', 'West Facing', 'North-East Corner'].map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => setPlotFacing(f)}
                      style={[styles.formChip, plotFacing === f && styles.formChipActive]}
                    >
                      <Text style={[styles.formChipText, plotFacing === f && styles.formChipTextActive]}>
                        {f}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>PRICE PER SQ. YARD (₹)</Text>
                <TextInput
                  value={plotPriceYd}
                  onChangeText={setPlotPriceYd}
                  style={styles.modalInput}
                  placeholder="e.g. ₹28,000 / Sq. Yd"
                />

                <Text style={styles.inputLabel}>ROAD WIDTH (FEET)</Text>
                <TextInput
                  value={plotRoadWidth}
                  onChangeText={setPlotRoadWidth}
                  style={styles.modalInput}
                  placeholder="e.g. 40ft & 60ft BT Road"
                />
              </View>
            )}

            {selectedCategory === 'priest' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>VEDIC TRADITION / SAMPRADAYAM</Text>
                <View style={styles.chipsRow}>
                  {['Telugu Smartha (ఋగ్వేదం)', 'Vaidika Tradition', 'Vaishnava Tradition', 'Madhwa Tradition'].map((trad) => (
                    <Pressable
                      key={trad}
                      onPress={() => setVedicTradition(trad)}
                      style={[styles.formChip, vedicTradition === trad && styles.formChipActive]}
                    >
                      <Text style={[styles.formChipText, vedicTradition === trad && styles.formChipTextActive]}>
                        {trad}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>RITUAL / VRATHAM OFFERING</Text>
                <TextInput
                  value={ritualName}
                  onChangeText={setRitualName}
                  style={styles.modalInput}
                  placeholder="e.g. Sri Satyanarayana Swamy Vratham"
                />

                <Text style={styles.inputLabel}>POOJA SAMAGRI INCLUDED?</Text>
                <View style={styles.chipsRow}>
                  {[
                    { label: 'Yes, Purohit brings complete kit', val: true },
                    { label: 'No, list provided to customer', val: false },
                  ].map((s) => (
                    <Pressable
                      key={s.label}
                      onPress={() => setSamagriIncluded(s.val)}
                      style={[styles.formChip, samagriIncluded === s.val && styles.formChipActive]}
                    >
                      <Text style={[styles.formChipText, samagriIncluded === s.val && styles.formChipTextActive]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>DAKSHINA ESTIMATE (₹)</Text>
                <TextInput
                  value={dakshinaFee}
                  onChangeText={setDakshinaFee}
                  style={styles.modalInput}
                  placeholder="e.g. ₹3,500"
                />
              </View>
            )}

            {selectedCategory === 'car-rentals' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>VEHICLE MODEL & MAKE</Text>
                <TextInput
                  value={vehicleModel}
                  onChangeText={setVehicleModel}
                  style={styles.modalInput}
                  placeholder="e.g. Toyota Innova Crysta (7-Seater)"
                />

                <Text style={styles.inputLabel}>COMMERCIAL REGISTRATION NO.</Text>
                <TextInput
                  value={regNumber}
                  onChangeText={setRegNumber}
                  style={styles.modalInput}
                  placeholder="e.g. TS 09 UB 4821"
                />

                <Text style={styles.inputLabel}>PER-KM RATE (₹ / KM)</Text>
                <TextInput
                  value={perKmRate}
                  onChangeText={setPerKmRate}
                  style={styles.modalInput}
                  placeholder="e.g. ₹18 / km"
                />

                <Text style={styles.inputLabel}>DRIVER DAILY ALLOWANCE (₹)</Text>
                <TextInput
                  value={chauffeurBeta}
                  onChangeText={setChauffeurBeta}
                  style={styles.modalInput}
                  placeholder="e.g. ₹400 / day"
                />
              </View>
            )}

            {selectedCategory === 'photography' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>PRIMARY CAMERA GEAR</Text>
                <TextInput
                  value={cameraBody}
                  onChangeText={setCameraBody}
                  style={styles.modalInput}
                  placeholder="e.g. Sony Alpha A7 IV (Dual Slot)"
                />

                <Text style={styles.inputLabel}>DRONE & CINEMATOGRAPHY EQUIPMENT</Text>
                <TextInput
                  value={droneModel}
                  onChangeText={setDroneModel}
                  style={styles.modalInput}
                  placeholder="e.g. DJI Mavic 3 Cine 4K Drone"
                />

                <Text style={styles.inputLabel}>PHOTOBOOK / ALBUM SPEC</Text>
                <TextInput
                  value={albumSheets}
                  onChangeText={setAlbumSheets}
                  style={styles.modalInput}
                  placeholder="e.g. 40-Sheet High-Gloss Karizma"
                />

                <Text style={styles.inputLabel}>DAILY PACKAGE RATE (₹)</Text>
                <TextInput
                  value={dailyRate}
                  onChangeText={setDailyRate}
                  style={styles.modalInput}
                  placeholder="e.g. ₹25,000 / Day"
                />
              </View>
            )}

            {selectedCategory === 'property-rent' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>BHK CONFIGURATION</Text>
                <TextInput
                  value={bhkConfig}
                  onChangeText={setBhkConfig}
                  style={styles.modalInput}
                  placeholder="e.g. 2 BHK Semi-Furnished Flat"
                />

                <Text style={styles.inputLabel}>MONTHLY RENT (₹ / MO)</Text>
                <TextInput
                  value={monthlyRent}
                  onChangeText={setMonthlyRent}
                  style={styles.modalInput}
                  placeholder="e.g. ₹28,000 / mo"
                />

                <Text style={styles.inputLabel}>SECURITY DEPOSIT</Text>
                <TextInput
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  style={styles.modalInput}
                  placeholder="e.g. 2 Months Advance"
                />

                <Text style={styles.inputLabel}>FURNISHING STATUS</Text>
                <TextInput
                  value={furnishing}
                  onChangeText={setFurnishing}
                  style={styles.modalInput}
                  placeholder="e.g. Semi-Furnished (Modular Kitchen, Wardrobes)"
                />
              </View>
            )}

            {selectedCategory === 'electrical' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>TRADE / WIREMAN LICENSE NUMBER</Text>
                <TextInput
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  style={styles.modalInput}
                  placeholder="e.g. TS-TEL-LIC-48192"
                />

                <Text style={styles.inputLabel}>SERVICE / REPAIR TITLE</Text>
                <TextInput
                  value={serviceTitle}
                  onChangeText={setServiceTitle}
                  style={styles.modalInput}
                  placeholder="e.g. Inverter & Dual Battery Setup"
                />

                <Text style={styles.inputLabel}>VISITING INSPECTION CHARGE (₹)</Text>
                <TextInput
                  value={visitingFee}
                  onChangeText={setVisitingFee}
                  style={styles.modalInput}
                  placeholder="e.g. ₹199 Visit"
                />

                <Text style={styles.inputLabel}>RE-WORK WARRANTY GUARANTEE</Text>
                <TextInput
                  value={warrantyDays}
                  onChangeText={setWarrantyDays}
                  style={styles.modalInput}
                  placeholder="e.g. 30 Days Free Re-work"
                />
              </View>
            )}

            <Button
              label={`Publish ${currentProfile.categoryLabel} to Marketplace ✓`}
              size="lg"
              style={{ marginTop: 20, marginBottom: 30 }}
              onPress={handlePublishService}
            />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  kycBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  kycText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  partnerType: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  switchModePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  switchModeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  verticalSelectorWrap: {
    marginBottom: 12,
  },
  verticalKicker: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  verticalScroll: {
    gap: 6,
  },
  verticalChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  verticalChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  verticalChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  verticalChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  onlineStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    marginBottom: 14,
  },
  onlineCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  offlineCard: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  onlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  onlineDotActive: {
    backgroundColor: '#10B981',
  },
  offlineDot: {
    backgroundColor: '#94A3B8',
  },
  onlineTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  onlineTitleText: {
    color: '#065F46',
  },
  offlineTitleText: {
    color: '#475569',
  },
  onlineDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
    ...Shadows.sm,
  },
  metricKicker: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  radarKickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarPing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  radarKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.8,
  },
  radarCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  emptyRadarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
  },
  emptyRadarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  emptyRadarSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    ...Shadows.sm,
  },
  jobHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobServiceCol: {
    flex: 1,
    marginRight: 8,
  },
  jobServiceName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobCustomerName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  jobPayoutBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignItems: 'flex-end',
  },
  jobPayoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  jobPayoutModel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
  },
  jobDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobLocationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  jobLocationText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  jobTimeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  jobNoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.sm,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: 10,
  },
  jobNoteText: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic',
  },
  jobActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  declineBtn: {
    flex: 0.35,
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  acceptBtn: {
    flex: 0.65,
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  editCatalogText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  catalogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    ...Shadows.sm,
  },
  catalogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  catalogTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  catalogCategory: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  catalogPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  catalogDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  modalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 16,
  },
  modalBannerEmoji: {
    fontSize: 28,
  },
  modalBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBannerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  formChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  formChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  formChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  liveListingBanner: {
    height: 110,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
    backgroundColor: '#0F172A',
    ...Shadows.sm,
  },
  liveListingImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveListingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 10,
    justifyContent: 'flex-end',
  },
  liveListingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: 4,
  },
  liveListingBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveListingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  liveListingSub: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
});
