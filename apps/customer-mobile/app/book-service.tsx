import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/common/Button';
import { Icon } from '../src/components/common/Icon';
import { useMarketplace } from '../src/context/MarketplaceContext';
import { MOCK_PROVIDERS } from '../src/data/mockMarketplace';
import { Colors, Radius, Shadows, Typography } from '../src/theme/tokens';

export default function BookServiceSteppedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    providerId?: string;
    businessName?: string;
    categorySlug?: string;
    serviceName?: string;
    price?: string;
    pricingModel?: string;
  }>();

  const { providers } = useMarketplace();
  const matchedProvider =
    providers.find((p) => p.id === params.providerId) ||
    MOCK_PROVIDERS.find((p) => p.id === params.providerId);
  const categorySlug = params.categorySlug || matchedProvider?.categorySlug || 'electrical';

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedPrimaryTag, setSelectedPrimaryTag] = useState<string | null>(null);
  const [selectedSecondaryTag, setSelectedSecondaryTag] = useState<string | null>(null);
  const [selectedTertiaryTag, setSelectedTertiaryTag] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Today, 30 Oct');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const serviceName = params.serviceName || matchedProvider?.services[0]?.name || 'Standard Service';
  const businessName = params.businessName || matchedProvider?.businessName || 'Verified Partner';

  // Category Configuration
  const categoryConfig = useMemo(() => {
    switch (categorySlug) {
      case 'hostel-pg':
        return {
          heading: 'Hostel & PG Room Booking / Visit',
          desc: 'Select sharing room type, food preference, and scheduled date to visit or reserve.',
          primaryQuestionTitle: 'ROOM SHARING PREFERENCE',
          primaryTags: [
            'Single Private Room (AC)',
            '2-Sharing Executive (Attached Washroom)',
            '3-Sharing Standard (Budget)',
            '4-Sharing Economy',
          ],
          secondaryQuestionTitle: 'FOOD & MEAL FACILITY',
          secondaryTags: [
            '3 Times Unlimited South & North Indian Food Included',
            'Without Food (Room Only)',
            'Pure Veg Meals Only',
          ],
          tertiaryQuestionTitle: 'MOVE-IN DATE',
          tertiaryTags: [
            'Immediate / Today',
            'Within 3 Days',
            '1st of Next Month',
            'Just Room Visit First',
          ],
          placeholder: 'Add details (e.g. Need vehicle parking, working night shifts, student discount)...',
          defaultSelectedTag: '2-Sharing Executive (Attached Washroom)',
          timeSlots: [
            '09:00 AM - 11:00 AM (Morning Visit)',
            '12:00 PM - 02:00 PM (Lunch Inspection)',
            '05:00 PM - 07:00 PM (Evening Visit)',
            '07:30 PM - 09:00 PM (After Office)',
          ],
          addressPrompt: 'Your Current City / Native Location',
          confirmTitle: 'Hostel Visit Confirmed! ✓',
          confirmSub: `Warden and management at ${businessName} have been notified. Room keys and live inspection are reserved.`,
          guaranteeText: 'Zero Commission Guarantee: Direct hostel management contact, zero brokerage, full deposit refund policy.',
          priceNote: 'Direct Warden Booking • Zero Brokerage',
          isFree: true,
          defaultPrice: 0,
        };
      case 'shamiyana-events':
        return {
          heading: 'Shamiyana, Sound & Event Setup',
          desc: 'Select tent structure, sound system power, and guest capacity for your celebration.',
          primaryQuestionTitle: 'TENT & STAGE SETUP',
          primaryTags: [
            'Waterproof German Hangar Structure',
            'Traditional Shamiyana & Waterproof Tarpaulin',
            'Pagoda Canopy & Decorative VIP Tent',
            'Grand Stage & Truss Lighting Backdrop',
          ],
          secondaryQuestionTitle: 'SOUND & DJ SYSTEM',
          secondaryTags: [
            'JBL Dual Line Array + 4 Wireless UHF Mics',
            'Standard PA System (Announcements / Pooja)',
            'High-Wattage DJ Bass Cabinets & Lighting',
            'Sound with 25 kVA Silent Generator Backup',
          ],
          tertiaryQuestionTitle: 'GUEST CAPACITY & CHAIRS',
          tertiaryTags: [
            '100 - 250 Guests (150 Chairs + 5 Tables)',
            '300 - 600 Guests (400 Chairs + 15 Tables)',
            '1000+ Guests (Grand Reception Package)',
          ],
          placeholder: 'Event date, open ground vs road setup, specific lighting or flower decoration needs...',
          defaultSelectedTag: 'Traditional Shamiyana & Waterproof Tarpaulin',
          timeSlots: [
            '06:00 AM - 09:00 AM (Early Setup)',
            '09:00 AM - 12:00 PM (Day Event)',
            '03:00 PM - 06:00 PM (Evening Reception)',
            'Previous Evening Setup (Advance)',
          ],
          addressPrompt: 'Function Ground / Venue Address',
          confirmTitle: 'Event Setup Reserved! ✓',
          confirmSub: `Event coordinator from ${businessName} has reserved your sound & tent equipment inventory.`,
          guaranteeText: 'Uninterrupted Event Guarantee: Heavy-duty sound equipment with dedicated technician and optional silent generator backup.',
          priceNote: 'Advance Date Token with Escrow Protection',
          isFree: false,
          defaultPrice: 8000,
        };
      case 'land-sale':
        return {
          heading: 'Plot Inquiry & Free Site Visit',
          desc: 'Select plot specifications and your transport arrangement for the physical site inspection.',
          primaryQuestionTitle: 'PLOT SIZE & DIMENSIONS',
          primaryTags: ['167 Sq. Yds', '200 Sq. Yds', '267 Sq. Yds', '350 Sq. Yds', '500+ Sq. Yds Corner'],
          secondaryQuestionTitle: 'PREFERRED FACING & VASTU',
          secondaryTags: ['East Facing (100% Vastu)', 'North Facing', 'West Facing', 'North-East Corner'],
          tertiaryQuestionTitle: 'COMPLIMENTARY TRANSPORT',
          tertiaryTags: ['Free AC Car Pickup from Home', 'I will drive directly to site', 'Virtual Video Walkthrough'],
          placeholder: 'Add details (e.g. Budget range, DTCP/HMDA verification, near 40ft road)...',
          defaultSelectedTag: '200 Sq. Yds',
          timeSlots: [
            '08:30 AM - 10:30 AM (Morning Batch)',
            '10:30 AM - 12:30 PM (Midday Batch)',
            '02:30 PM - 04:30 PM (Afternoon Batch)',
            '04:30 PM - 06:30 PM (Sunset Batch)',
          ],
          addressPrompt: 'Where should our Chauffeur pick you up?',
          confirmTitle: 'Site Visit Scheduled! ✓',
          confirmSub: `Your complimentary site visit with AC car escort has been scheduled with ${businessName}. Relationship manager will call you for confirmation.`,
          guaranteeText: 'Zero Pressure Guarantee: Physical site visit with chauffeur escort is 100% complimentary. Verify all DTCP/HMDA records at your own pace.',
          priceNote: '100% Free Site Visit & Transport',
          isFree: true,
          defaultPrice: 0,
        };
      case 'priest':
        return {
          heading: 'Pooja & Muhurtham Requirements',
          desc: 'Select the sacred ritual, auspicious muhurtham timing, and pooja samagri kit preference.',
          primaryQuestionTitle: 'SELECT POOJA / RITUAL',
          primaryTags: [
            'Sri Satyanarayana Swamy Vratham',
            'Grihapravesham & Vastu Homam',
            'Ganapathi & Navagraha Homam',
            'Vivaham (Vedic Wedding)',
            'Namakaranam Ceremony',
            'Office / Shop Opening',
          ],
          secondaryQuestionTitle: 'POOJA SAMAGRI INCLUSION',
          secondaryTags: [
            'Purohit brings complete Samagri Kit (+₹1,500)',
            'Family will arrange Samagri from list',
          ],
          tertiaryQuestionTitle: 'VEDIC TRADITION',
          tertiaryTags: [
            'Telugu Smartha (ఋగ్వేదం / యజుర్వేదం)',
            'Vaishnava Tradition',
            'Madhwa Tradition',
            'Hindi / North Indian',
          ],
          placeholder: 'Enter Family Gotram, Kartalu names, Nakshatram, and pooja location details...',
          defaultSelectedTag: 'Sri Satyanarayana Swamy Vratham',
          timeSlots: [
            '05:30 AM - 07:00 AM (Brahma Muhurtham)',
            '08:30 AM - 10:30 AM (Subha Lagna)',
            '11:00 AM - 01:00 PM (Abhijit Slot)',
            '05:00 PM - 07:00 PM (Pradosha Kalam)',
          ],
          addressPrompt: 'Pooja Venue Address (Home, New Flat, or Temple)',
          confirmTitle: 'Pooja Slot Reserved! ✓',
          confirmSub: `Brahmasri Venkata Sharma has been notified. Auspicious muhurtham slot is reserved for your family.`,
          guaranteeText: 'PhonePe-style trust: No upfront payment taken. You offer Dakshina directly to the Purohit after ritual blessings.',
          priceNote: 'Direct Dakshina to Purohit after ritual',
          isFree: false,
          defaultPrice: 3500,
        };
      case 'car-rentals':
        return {
          heading: 'Trip & Vehicle Booking',
          desc: 'Select your journey mode, vehicle model, and passenger count.',
          primaryQuestionTitle: 'JOURNEY TRIP MODE',
          primaryTags: [
            'Outstation Round-Trip',
            'Outstation One-Way Drop',
            'Airport Transfer (RGIA)',
            'City Package (8hr / 80km)',
          ],
          secondaryQuestionTitle: 'FLEET VEHICLE',
          secondaryTags: [
            'Toyota Innova Crysta (7-Seater Luxury)',
            'Maruti Ertiga (7-Seater)',
            'Maruti Dzire AC Sedan',
            'Tempo Traveller (12-Seater)',
          ],
          tertiaryQuestionTitle: 'PASSENGERS & LUGGAGE',
          tertiaryTags: ['1-3 Passengers', '4-6 Passengers (Family)', '7+ Passenger Group'],
          placeholder: 'Destination city, intermediate stops, flight timing, or pickup landmark...',
          defaultSelectedTag: 'Outstation Round-Trip',
          timeSlots: [
            '04:00 AM - 05:00 AM (Early Departure)',
            '06:00 AM - 07:00 AM',
            '09:00 AM - 10:00 AM',
            '02:00 PM - 03:00 PM',
            '08:00 PM - 09:00 PM',
          ],
          addressPrompt: 'Pickup Address & Departure Point',
          confirmTitle: 'Chauffeur Ride Confirmed! ✓',
          confirmSub: `Your vehicle has been scheduled with ${businessName}. Chauffeur details and vehicle number will be sent 2 hours before pickup.`,
          guaranteeText: 'Transparent Billing: Pay driver directly upon trip completion. Tolls, parking and state entry permits billed strictly at actual FASTag receipt.',
          priceNote: 'Metered / Fixed Package with Verified Chauffeur',
          isFree: false,
          defaultPrice: 2800,
        };
      case 'photography':
        return {
          heading: 'Photography & Cinematic Video',
          desc: 'Tell us about your event scale, shoot duration, and deliverables.',
          primaryQuestionTitle: 'EVENT OCCASION',
          primaryTags: [
            'Wedding & Reception Candid',
            'Pre-Wedding / Outdoor Shoot',
            'Birthday / Half Saree Ceremony',
            'Housewarming / Gruhapravesam',
            'Corporate Event Coverage',
          ],
          secondaryQuestionTitle: 'DELIVERABLE PACKAGE',
          secondaryTags: [
            'Candid Photos + 4K Cinematic Teaser',
            'Traditional HD Video + Photos',
            'Drone Shoot + 40-Page Album',
            'Complete 2-Day Luxury Package',
          ],
          tertiaryQuestionTitle: 'ALBUM PREFERENCE',
          tertiaryTags: ['40-Sheet Karizma Photobook', 'Digital Cloud Gallery Only', 'Raw Files on Hard Drive'],
          placeholder: 'Event timeline, venue details, preferred themes or shoot aesthetic...',
          defaultSelectedTag: 'Wedding & Reception Candid',
          timeSlots: [
            '06:00 AM - 12:00 PM (Morning Shift)',
            '03:00 PM - 09:00 PM (Evening Shift)',
            'Full Day (Morning till Night)',
            'Multi-Day Coverage',
          ],
          addressPrompt: 'Event Venue / Function Hall Address',
          confirmTitle: 'Event Date Reserved! ✓',
          confirmSub: `PixelKraft Studios has blocked your date. Lead photographer will call you for shot list and venue walkthrough.`,
          guaranteeText: 'Milestone Protection: 4K cinematic teaser delivered within 7 days, complete album within 14 days.',
          priceNote: 'Event Package Token with Escrow Protection',
          isFree: false,
          defaultPrice: 15000,
        };
      case 'property-rent':
        return {
          heading: 'Rental Flat Inquiry & House Visit',
          desc: 'Share your configuration requirement and move-in timeline.',
          primaryQuestionTitle: 'CONFIGURATION',
          primaryTags: ['1 BHK Studio Flat', '2 BHK Semi-Furnished', '3 BHK Luxury Gated Society', 'Independent Villa'],
          secondaryQuestionTitle: 'TENANT PROFILE',
          secondaryTags: ['Family', 'Working IT Professionals', 'Bachelor / Shared', 'Company Lease'],
          tertiaryQuestionTitle: 'MOVE-IN TIMELINE',
          tertiaryTags: ['Immediate / Within 7 Days', 'Next 15 Days', 'Next Month'],
          placeholder: 'Preferred floor, car parking count, pet details, or budget range...',
          defaultSelectedTag: '2 BHK Semi-Furnished',
          timeSlots: [
            '09:00 AM - 11:00 AM',
            '11:00 AM - 01:00 PM',
            '03:00 PM - 05:00 PM',
            '05:00 PM - 07:00 PM',
          ],
          addressPrompt: 'Current Residence Address',
          confirmTitle: 'House Visit Scheduled! ✓',
          confirmSub: `Your physical walkthrough has been scheduled with ${businessName}. Direct owner contact unlocked.`,
          guaranteeText: 'Zero Brokerage Guarantee: Direct owner contact and verified property inspection.',
          priceNote: 'Zero Brokerage / Free Flat Visit',
          isFree: true,
          defaultPrice: 0,
        };
      case 'ac-service':
        return {
          heading: 'AC Service & Troubleshooting',
          desc: 'Select quick tags or describe the AC issue to help technician bring proper diagnostic gear.',
          primaryQuestionTitle: 'AC ISSUE TYPE',
          primaryTags: [
            'Deep Jet Pump Foam Wash',
            'AC Not Cooling / Weak Air',
            'Water Dripping from Split AC',
            'Gas Leak & R32/R410A Refill',
            'Noise from Compressor / Fan',
          ],
          secondaryQuestionTitle: 'AC UNIT TYPE',
          secondaryTags: ['Split AC (1.5 Ton)', 'Split AC (1 Ton)', 'Split AC (2 Ton)', 'Window AC'],
          tertiaryQuestionTitle: 'SERVICE URGENCY',
          tertiaryTags: ['Standard Today Slot', 'Urgent / Same-Day', 'Weekend Appointment'],
          placeholder: 'Add details (e.g. Master bedroom split AC is blowing warm air and leaking water)...',
          defaultSelectedTag: 'Deep Jet Pump Foam Wash',
          timeSlots: [
            '09:00 AM - 10:00 AM',
            '11:30 AM - 12:30 PM',
            '02:00 PM - 03:00 PM',
            '04:30 PM - 05:30 PM',
            '06:00 PM - 07:00 PM',
          ],
          addressPrompt: 'Where should the technician arrive?',
          confirmTitle: 'AC Technician Assigned! ✓',
          confirmSub: `Your request has been sent to ${businessName}. Certified HVAC engineer will arrive with jet pump.`,
          guaranteeText: 'PhonePe-style trust: 60-day warranty on gas charging and leak repairs. Pay after completion.',
          priceNote: 'Pay after service with 60-Day Guarantee',
          isFree: false,
          defaultPrice: 499,
        };
      case 'plumbing':
        return {
          heading: 'Plumbing & Sanitary Service',
          desc: 'Select plumbing issues to ensure plumber brings appropriate tools and fittings.',
          primaryQuestionTitle: 'PLUMBING ISSUE',
          primaryTags: [
            'Concealed Pipe Leakage',
            'Blocked Drain / Toilet',
            'Tap / Diverter Replacement',
            'Water Tank Overflow',
            'Geyser Inlet / Outlet Fix',
          ],
          secondaryQuestionTitle: 'AREA OF ISSUE',
          secondaryTags: ['Bathroom / Toilet', 'Kitchen Sink', 'Main Water Pipeline', 'Overhead Tank'],
          tertiaryQuestionTitle: 'SPARE PARTS',
          tertiaryTags: ['Plumber should bring parts', 'I will provide spare parts'],
          placeholder: 'Add notes (e.g. Wall tile shows water seepage near shower diverter)...',
          defaultSelectedTag: 'Water Leakage & Pipe Block',
          timeSlots: [
            '09:00 AM - 10:00 AM',
            '11:30 AM - 12:30 PM',
            '02:00 PM - 03:00 PM',
            '04:30 PM - 05:30 PM',
            '06:00 PM - 07:00 PM',
          ],
          addressPrompt: 'Where should the plumber arrive?',
          confirmTitle: 'Plumber Assigned! ✓',
          confirmSub: `Your request has been sent to ${businessName}. Certified plumber will arrive with diagnostic snake.`,
          guaranteeText: '30-Day Re-work Guarantee. Genuine Jaquar/Astral spares with GST bill.',
          priceNote: 'Pay after repair inspection',
          isFree: false,
          defaultPrice: 199,
        };
      default:
        return {
          heading: 'What issue are you facing?',
          desc: 'Select quick tags or describe the problem to help the technician bring appropriate tools.',
          primaryQuestionTitle: 'COMMON ELECTRICAL FAULTS',
          primaryTags: [
            'Tripping MCB / Power Cut',
            'Burning Smell from Switch',
            'Ceiling Fan Installation',
            'Inverter Wiring Setup',
            'Wiring Sparks / Short Circuit',
          ],
          secondaryQuestionTitle: 'PREMISES TYPE',
          secondaryTags: ['Residential Apartment', 'Independent House', 'Commercial Shop', 'Office'],
          tertiaryQuestionTitle: 'URGENCY',
          tertiaryTags: ['Emergency Fix Needed', 'Standard Slot Today', 'Scheduled for Weekend'],
          placeholder: 'Add optional notes (e.g. Master bedroom switchboard is sparking on AC load)...',
          defaultSelectedTag: 'Tripping MCB / Power Cut',
          timeSlots: [
            '09:00 AM - 10:00 AM',
            '11:30 AM - 12:30 PM',
            '02:00 PM - 03:00 PM',
            '04:30 PM - 05:30 PM',
            '06:00 PM - 07:00 PM',
          ],
          addressPrompt: 'Where should the technician arrive?',
          confirmTitle: 'Technician Booking Placed! ✓',
          confirmSub: `Your request has been sent to ${businessName}. Govt licensed technician assignment is in progress.`,
          guaranteeText: 'PhonePe-style trust: No upfront payment taken. You pay only after inspecting the completed job.',
          priceNote: 'Pay after service inspection',
          isFree: false,
          defaultPrice: 199,
        };
    }
  }, [categorySlug, businessName]);

  // Set default slot if unset
  const timeSlots = categoryConfig.timeSlots;
  const currentSlot = selectedSlot || timeSlots[0];

  const basePrice = categoryConfig.isFree
    ? 0
    : Number(params.price !== undefined ? params.price : categoryConfig.defaultPrice);
  const platformSafetyFee = categoryConfig.isFree || categorySlug === 'priest' || categorySlug === 'car-rentals' || categorySlug === 'photography' ? 0 : 29;
  const totalPrice = basePrice + platformSafetyFee;

  const dates = [
    { label: 'Today', day: '30 Oct' },
    { label: 'Tomorrow', day: '31 Oct' },
    { label: 'Saturday', day: '1 Nov' },
    { label: 'Sunday', day: '2 Nov' },
  ];

  const addresses = [
    {
      id: 'addr-1',
      label: 'Home',
      line1: 'Flat 402, Sai Residency',
      locality: 'Madhapur, Hyderabad - 500081',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Office / Alternate',
      line1: 'Plot 18, Phase 2, Hitec City',
      locality: 'Hyderabad - 500081',
      isDefault: false,
    },
  ];

  const handleConfirmBooking = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBookingConfirmed(true);
      setStep(5);
    }, 700);
  };

  // Step 5: Success & Confirmation Screen
  if (bookingConfirmed) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
        <View style={styles.successWrapper}>
          <View style={styles.successIconBox}>
            <Text style={styles.successCheck}>✓</Text>
          </View>

          <Text style={styles.successTitle}>{categoryConfig.confirmTitle}</Text>
          <Text style={styles.successSub}>{categoryConfig.confirmSub}</Text>

          {/* Receipt / Summary Card */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>BOOKING ID</Text>
              <Text style={styles.receiptVal}>#BK-9021</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>SERVICE / REQUIREMENT</Text>
              <Text style={styles.receiptVal} numberOfLines={1}>
                {selectedPrimaryTag || serviceName}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>SCHEDULED TIME</Text>
              <Text style={styles.receiptVal}>
                {selectedDate}, {currentSlot}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>TOTAL ESTIMATE</Text>
              <Text style={[styles.receiptVal, { color: Colors.primary }]}>
                {categoryConfig.isFree ? 'FREE (₹0)' : `₹${totalPrice}`}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>PAYMENT METHOD</Text>
              <Text style={styles.receiptVal}>
                {categoryConfig.isFree ? '100% Free Consultation' : 'Pay After Work (Cash / UPI)'}
              </Text>
            </View>
          </View>

          {/* Trust Guarantee Note */}
          <View style={styles.safetyCard}>
            <Icon name="shield-check" size={16} color={Colors.primary} />
            <Text style={styles.safetyText}>{categoryConfig.guaranteeText}</Text>
          </View>

          <Button
            label="Track Live Booking"
            size="lg"
            style={{ width: '100%', marginBottom: 10 }}
            onPress={() => router.replace('/(tabs)/bookings')}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)')}
            style={styles.backHomeBtn}
          >
            <Text style={styles.backHomeText}>Return to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header with Step Tracker */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
        <View style={styles.headerRow}>
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
          <View>
            <Text style={styles.headerTitle}>{categoryConfig.heading}</Text>
            <Text style={styles.headerSub}>Step {step} of 4</Text>
          </View>
        </View>

        {/* 4 Step Progress Bar */}
        <View style={styles.stepperBar}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.stepSegment,
                step >= s && styles.stepSegmentDone,
                step === s && styles.stepSegmentCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Service Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryService}>{serviceName}</Text>
            <Text style={styles.summaryBusiness}>{businessName}</Text>
          </View>
          <Text style={styles.summaryPrice}>
            {categoryConfig.isFree ? 'FREE' : `₹${basePrice}`}
          </Text>
        </View>

        {/* STEP 1: Tailored Category Questions */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>{categoryConfig.heading}</Text>
            <Text style={styles.stepDesc}>{categoryConfig.desc}</Text>

            {/* Question 1 */}
            <Text style={styles.subHeading}>{categoryConfig.primaryQuestionTitle}</Text>
            <View style={styles.problemTagsRow}>
              {categoryConfig.primaryTags.map((tag) => {
                const isSelected = (selectedPrimaryTag || categoryConfig.defaultSelectedTag) === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedPrimaryTag(tag)}
                    style={[
                      styles.tagPill,
                      isSelected && styles.tagPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagPillText,
                        isSelected && styles.tagPillTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Question 2 */}
            <Text style={styles.subHeading}>{categoryConfig.secondaryQuestionTitle}</Text>
            <View style={styles.problemTagsRow}>
              {categoryConfig.secondaryTags.map((tag) => {
                const isSelected = (selectedSecondaryTag || categoryConfig.secondaryTags[0]) === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedSecondaryTag(tag)}
                    style={[
                      styles.tagPill,
                      isSelected && styles.tagPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagPillText,
                        isSelected && styles.tagPillTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Question 3 */}
            <Text style={styles.subHeading}>{categoryConfig.tertiaryQuestionTitle}</Text>
            <View style={styles.problemTagsRow}>
              {categoryConfig.tertiaryTags.map((tag) => {
                const isSelected = (selectedTertiaryTag || categoryConfig.tertiaryTags[0]) === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedTertiaryTag(tag)}
                    style={[
                      styles.tagPill,
                      isSelected && styles.tagPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagPillText,
                        isSelected && styles.tagPillTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Additional Custom Notes */}
            <Text style={styles.subHeading}>SPECIAL INSTRUCTIONS / NOTES</Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={problemDescription}
              onChangeText={setProblemDescription}
              placeholder={categoryConfig.placeholder}
              placeholderTextColor={Colors.textTertiary}
              style={styles.textArea}
            />
          </View>
        )}

        {/* STEP 2: Choose Schedule Date & Time */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>When should we schedule?</Text>
            <Text style={styles.stepDesc}>
              Select your preferred appointment date and time slot.
            </Text>

            <Text style={styles.subHeading}>SELECT DATE</Text>
            <View style={styles.dateRow}>
              {dates.map((d) => {
                const isSelected = selectedDate.includes(d.day);
                return (
                  <Pressable
                    key={d.day}
                    onPress={() => setSelectedDate(`${d.label}, ${d.day}`)}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateLabel,
                        isSelected && styles.dateLabelActive,
                      ]}
                    >
                      {d.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateDay,
                        isSelected && styles.dateDayActive,
                      ]}
                    >
                      {d.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.subHeading}>AVAILABLE TIME SLOTS</Text>
            <View style={styles.slotsContainer}>
              {timeSlots.map((slot) => {
                const isSelected = currentSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotPill,
                      isSelected && styles.slotPillActive,
                    ]}
                  >
                    <Icon
                      name="clock"
                      size={13}
                      color={isSelected ? Colors.primary : Colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.slotText,
                        isSelected && styles.slotTextActive,
                      ]}
                    >
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 3: Select Service Address */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>{categoryConfig.addressPrompt}</Text>
            <Text style={styles.stepDesc}>
              Choose from your saved addresses or add a new location.
            </Text>

            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <Pressable
                  key={addr.id}
                  onPress={() => setSelectedAddressId(addr.id)}
                  style={[
                    styles.addressCard,
                    isSelected && styles.addressCardActive,
                  ]}
                >
                  <View style={styles.radioCircle}>
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addrLabelRow}>
                      <Text style={styles.addrLabel}>{addr.label}</Text>
                      {addr.isDefault ? (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>DEFAULT</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.addrLine1}>{addr.line1}</Text>
                    <Text style={styles.addrLocality}>{addr.locality}</Text>
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => router.push('/addresses')}
              style={styles.addNewAddrBtn}
            >
              <Icon name="search" size={14} color={Colors.primary} />
              <Text style={styles.addNewAddrText}>+ Add New Address</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 4: Review Bill & Transparent Breakdown */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>Review & Confirm</Text>
            <Text style={styles.stepDesc}>
              100% transparent PhonePe-standard pricing. No surprises.
            </Text>

            {/* Bill Details */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>PRICE BREAKDOWN</Text>

              <View style={styles.billRow}>
                <Text style={styles.billItem}>Service / Visit Package</Text>
                <Text style={styles.billAmount}>
                  {categoryConfig.isFree ? 'FREE (₹0)' : `₹${basePrice}`}
                </Text>
              </View>

              {platformSafetyFee > 0 ? (
                <View style={styles.billRow}>
                  <Text style={styles.billItem}>Safety & Technician Insurance</Text>
                  <Text style={styles.billAmount}>₹{platformSafetyFee}</Text>
                </View>
              ) : null}

              <View style={styles.billRow}>
                <Text style={styles.billItem}>Visiting Charges</Text>
                <Text style={[styles.billAmount, { color: Colors.success }]}>
                  FREE
                </Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billRowTotal}>
                <Text style={styles.billTotalLabel}>Total Amount Payable</Text>
                <Text style={styles.billTotalAmount}>
                  {categoryConfig.isFree ? 'FREE (₹0)' : `₹${totalPrice}`}
                </Text>
              </View>
            </View>

            {/* Appointment Details Box */}
            <View style={styles.apptBox}>
              <View style={styles.apptRow}>
                <Icon name="clock" size={14} color={Colors.textSecondary} />
                <Text style={styles.apptText}>
                  {selectedDate} • {currentSlot}
                </Text>
              </View>
              <View style={styles.apptRow}>
                <Icon name="location" size={14} color={Colors.textSecondary} />
                <Text style={styles.apptText}>
                  Sai Residency, Madhapur, Hyderabad
                </Text>
              </View>
            </View>

            {/* Pay After Work Notice */}
            <View style={styles.payNotice}>
              <Icon name="shield-check" size={18} color={Colors.primary} />
              <Text style={styles.payNoticeText}>{categoryConfig.guaranteeText}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Bottom Step Action Bar */}
      <View style={styles.bottomBar}>
        {step < 4 ? (
          <Button
            label={`Proceed to Step ${step + 1} ›`}
            size="lg"
            style={{ width: '100%' }}
            onPress={() => setStep((step + 1) as typeof step)}
          />
        ) : (
          <Button
            label={
              categoryConfig.isFree
                ? 'Confirm Free Site Visit ✓'
                : `Confirm Booking Request (₹${totalPrice})`
            }
            size="lg"
            loading={loading}
            style={{ width: '100%' }}
            onPress={handleConfirmBooking}
          />
        )}
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
    backgroundColor: Colors.surface,
    paddingTop: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
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
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  stepperBar: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10,
  },
  stepSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceMuted,
  },
  stepSegmentDone: {
    backgroundColor: Colors.primary,
  },
  stepSegmentCurrent: {
    backgroundColor: Colors.primaryDark,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 16,
    ...Shadows.sm,
  },
  summaryTextCol: {
    flex: 1,
    marginRight: 10,
  },
  summaryService: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryBusiness: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepContainer: {},
  stepHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  subHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  problemTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tagPillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateCardActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  dateLabelActive: {
    color: Colors.primaryDark,
  },
  dateDay: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  dateDayActive: {
    color: Colors.primary,
  },
  slotsContainer: {
    gap: 8,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 10,
  },
  slotPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  slotTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...Shadows.sm,
  },
  addressCardActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  addressInfo: {
    flex: 1,
  },
  addrLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  addrLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: Colors.accentAmberLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  defaultText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.accentAmberDark,
  },
  addrLine1: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  addrLocality: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  addNewAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  addNewAddrText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  billCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
    ...Shadows.sm,
  },
  billTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billItem: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  billAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  billDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  billTotalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  apptBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apptText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  payNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    padding: 12,
    gap: 10,
  },
  payNoticeText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primaryDark,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Shadows.lg,
  },
  successWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successCheck: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
    ...Shadows.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  receiptLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    padding: 12,
    gap: 8,
    marginBottom: 24,
  },
  safetyText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primaryDark,
    lineHeight: 16,
  },
  backHomeBtn: {
    paddingVertical: 10,
  },
  backHomeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
