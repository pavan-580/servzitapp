import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authenticatedFetch, restoreSession } from '../src/auth/session';

type Address = { id: string; label: string; addressLines: string[]; localityName: string | null; isDefault: boolean };
type Booking = { id: string; status: string; scheduledStart: string; businessName: string; serviceName: string; totalMinor: string; currency: string };
type Quotation = { id: string; status: string; businessName: string; serviceName: string; createdAt: string };

export default function BookServiceScreen() {
  const params = useLocalSearchParams<{ offeringId: string; quotationId: string; quotedAddressId: string; businessName: string; serviceName: string; priceMinor: string; currency: string; pricingModel: string }>();
  const router = useRouter();
  const initialDate = useMemo(() => { const date = new Date(Date.now() + 2 * 60 * 60 * 1000); date.setMinutes(0, 0, 0); return date; }, []);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [duration, setDuration] = useState('60');
  const [note, setNote] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => Crypto.randomUUID());
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const isQuote = params.pricingModel === 'quote';
  const isAcceptedQuote = params.pricingModel === 'accepted_quote';

  useEffect(() => {
    let active = true;
    async function load() {
      if (!(await restoreSession())) { if (active) { setError('Sign in before requesting a booking.'); setLoading(false); } return; }
      try {
        const response = await authenticatedFetch('/me/addresses');
        if (!response.ok) throw new Error('Saved addresses could not be loaded.');
        const payload = await response.json() as { items: Address[] };
        if (active) { setAddresses(payload.items); setAddressId(params.quotedAddressId ?? payload.items.find((item) => item.isDefault)?.id ?? payload.items[0]?.id ?? null); }
      } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Saved addresses could not be loaded.'); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, []);

  function onDateChange(event: DateTimePickerEvent, value?: Date) {
    if (event.type === 'dismissed') { setPickerMode(null); return; }
    if (value) setSelectedDate(value);
    setPickerMode(null);
  }

  async function requestBooking() {
    if (!params.offeringId && !params.quotationId) { setError('Service details are missing. Return to discovery and choose a provider again.'); return; }
    if (!addressId) { setError('Save an address before requesting a booking.'); return; }
    const durationMinutes = Number(duration);
    if (!isQuote && (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 480)) { setError('Duration must be between 15 and 480 minutes.'); return; }
    if (!isQuote && selectedDate.getTime() < Date.now() + 5 * 60_000) { setError('Choose a time at least five minutes from now.'); return; }
    setSubmitting(true); setError(null);
    try {
      const response = await authenticatedFetch(isQuote ? '/quotations' : '/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(isAcceptedQuote ? { quotationId: params.quotationId } : { offeringId: params.offeringId }), addressId, ...(isQuote ? {} : { scheduledFor: selectedDate.toISOString(), durationMinutes }), customerNote: note.trim() || undefined, idempotencyKey }),
      });
      const payload = await response.json() as { booking?: Booking; quotation?: Quotation; message?: string; code?: string };
      if (!response.ok || (isQuote ? !payload.quotation : !payload.booking)) {
        if (payload.code === 'OUTSIDE_PROVIDER_HOURS') throw new Error('That time is outside the provider’s listed hours. Choose another time.');
        if (payload.code === 'TIME_SLOT_TAKEN') throw new Error('That time has just been requested by someone else. Choose another time.');
        throw new Error(typeof payload.message === 'string' ? payload.message : 'The booking request could not be sent. Try again.');
      }
      if (isQuote) setQuotation(payload.quotation!); else setBooking(payload.booking!);
    } catch (e) { setError(e instanceof Error ? e.message : 'The booking request could not be sent.'); }
    finally { setSubmitting(false); }
  }

  if (booking || quotation) return <View style={styles.page}><View style={styles.confirmation}>
    <View style={styles.check}><Text style={styles.checkText}>✓</Text></View><Text style={styles.title}>Request sent</Text>
    <Text style={styles.subtitle}>Your booking request was saved. The provider must accept it before it is confirmed.</Text>
    <View style={styles.summary}><Text style={styles.summaryTitle}>{quotation?.serviceName ?? booking?.serviceName}</Text><Text style={styles.summaryText}>{quotation?.businessName ?? booking?.businessName}</Text>{booking ? <Text style={styles.summaryText}>{new Date(booking.scheduledStart).toLocaleString()}</Text> : null}<Text style={styles.status}>{(quotation?.status ?? booking?.status ?? '').toUpperCase()}</Text></View>
    <Text style={styles.paymentNote}>{quotation ? 'The provider will respond with a price and terms. No payment is collected.' : 'No payment was collected. Payment integration is not active.'}</Text>
    <Pressable accessibilityRole="button" onPress={() => router.replace('/bookings')} style={styles.primary}><Text style={styles.primaryText}>{quotation ? 'View requests' : 'View my bookings'}</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.secondary}><Text style={styles.secondaryText}>Back to discovery</Text></Pressable>
  </View></View>;

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹  Back</Text></Pressable>
    <Text style={styles.kicker}>{isQuote ? 'SERVICE QUOTATION' : 'SERVICE BOOKING'}</Text><Text style={styles.title}>{isQuote ? 'Request a quote.' : isAcceptedQuote ? 'Schedule your service.' : 'Choose a time.'}</Text>
    <View style={styles.summary}><Text style={styles.summaryTitle}>{params.serviceName || 'Service'}</Text><Text style={styles.summaryText}>{params.businessName || 'Provider'}</Text>
      {params.priceMinor ? <Text style={styles.price}>{formatPrice(params.priceMinor, params.currency || 'INR', params.pricingModel)}</Text> : null}
    </View>
    <Text style={styles.sectionTitle}>Service address</Text>
    {loading ? <ActivityIndicator style={{ marginTop: 15 }} color="#0d7153"/> : null}
    {!loading && addresses.length === 0 ? <View style={styles.empty}><Text style={styles.emptyText}>Add a saved address before booking.</Text><Pressable accessibilityRole="button" onPress={() => router.push('/addresses')}><Text style={styles.link}>Manage addresses</Text></Pressable></View> : null}
    {addresses.map((address) => <Pressable key={address.id} accessibilityRole="button" disabled={isAcceptedQuote && address.id !== params.quotedAddressId} accessibilityState={{ selected: address.id === addressId, disabled: isAcceptedQuote && address.id !== params.quotedAddressId }} onPress={() => { setAddressId(address.id); setIdempotencyKey(Crypto.randomUUID()); }} style={[styles.address, address.id === addressId && styles.addressSelected]}>
      <View style={styles.radio}>{address.id === addressId ? <View style={styles.radioDot}/> : null}</View><View style={{ flex: 1 }}><Text style={styles.addressLabel}>{address.label}{address.isDefault ? ' · Default' : ''}</Text><Text numberOfLines={2} style={styles.addressText}>{address.addressLines.join(', ')}{address.localityName ? `, ${address.localityName}` : ''}</Text></View>
    </Pressable>)}
    <Pressable accessibilityRole="button" onPress={() => router.push('/addresses')} style={styles.addAddress}><Text style={styles.link}>+ Add or manage an address</Text></Pressable>
    {!isQuote ? <><Text style={styles.sectionTitle}>Schedule</Text><Text style={styles.helper}>The provider’s configured hours and existing requests are checked when you submit.</Text>
    <View style={styles.dateButtons}><Pressable accessibilityRole="button" onPress={() => setPickerMode('date')} style={styles.dateButton}><Text style={styles.dateLabel}>DATE</Text><Text style={styles.dateValue}>{selectedDate.toLocaleDateString()}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setPickerMode('time')} style={styles.dateButton}><Text style={styles.dateLabel}>TIME</Text><Text style={styles.dateValue}>{selectedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text></Pressable></View>
    {pickerMode ? <DateTimePicker value={selectedDate} mode={pickerMode} minimumDate={new Date(Date.now() + 5 * 60_000)} onChange={(event, value) => { if (event.type === 'set' && value) setIdempotencyKey(Crypto.randomUUID()); onDateChange(event, value); }}/> : null}
    <Text style={styles.label}>EXPECTED DURATION (MINUTES)</Text><TextInput value={duration} onChangeText={(value) => { setDuration(value); setIdempotencyKey(Crypto.randomUUID()); }} style={styles.input} keyboardType="number-pad" maxLength={3} accessibilityLabel="Expected service duration in minutes"/></> : <Text style={styles.helper}>Describe what you need. The provider will review your request and send a quotation.</Text>}
    <Text style={styles.label}>NOTE FOR THE PROVIDER (OPTIONAL)</Text><TextInput value={note} onChangeText={(value) => { setNote(value); setIdempotencyKey(Crypto.randomUUID()); }} style={[styles.input, styles.multiline]} multiline maxLength={1000} accessibilityLabel="Note for provider" placeholder="Describe what you need help with"/>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={submitting || loading || !addressId} onPress={() => void requestBooking()} style={[styles.primary, (submitting || loading || !addressId) && styles.disabled]}>{submitting ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>{isQuote ? 'Send quotation request' : 'Request booking'}</Text>}</Pressable>
    <Text style={styles.paymentNote}>{isQuote ? 'A quote request is not a booking and does not collect payment.' : 'This sends a request only. The provider must accept it. No payment is collected in this build.'}</Text>
  </ScrollView>;
}

