import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { apiBase, authenticatedFetch, restoreSession, signOut, SignedInUser, storeSession } from '../src/auth/session';

const accountTypes = [
  { id: 'individual', label: 'Individual professional' }, { id: 'service_company', label: 'Service company' },
  { id: 'retail_shop', label: 'Retail shop' }, { id: 'business_owner', label: 'Business owner' },
  { id: 'property_owner', label: 'Property owner' }, { id: 'agent', label: 'Real estate agent' }, { id: 'builder', label: 'Builder' },
] as const;
type AccountType = typeof accountTypes[number]['id'];
type ProviderProfile = { providerId: string; accountType: AccountType; reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended'; businessId: string; businessName: string; description: string | null; isPublished: boolean; addressLines: string[]; localityId: string | null; serviceRadiusMeters: number | null };
type ProviderBooking = { id: string; status: string; scheduledStart: string; businessName: string; serviceName: string; totalMinor: string; currency: string; addressLines: string[]; customerNote: string | null };
type ProviderQuotation = { id: string; status: string; businessName: string; serviceName: string; customerName: string | null; customerNote: string | null; quoteAmountMinor: string | null; currency: string };
type CatalogService = { id: string; nameEn: string; categoryName: string };
type ProviderOffering = { id: string; serviceId: string; serviceName: string; categoryName: string; pricingModel: 'fixed' | 'inspection' | 'quote'; priceMinor: string | null; currency: string; isActive: boolean };
type AvailabilitySlot = { isoWeekday: number; opensAt: string; closesAt: string; timeZone: string };
type DayHours = { isoWeekday: number; enabled: boolean; opensAt: string; closesAt: string };
const weekdays = [{ id: 1, label: 'Monday' }, { id: 2, label: 'Tuesday' }, { id: 3, label: 'Wednesday' }, { id: 4, label: 'Thursday' }, { id: 5, label: 'Friday' }, { id: 6, label: 'Saturday' }, { id: 7, label: 'Sunday' }];

export default function PartnerHomeScreen() {
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [quotations, setQuotations] = useState<ProviderQuotation[]>([]);
  const [quoteAmounts, setQuoteAmounts] = useState<Record<string, string>>({});
  const [quoteBusyId, setQuoteBusyId] = useState<string | null>(null);
  const [serviceCatalog, setServiceCatalog] = useState<CatalogService[]>([]);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [servicePricing, setServicePricing] = useState<'fixed' | 'inspection' | 'quote'>('fixed');
  const [servicePrice, setServicePrice] = useState('');
  const [savingService, setSavingService] = useState(false);
  const [hours, setHours] = useState<DayHours[]>(weekdays.map((day) => ({ isoWeekday: day.id, enabled: false, opensAt: '09:00', closesAt: '17:00' })));
  const [savingHours, setSavingHours] = useState(false);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [serviceRadius, setServiceRadius] = useState('10000');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const response = await authenticatedFetch('/providers/me');
    if (!response.ok) throw new Error(response.status === 401 ? 'Sign in again to continue.' : 'Provider profile could not be loaded. Check your connection.');
    const payload = await response.json() as { provider: ProviderProfile | null };
    setProfile(payload.provider);
    if (payload.provider) {
      const [bookingResponse, hoursResponse, quotationResponse, offeringResponse, catalogResponse] = await Promise.all([
        authenticatedFetch('/providers/me/bookings?page=1&limit=20'),
        authenticatedFetch('/providers/me/availability'),
        authenticatedFetch('/providers/me/quotations?page=1&limit=20'),
        authenticatedFetch('/providers/me/services'),
        fetch(`${apiBase()}/services`),
      ]);
      if (!bookingResponse.ok || !hoursResponse.ok || !quotationResponse.ok || !offeringResponse.ok || !catalogResponse.ok) throw new Error('Provider schedule, service listings, booking requests, or quotations could not be loaded. Try again.');
      const bookingPayload = await bookingResponse.json() as { items: ProviderBooking[] };
      const hoursPayload = await hoursResponse.json() as { slots: AvailabilitySlot[] };
      const quotationPayload = await quotationResponse.json() as { items: ProviderQuotation[] };
      const offeringPayload = await offeringResponse.json() as { items: ProviderOffering[] };
      const catalogPayload = await catalogResponse.json() as { items: CatalogService[] };
      setBookings(bookingPayload.items);
      setQuotations(quotationPayload.items);
      setOfferings(offeringPayload.items);
      setServiceCatalog(catalogPayload.items);
      setHours(weekdays.map((day) => {
        const existing = hoursPayload.slots.find((slot) => slot.isoWeekday === day.id);
        return existing ? { isoWeekday: day.id, enabled: true, opensAt: existing.opensAt, closesAt: existing.closesAt } : { isoWeekday: day.id, enabled: false, opensAt: '09:00', closesAt: '17:00' };
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;
    restoreSession().then(async (signedIn) => {
      if (!active) return;
      setUser(signedIn);
      if (signedIn) {
        try { await loadProfile(); }
        catch (e) { if (active) setError(e instanceof Error ? e.message : 'Provider profile could not be loaded.'); }
      }
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [loadProfile]);

  async function sendCode() {
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) { setError('Enter a phone number with its country code.'); return; }
    if (!apiBase()) { setError('Sign in is unavailable because this app build has no API address.'); return; }
    setBusy(true); setError(null); setNotice(null);
    try {
      const response = await fetch(`${apiBase()}/auth/otp/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneE164: normalized }) });
      if (!response.ok) throw new Error(response.status === 503 ? 'Phone verification is not configured for this environment.' : 'Could not send a verification code. Try again.');
      setPhone(normalized); setOtpSent(true); setNotice('If this number can receive verification, a code was sent.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send a verification code.'); }
    finally { setBusy(false); }
  }

  async function verifyCode() {
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!/^\d{4,10}$/.test(code)) { setError('Enter the verification code you received.'); return; }
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBase()}/auth/otp/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneE164: normalized, code }) });
      const payload = await response.json() as { accessToken?: string; refreshToken?: string; user?: SignedInUser };
      if (!response.ok || !payload.accessToken || !payload.refreshToken || !payload.user) throw new Error('The verification code could not be confirmed. Try again.');
      await storeSession(payload.accessToken, payload.refreshToken);
      setUser(payload.user);
      await loadProfile();
    } catch (e) { setError(e instanceof Error ? e.message : 'Sign in could not be completed.'); }
    finally { setBusy(false); }
  }

  async function captureLocation() {
    setError(null); setNotice(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') { setError('Location permission is needed to record the real business location.'); return; }
      const point = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoordinates({ lat: point.coords.latitude, lng: point.coords.longitude });
      setNotice('Business coordinates captured from your device.');
    } catch { setError('Could not read your location. Try again.'); }
  }

  async function createProfile() {
    const radius = Number(serviceRadius);
    if (!businessName.trim() || businessName.trim().length < 2) { setError('Enter a business or professional name.'); return; }
    if (!address.trim()) { setError('Enter the business address.'); return; }
    if (!coordinates) { setError('Capture the actual business location before submitting.'); return; }
    if (!Number.isInteger(radius) || radius < 500 || radius > 100000) { setError('Service radius must be between 500 and 100000 metres.'); return; }
    setBusy(true); setError(null); setNotice(null);
    try {
      const response = await authenticatedFetch('/providers/onboarding', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType, businessName: businessName.trim(), description: description.trim() || undefined, addressLine: address.trim(), lat: coordinates.lat, lng: coordinates.lng, serviceRadiusMeters: radius }),
      });
      const payload = await response.json() as { provider?: ProviderProfile };
      if (!response.ok || !payload.provider) throw new Error(response.status === 503 ? 'Provider onboarding requires the marketplace database to be online.' : 'The provider profile could not be submitted. Check the details and retry.');
      setProfile(payload.provider); setNotice('Profile created. It remains unpublished while verification and administrator review are pending.');
    } catch (e) { setError(e instanceof Error ? e.message : 'The profile could not be submitted.'); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); setError(null);
    try { await signOut(); setUser(null); setProfile(null); setNotice(null); setOtpSent(false); }
    catch { setError('Sign out could not be confirmed by the server.'); }
    finally { setBusy(false); }
  }

  async function decideBooking(id: string, decision: 'accept' | 'reject') {
    setDecisionId(id); setError(null);
    try {
      const response = await authenticatedFetch(`/providers/me/bookings/${id}/decision`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }),
      });
      if (!response.ok) throw new Error(response.status === 409 ? 'This booking request has already changed.' : 'The booking decision could not be saved.');
      await loadProfile();
    } catch (e) { setError(e instanceof Error ? e.message : 'The booking decision could not be saved.'); }
    finally { setDecisionId(null); }
  }

  async function saveHours() {
    const slots = hours.filter((day) => day.enabled).map((day) => ({ isoWeekday: day.isoWeekday, opensAt: day.opensAt, closesAt: day.closesAt, timeZone: 'Asia/Kolkata' }));
    setSavingHours(true); setError(null); setNotice(null);
    try {
      const response = await authenticatedFetch('/providers/me/availability', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slots }),
      });
      if (!response.ok) throw new Error(response.status === 400 ? 'Check the time windows; closing must follow opening and windows cannot overlap.' : 'Working hours could not be saved. Try again.');
      setNotice('Working hours saved. Booking requests are checked against these hours.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Working hours could not be saved.'); }
    finally { setSavingHours(false); }
  }

  async function sendQuote(quotation: ProviderQuotation) {
    const wholeRupees = Number(quoteAmounts[quotation.id]);
    if (!Number.isSafeInteger(wholeRupees) || wholeRupees < 0 || wholeRupees > 9_999_999_999) { setError('Enter a valid whole rupee amount.'); return; }
    setQuoteBusyId(quotation.id); setError(null);
    try {
      const response = await authenticatedFetch(`/providers/me/quotations/${quotation.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountMinor: String(wholeRupees * 100), expiresInHours: 168 }) });
      if (!response.ok) throw new Error(response.status === 409 ? 'This request has already been answered.' : 'The quotation could not be sent. Try again.');
      setNotice('Quotation sent to the customer.'); await loadProfile();
    } catch (e) { setError(e instanceof Error ? e.message : 'The quotation could not be sent.'); }
    finally { setQuoteBusyId(null); }
  }

  async function saveOffering() {
    if (!serviceCatalog.some((service) => service.id === selectedServiceId)) { setError('Choose a service from the catalogue.'); return; }
    let priceMinor: string | undefined;
    if (servicePricing !== 'quote') {
      const parts = servicePrice.trim().match(/^(\d{1,10})(?:\.(\d{1,2}))?$/);
      if (!parts) { setError('Enter a price in rupees, up to two decimal places.'); return; }
      priceMinor = (BigInt(parts[1]) * 100n + BigInt((parts[2] ?? '').padEnd(2, '0'))).toString();
    }
    setSavingService(true); setError(null); setNotice(null);
    try {
      const response = await authenticatedFetch('/providers/me/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: selectedServiceId, pricingModel: servicePricing, ...(priceMinor === undefined ? {} : { priceMinor }), currency: 'INR' }) });
      if (!response.ok) throw new Error(response.status === 404 ? 'That service is no longer available.' : 'The service listing could not be saved. Try again.');
      setNotice('Service listing saved. It stays hidden until your provider profile is approved and published.'); setSelectedServiceId(''); setServicePrice(''); await loadProfile();
    } catch (e) { setError(e instanceof Error ? e.message : 'The service listing could not be saved.'); }
    finally { setSavingService(false); }
  }

  async function removeOffering(offeringId: string) {
    try {
      const response = await authenticatedFetch(`/providers/me/services/${offeringId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('The service could not be removed. Try again.');
      await loadProfile();
    } catch (e) { setError(e instanceof Error ? e.message : 'The service could not be removed.'); }
  }

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>S</Text></View><Text style={styles.word}>SERVZ’IT <Text style={styles.partner}>PARTNER</Text></Text></View>
    {checking ? <ActivityIndicator style={{ marginTop: 42 }} color="#0d7153" accessibilityLabel="Checking provider session"/> : null}
    {!checking && !user ? <>
      <Text style={styles.eyebrow}>GROW YOUR LOCAL BUSINESS</Text><Text style={styles.title}>Bring your work{ '\n' }online.</Text><Text style={styles.description}>Create a profile and connect with people searching nearby. Provider access stays pending until it is reviewed.</Text>
      <View style={styles.form}>
        <Text style={styles.label}>PHONE NUMBER</Text><TextInput value={phone} onChangeText={setPhone} editable={!otpSent && !busy} style={styles.input} keyboardType="phone-pad" autoComplete="tel" accessibilityLabel="Phone number with country code" placeholder="+91 98765 43210"/>
        {otpSent ? <><Text style={styles.label}>VERIFICATION CODE</Text><TextInput value={code} onChangeText={setCode} style={styles.input} keyboardType="number-pad" autoComplete="one-time-code" maxLength={10} accessibilityLabel="Verification code" placeholder="Enter code"/></> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void (otpSent ? verifyCode() : sendCode())} style={[styles.primary, busy && styles.disabled]}>{busy ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>{otpSent ? 'Verify and continue' : 'Sign in with phone'}</Text>}</Pressable>
        {otpSent ? <Pressable accessibilityRole="button" onPress={() => { setOtpSent(false); setCode(''); setNotice(null); }} style={styles.textButton}><Text style={styles.textButtonText}>Change phone number</Text></Pressable> : null}
      </View>
    </> : null}
    {!checking && user && !profile ? <>
      <Text style={styles.eyebrow}>PROVIDER ONBOARDING</Text><Text style={styles.title}>Set up your{ '\n' }business profile.</Text><Text style={styles.description}>Your listing starts unpublished. Customers can discover it only after verification and administrator approval.</Text>
      <View style={styles.form}>
        <Text style={styles.label}>ACCOUNT TYPE</Text><View style={styles.types}>{accountTypes.map((type) => <Pressable key={type.id} accessibilityRole="button" accessibilityState={{ selected: accountType === type.id }} onPress={() => setAccountType(type.id)} style={[styles.type, accountType === type.id && styles.typeSelected]}><Text style={[styles.typeText, accountType === type.id && styles.typeTextSelected]}>{type.label}</Text></Pressable>)}</View>
        <Text style={styles.label}>PROFILE OR BUSINESS NAME</Text><TextInput value={businessName} onChangeText={setBusinessName} maxLength={120} style={styles.input} accessibilityLabel="Business name" placeholder="How customers know you"/>
        <Text style={styles.label}>ABOUT YOUR WORK</Text><TextInput value={description} onChangeText={setDescription} maxLength={2000} style={[styles.input, styles.multiline]} multiline accessibilityLabel="Business description" placeholder="Describe your services or business"/>
        <Text style={styles.label}>BUSINESS ADDRESS</Text><TextInput value={address} onChangeText={setAddress} maxLength={120} style={styles.input} accessibilityLabel="Business address" placeholder="Street and locality"/>
        <Pressable accessibilityRole="button" onPress={() => void captureLocation()} style={styles.locationButton}><Text style={styles.locationText}>{coordinates ? 'Capture location again' : 'Capture business location'}</Text></Pressable>
        {coordinates ? <Text style={styles.helper}>Recorded point: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</Text> : null}
        <Text style={styles.label}>SERVICE RADIUS (METRES)</Text><TextInput value={serviceRadius} onChangeText={setServiceRadius} keyboardType="number-pad" maxLength={6} style={styles.input} accessibilityLabel="Service radius in metres"/>
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void createProfile()} style={[styles.primary, busy && styles.disabled]}>{busy ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>Create pending profile</Text>}</Pressable>
      </View>
    </> : null}
    {!checking && user && profile ? <>
      <Text style={styles.eyebrow}>PROVIDER DASHBOARD</Text><Text style={styles.title}>{profile.businessName}</Text>
      <View style={styles.statusCard}><Text style={styles.statusLabel}>REVIEW STATUS</Text><Text style={styles.status}>{profile.reviewStatus.replace('_', ' ').toUpperCase()}</Text><Text style={styles.description}>{profile.isPublished ? 'Your profile is published.' : 'Your profile is unpublished and customers cannot book it.'}</Text></View>
      <View style={styles.infoCard}><Text style={styles.cardTitle}>Next steps</Text><Text style={styles.info}>• Complete identity verification when secure document upload is enabled.</Text><Text style={styles.info}>• Wait for an administrator to review your profile.</Text><Text style={styles.info}>• Add service listings and working hours below; your listings stay unpublished during review.</Text><Text style={styles.info}>• Your account remains pending until these checks are complete.</Text></View>
      <Text style={styles.bookingTitle}>Working hours</Text><Text style={styles.helper}>Set the weekly hours when customers may request appointments. Time zone: India Standard Time.</Text>
      {hours.map((day) => <View key={day.isoWeekday} style={styles.hoursRow}>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: day.enabled }} onPress={() => setHours((current) => current.map((item) => item.isoWeekday === day.isoWeekday ? { ...item, enabled: !item.enabled } : item))} style={styles.dayToggle}><View style={[styles.checkbox, day.enabled && styles.checkboxChecked]}>{day.enabled ? <Text style={styles.checkboxMark}>✓</Text> : null}</View><Text style={styles.dayName}>{weekdays.find((value) => value.id === day.isoWeekday)?.label}</Text></Pressable>
        {day.enabled ? <View style={styles.hoursInputs}><TextInput accessibilityLabel={`${weekdays[day.isoWeekday - 1].label} opening time`} value={day.opensAt} onChangeText={(value) => setHours((current) => current.map((item) => item.isoWeekday === day.isoWeekday ? { ...item, opensAt: value } : item))} style={styles.timeInput} maxLength={5} placeholder="09:00"/><Text style={styles.timeSeparator}>to</Text><TextInput accessibilityLabel={`${weekdays[day.isoWeekday - 1].label} closing time`} value={day.closesAt} onChangeText={(value) => setHours((current) => current.map((item) => item.isoWeekday === day.isoWeekday ? { ...item, closesAt: value } : item))} style={styles.timeInput} maxLength={5} placeholder="17:00"/></View> : <Text style={styles.closed}>Closed</Text>}
      </View>)}
      <Pressable accessibilityRole="button" disabled={savingHours} onPress={() => void saveHours()} style={[styles.primary, savingHours && styles.disabled]}>{savingHours ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>Save working hours</Text>}</Pressable>
      <Text style={styles.bookingTitle}>Your service listings</Text><Text style={styles.helper}>Add services from the active marketplace catalogue. Listings stay hidden until provider approval and publication.</Text>
      {offerings.filter((item) => item.isActive).map((item) => <View key={item.id} style={styles.bookingCard}><View style={styles.bookingHeader}><Text style={styles.bookingName}>{item.serviceName}</Text><Text style={styles.bookingStatus}>{item.pricingModel.toUpperCase()}</Text></View><Text style={styles.bookingText}>{item.categoryName}{item.priceMinor ? ` · ${formatPrice(item.priceMinor, item.currency)}` : ' · Quote required'}</Text><Pressable accessibilityRole="button" onPress={() => void removeOffering(item.id)} style={styles.textButton}><Text style={styles.rejectText}>Remove listing</Text></Pressable></View>)}
      <View style={styles.form}>
        <Text style={styles.label}>MARKETPLACE SERVICE</Text>
        <View style={styles.types}>{serviceCatalog.filter((service) => !offerings.some((item) => item.serviceId === service.id && item.isActive)).map((service) => <Pressable key={service.id} accessibilityRole="button" accessibilityState={{ selected: selectedServiceId === service.id }} onPress={() => setSelectedServiceId(service.id)} style={[styles.type, selectedServiceId === service.id && styles.typeSelected]}><Text style={[styles.typeText, selectedServiceId === service.id && styles.typeTextSelected]}>{service.nameEn}</Text></Pressable>)}</View>
        {serviceCatalog.length === 0 ? <Text style={styles.helper}>The marketplace service catalogue is unavailable.</Text> : null}
        <Text style={styles.label}>PRICING TYPE</Text><View style={styles.types}>{(['fixed', 'inspection', 'quote'] as const).map((model) => <Pressable key={model} accessibilityRole="button" accessibilityState={{ selected: servicePricing === model }} onPress={() => setServicePricing(model)} style={[styles.type, servicePricing === model && styles.typeSelected]}><Text style={[styles.typeText, servicePricing === model && styles.typeTextSelected]}>{model === 'quote' ? 'Quote' : model === 'inspection' ? 'Inspection fee' : 'Fixed price'}</Text></Pressable>)}</View>
        {servicePricing !== 'quote' ? <><Text style={styles.label}>PRICE (INR)</Text><TextInput accessibilityLabel="Price in rupees" value={servicePrice} onChangeText={setServicePrice} keyboardType="decimal-pad" placeholder="e.g. 499 or 499.50" style={styles.input}/></> : null}
        <Pressable accessibilityRole="button" disabled={savingService || !selectedServiceId} onPress={() => void saveOffering()} style={[styles.primary, (savingService || !selectedServiceId) && styles.disabled]}>{savingService ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>Save service listing</Text>}</Pressable>
      </View>
      <Text style={styles.bookingTitle}>Booking requests</Text>
      {bookings.length === 0 ? <Text style={styles.helper}>No booking requests are available for this profile.</Text> : null}
      {bookings.map((booking) => <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}><Text style={styles.bookingName}>{booking.serviceName}</Text><Text style={styles.bookingStatus}>{booking.status.replace('_', ' ').toUpperCase()}</Text></View>
        <Text style={styles.bookingText}>{new Date(booking.scheduledStart).toLocaleString()}</Text><Text style={styles.bookingText}>{booking.addressLines.join(', ')}</Text>
        {booking.customerNote ? <Text style={styles.bookingText}>Customer note: {booking.customerNote}</Text> : null}
        <Text style={styles.bookingPrice}>{formatPrice(booking.totalMinor, booking.currency)}</Text>
        {booking.status === 'requested' ? <View style={styles.decisionRow}>
          <Pressable accessibilityRole="button" disabled={decisionId === booking.id} onPress={() => Alert.alert('Accept booking?', 'This will reserve the requested time for this job.', [{ text: 'Go back', style: 'cancel' }, { text: 'Accept', onPress: () => { void decideBooking(booking.id, 'accept'); } }])} style={styles.accept}><Text style={styles.acceptText}>Accept</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={decisionId === booking.id} onPress={() => Alert.alert('Reject booking?', 'The customer will see that the request was rejected.', [{ text: 'Go back', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => { void decideBooking(booking.id, 'reject'); } }])} style={styles.reject}><Text style={styles.rejectText}>Reject</Text></Pressable>
        </View> : null}
      </View>)}
      <Text style={styles.bookingTitle}>Quotation requests</Text>
      {quotations.length === 0 ? <Text style={styles.helper}>No quotation requests are available for this profile.</Text> : null}
      {quotations.map((quotation) => <View key={quotation.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}><Text style={styles.bookingName}>{quotation.serviceName}</Text><Text style={styles.bookingStatus}>{quotation.status.toUpperCase()}</Text></View>
        <Text style={styles.bookingText}>{quotation.businessName} · {quotation.customerName || 'Customer'}</Text>
        {quotation.customerNote ? <Text style={styles.bookingText}>{quotation.customerNote}</Text> : null}
        {quotation.status === 'requested' ? <><TextInput accessibilityLabel="Quotation amount in whole rupees" value={quoteAmounts[quotation.id] ?? ''} onChangeText={(value) => setQuoteAmounts((current) => ({ ...current, [quotation.id]: value.replace(/\D/g, '').slice(0, 10) }))} keyboardType="number-pad" placeholder="Amount in rupees" style={styles.input}/><Pressable accessibilityRole="button" disabled={quoteBusyId === quotation.id} onPress={() => void sendQuote(quotation)} style={styles.accept}><Text style={styles.acceptText}>{quoteBusyId === quotation.id ? 'Sending…' : 'Send quotation'}</Text></Pressable></> : quotation.quoteAmountMinor ? <Text style={styles.bookingPrice}>{formatPrice(quotation.quoteAmountMinor, quotation.currency)}</Text> : null}
      </View>)}
    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {notice && user ? <Text style={styles.notice}>{notice}</Text> : null}
    {user ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => void logout()} style={styles.textButton}><Text style={styles.textButtonText}>{busy ? 'Signing out…' : 'Sign out'}</Text></Pressable> : null}
    {!checking && !user ? <Text style={styles.privacy}>We use your phone to create your provider account. No verification code is simulated.</Text> : null}
    <Text style={styles.footer}>DISCOVER. CONNECT. BOOK. GROW.</Text>
  </ScrollView>;
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:'#f8faf8'},content:{padding:24,paddingTop:58,paddingBottom:32},brand:{flexDirection:'row',alignItems:'center',gap:11},mark:{height:38,width:38,borderRadius:13,backgroundColor:'#dff2e7',alignItems:'center',justifyContent:'center'},markText:{fontSize:20,fontWeight:'900',color:'#0d6b50'},word:{fontSize:13,fontWeight:'900',letterSpacing:.6,color:'#1b3027'},partner:{fontSize:9,color:'#799187',letterSpacing:1},eyebrow:{fontSize:9,fontWeight:'800',letterSpacing:1.6,color:'#0c7653',marginTop:36},title:{fontSize:34,lineHeight:39,fontWeight:'900',letterSpacing:-1,color:'#172b23',marginTop:9},description:{fontSize:12,lineHeight:18,color:'#697970',marginTop:10},form:{backgroundColor:'#fff',borderRadius:17,borderWidth:1,borderColor:'#e8eeea',padding:16,marginTop:20},label:{fontSize:9,fontWeight:'800',letterSpacing:1.1,color:'#53675c',marginTop:15},input:{minHeight:48,borderWidth:1,borderColor:'#dfe9e2',borderRadius:12,paddingHorizontal:12,color:'#1d3428',fontSize:13,marginTop:7},multiline:{minHeight:82,paddingTop:11,textAlignVertical:'top'},types:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:9},type:{borderWidth:1,borderColor:'#dfe9e2',backgroundColor:'#fff',borderRadius:10,paddingVertical:9,paddingHorizontal:10},typeSelected:{borderColor:'#0d7153',backgroundColor:'#e5f3eb'},typeText:{fontSize:10,color:'#50665b',fontWeight:'600'},typeTextSelected:{color:'#0d7153',fontWeight:'800'},locationButton:{alignSelf:'flex-start',marginTop:13,backgroundColor:'#e5f3eb',paddingHorizontal:12,paddingVertical:10,borderRadius:10},locationText:{fontSize:11,fontWeight:'800',color:'#0d7153'},helper:{fontSize:10,color:'#738279',marginTop:7},primary:{marginTop:18,minHeight:48,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:'#0d7153'},disabled:{opacity:.6},primaryText:{fontSize:12,color:'#fff',fontWeight:'800'},textButton:{alignSelf:'center',padding:12,marginTop:7},textButtonText:{fontSize:11,color:'#0d7153',fontWeight:'800'},notice:{marginTop:13,color:'#236847',backgroundColor:'#e5f3eb',padding:11,borderRadius:10,fontSize:11,lineHeight:17},error:{marginTop:14,color:'#a5342b',backgroundColor:'#fff0ed',padding:11,borderRadius:10,fontSize:11,lineHeight:17},privacy:{fontSize:10,lineHeight:15,color:'#87948d',textAlign:'center',marginTop:18},statusCard:{backgroundColor:'#fff6e5',borderRadius:16,padding:17,marginTop:18},statusLabel:{fontSize:9,letterSpacing:1.3,fontWeight:'800',color:'#81682f'},status:{fontSize:19,fontWeight:'900',color:'#6d541f',marginTop:6},infoCard:{backgroundColor:'#fff',borderRadius:16,borderWidth:1,borderColor:'#e8eeea',padding:17,marginTop:14},cardTitle:{fontSize:14,fontWeight:'800',color:'#26372f',marginBottom:10},info:{fontSize:11,lineHeight:17,color:'#53635a',marginTop:6},bookingTitle:{fontSize:17,fontWeight:'800',color:'#26372f',marginTop:25},hoursRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea',borderRadius:11,paddingHorizontal:11,paddingVertical:8,marginTop:7},dayToggle:{flexDirection:'row',alignItems:'center',gap:8},checkbox:{height:17,width:17,borderRadius:5,borderWidth:1,borderColor:'#819388',alignItems:'center',justifyContent:'center'},checkboxChecked:{backgroundColor:'#0d7153',borderColor:'#0d7153'},checkboxMark:{fontSize:10,color:'#fff',fontWeight:'900'},dayName:{fontSize:10,fontWeight:'700',color:'#26372f'},hoursInputs:{flexDirection:'row',alignItems:'center',gap:5},timeInput:{width:48,height:32,borderWidth:1,borderColor:'#dfe9e2',borderRadius:7,textAlign:'center',fontSize:10,color:'#26372f'},timeSeparator:{fontSize:9,color:'#718078'},closed:{fontSize:9,color:'#87948d'},bookingCard:{backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea',borderRadius:14,padding:14,marginTop:10},bookingHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},bookingName:{flex:1,fontSize:12,fontWeight:'800',color:'#26372f'},bookingStatus:{fontSize:8,letterSpacing:.6,fontWeight:'900',color:'#765b1d'},bookingText:{fontSize:10,lineHeight:15,color:'#66776e',marginTop:6},bookingPrice:{fontSize:11,fontWeight:'800',color:'#26372f',marginTop:9},decisionRow:{flexDirection:'row',gap:10,marginTop:12},accept:{backgroundColor:'#0d7153',paddingHorizontal:14,paddingVertical:9,borderRadius:9},acceptText:{fontSize:10,fontWeight:'800',color:'#fff'},reject:{backgroundColor:'#fff0ed',paddingHorizontal:14,paddingVertical:9,borderRadius:9},rejectText:{fontSize:10,fontWeight:'800',color:'#a5342b'},footer:{textAlign:'center',marginTop:30,fontSize:9,letterSpacing:1.4,color:'#98a69d',fontWeight:'800'}});

function formatPrice(minor: string, currency: string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(minor) / 100);
}