function formatPrice(priceMinor: string, currency: string, model?: string) {
  const amount = Number(priceMinor) / 100;
  const display = new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  return model === 'inspection' ? `${display} inspection charge` : display;
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:'#f8faf8'},content:{padding:22,paddingTop:54,paddingBottom:36},back:{alignSelf:'flex-start',paddingVertical:8},backText:{color:'#315c49',fontSize:14,fontWeight:'700'},kicker:{marginTop:22,fontSize:9,letterSpacing:1.5,color:'#0d7153',fontWeight:'800'},title:{fontSize:29,fontWeight:'800',letterSpacing:-.6,color:'#152923',marginTop:8},subtitle:{fontSize:13,lineHeight:20,color:'#65776e',marginTop:9,textAlign:'center'},summary:{backgroundColor:'#eaf5ee',borderRadius:15,padding:15,marginTop:17},summaryTitle:{fontSize:14,fontWeight:'800',color:'#20523f'},summaryText:{fontSize:11,color:'#587167',marginTop:5},price:{fontSize:12,fontWeight:'800',color:'#24392e',marginTop:9},sectionTitle:{fontSize:16,fontWeight:'800',color:'#1c3028',marginTop:25},helper:{fontSize:10,lineHeight:15,color:'#718078',marginTop:6},address:{flexDirection:'row',alignItems:'center',gap:11,padding:13,backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea',borderRadius:13,marginTop:10},addressSelected:{borderColor:'#0d7153',backgroundColor:'#f5fbf7'},radio:{width:18,height:18,borderRadius:9,borderWidth:1.5,borderColor:'#7d9286',alignItems:'center',justifyContent:'center'},radioDot:{height:9,width:9,borderRadius:5,backgroundColor:'#0d7153'},addressLabel:{fontSize:12,fontWeight:'800',color:'#23382d'},addressText:{fontSize:10,lineHeight:15,color:'#65776e',marginTop:4},addAddress:{alignSelf:'flex-start',paddingVertical:10},link:{fontSize:11,fontWeight:'800',color:'#0d7153'},empty:{padding:14,marginTop:11,borderRadius:12,backgroundColor:'#eaf5ee'},emptyText:{fontSize:11,color:'#53675c',marginBottom:8},dateButtons:{flexDirection:'row',gap:10,marginTop:13},dateButton:{flex:1,backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea',borderRadius:13,padding:13},dateLabel:{fontSize:8,letterSpacing:1,fontWeight:'800',color:'#718078'},dateValue:{fontSize:13,fontWeight:'800',color:'#23382d',marginTop:7},label:{fontSize:9,letterSpacing:1,fontWeight:'800',color:'#53675c',marginTop:17},input:{minHeight:47,backgroundColor:'#fff',borderWidth:1,borderColor:'#dfe9e2',borderRadius:12,paddingHorizontal:12,fontSize:13,color:'#1d3428',marginTop:7},multiline:{minHeight:78,paddingTop:11,textAlignVertical:'top'},error:{marginTop:14,color:'#a5342b',backgroundColor:'#fff0ed',padding:11,borderRadius:10,fontSize:11,lineHeight:17},primary:{minHeight:50,borderRadius:13,backgroundColor:'#0d7153',alignItems:'center',justifyContent:'center',marginTop:20},disabled:{opacity:.6},primaryText:{fontSize:12,fontWeight:'800',color:'#fff'},secondary:{alignSelf:'center',padding:12,marginTop:8},secondaryText:{fontSize:11,color:'#0d7153',fontWeight:'800'},paymentNote:{fontSize:10,lineHeight:15,color:'#7a877f',textAlign:'center',marginTop:13},confirmation:{flex:1,justifyContent:'center',padding:24},check:{width:56,height:56,borderRadius:20,alignSelf:'center',alignItems:'center',justifyContent:'center',backgroundColor:'#dff2e7'},checkText:{fontSize:27,fontWeight:'900',color:'#0d7153'},status:{color:'#916a17',fontWeight:'900',fontSize:10,letterSpacing:1,marginTop:12}});
