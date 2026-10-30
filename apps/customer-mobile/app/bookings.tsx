import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { authenticatedFetch, restoreSession } from '../src/auth/session';

type Booking = { id: string; status: 'requested' | 'accepted' | 'rejected' | 'cancelled' | 'in_progress' | 'completed' | 'disputed'; scheduledStart: string; businessName: string; serviceName: string; totalMinor: string; currency: string; addressLines: string[]; customerNote: string | null; createdAt: string };
type Quotation = { id: string; status: string; providerId: string; offeringId: string; addressId: string | null; businessName: string; serviceName: string; customerName: string | null; customerNote: string | null; providerNote: string | null; quoteAmountMinor: string | null; currency: string; addressLines: string[]; expiresAt: string | null; createdAt: string };

export default function BookingsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Booking[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (requestedPage = 1, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setError(null);
    try {
      if (!(await restoreSession())) throw new Error('Sign in to view your bookings.');
      const [response, quotationResponse] = await Promise.all([authenticatedFetch(`/bookings?page=${requestedPage}&limit=20`), authenticatedFetch('/quotations?page=1&limit=50')]);
      if (!response.ok || !quotationResponse.ok) throw new Error('Bookings or quotation requests could not be loaded. Check your connection and retry.');
      const payload = await response.json() as { items: Booking[]; page: number; limit: number };
      const quotationPayload = await quotationResponse.json() as { items: Quotation[] };
      setItems((current) => append ? [...current, ...payload.items] : payload.items);
      if (!append) setQuotations(quotationPayload.items);
      setPage(requestedPage);
      setHasMore(payload.items.length === payload.limit);
    } catch (e) { setError(e instanceof Error ? e.message : 'Bookings could not be loaded.'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function cancel(booking: Booking) {
    Alert.alert('Cancel this booking?', 'The provider will be told that you cancelled the request.', [
      { text: 'Keep booking', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => { void performCancel(booking.id); } },
    ]);
  }

  async function performCancel(id: string) {
    setBusyId(id); setError(null);
    try {
      const response = await authenticatedFetch(`/bookings/${id}/cancel`, { method: 'POST' });
      if (!response.ok) throw new Error(response.status === 409 ? 'This booking can no longer be cancelled.' : 'The booking could not be cancelled. Try again.');
      await load(page);
    } catch (e) { setError(e instanceof Error ? e.message : 'The booking could not be cancelled.'); }
    finally { setBusyId(null); }
  }

  async function respondToQuotation(quotation: Quotation, action: 'reject' | 'cancel') {
    setBusyId(quotation.id); setError(null);
    try {
      const response = await authenticatedFetch(action === 'reject' ? `/quotations/${quotation.id}/respond` : `/quotations/${quotation.id}/cancel`, action === 'reject' ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision: 'reject' }) } : { method: 'POST' });
      if (!response.ok) throw new Error(response.status === 409 ? 'This quotation has changed and can no longer be updated.' : 'The quotation could not be updated. Try again.');
      await load(page);
    } catch (e) { setError(e instanceof Error ? e.message : 'The quotation could not be updated.'); }
    finally { setBusyId(null); }
  }

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹  Back</Text></Pressable>
    <Text style={styles.kicker}>YOUR ACCOUNT</Text><Text style={styles.title}>My bookings</Text>
    <Text style={styles.sectionTitle}>Quotation requests</Text>
    {!loading && quotations.length === 0 ? <Text style={styles.emptyText}>No quotation requests yet. Ask a provider for a quote from discovery.</Text> : null}
    {quotations.map((quotation) => <View key={quotation.id} style={styles.card}>
      <View style={styles.cardHeading}><Text style={styles.service}>{quotation.serviceName}</Text><Text style={[styles.status, quotation.status === 'quoted' ? styles.status_accepted : null]}>{quotation.status.toUpperCase()}</Text></View>
      <Text style={styles.business}>{quotation.businessName}</Text><Text style={styles.address}>{quotation.addressLines.join(', ')}</Text>
      {quotation.customerNote ? <Text style={styles.note}>{quotation.customerNote}</Text> : null}
      {quotation.providerNote ? <Text style={styles.note}>Provider: {quotation.providerNote}</Text> : null}
      {quotation.quoteAmountMinor ? <Text style={styles.price}>{formatPrice(quotation.quoteAmountMinor, quotation.currency)}{quotation.expiresAt ? ` · Expires ${new Date(quotation.expiresAt).toLocaleString()}` : ''}</Text> : null}
      {quotation.status === 'quoted' && quotation.addressId ? <Pressable accessibilityRole="button" disabled={busyId === quotation.id} onPress={() => router.push({ pathname: '/book-service', params: { offeringId: quotation.offeringId, quotationId: quotation.id, businessName: quotation.businessName, serviceName: quotation.serviceName, priceMinor: quotation.quoteAmountMinor ?? '', currency: quotation.currency, pricingModel: 'accepted_quote', quotedAddressId: quotation.addressId } })} style={styles.primary}><Text style={styles.primaryText}>Accept and schedule</Text></Pressable> : null}
      {['requested', 'quoted'].includes(quotation.status) ? <View style={styles.quoteActions}>
        {quotation.status === 'quoted' ? <Pressable accessibilityRole="button" disabled={busyId === quotation.id} onPress={() => Alert.alert('Reject this quotation?', 'The provider will see that you declined the price.', [{ text: 'Keep quote', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => { void respondToQuotation(quotation, 'reject'); } }])} style={styles.cancel}><Text style={styles.cancelText}>Reject quote</Text></Pressable> : null}
        <Pressable accessibilityRole="button" disabled={busyId === quotation.id} onPress={() => Alert.alert('Cancel this request?', 'The provider will see that you cancelled this quotation request.', [{ text: 'Keep request', style: 'cancel' }, { text: 'Cancel request', style: 'destructive', onPress: () => { void respondToQuotation(quotation, 'cancel'); } }])} style={styles.cancel}><Text style={styles.cancelText}>Cancel request</Text></Pressable>
      </View> : null}
    </View>)}
    <Text style={styles.sectionTitle}>Bookings</Text>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {loading ? <ActivityIndicator style={{ marginTop: 28 }} color="#0d7153" accessibilityLabel="Loading bookings"/> : null}
    {!loading && items.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No bookings yet</Text><Text style={styles.emptyText}>When you request a service, its status will appear here.</Text><Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.primary}><Text style={styles.primaryText}>Explore services</Text></Pressable></View> : null}
    {items.map((booking) => <View key={booking.id} style={styles.card}>
      <View style={styles.cardHeading}><Text style={styles.service}>{booking.serviceName}</Text><Text style={[styles.status, statusStyle(booking.status)]}>{booking.status.replace('_', ' ').toUpperCase()}</Text></View>
      <Text style={styles.business}>{booking.businessName}</Text><Text style={styles.date}>{new Date(booking.scheduledStart).toLocaleString()}</Text>
      <Text style={styles.address}>{booking.addressLines.join(', ')}</Text><Text style={styles.price}>{formatPrice(booking.totalMinor, booking.currency)}</Text>
      {booking.customerNote ? <Text style={styles.note}>“{booking.customerNote}”</Text> : null}
      {booking.status === 'requested' || booking.status === 'accepted' ? <Pressable accessibilityRole="button" disabled={busyId === booking.id} onPress={() => cancel(booking)} style={styles.cancel}><Text style={styles.cancelText}>{busyId === booking.id ? 'Cancelling…' : 'Cancel booking'}</Text></Pressable> : null}
    </View>)}
    {!loading && hasMore ? <Pressable accessibilityRole="button" disabled={loadingMore} onPress={() => void load(page + 1, true)} style={styles.more}>{loadingMore ? <ActivityIndicator color="#0d7153"/> : <Text style={styles.moreText}>Load more</Text>}</Pressable> : null}
  </ScrollView>;
}

function formatPrice(minor: string, currency: string) {
  const amount = Number(minor) / 100;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
}

function statusStyle(status: Booking['status']) {
  switch (status) {
    case 'accepted': return styles.status_accepted;
    case 'rejected': return styles.status_rejected;
    case 'cancelled': return styles.status_cancelled;
    case 'in_progress': return styles.status_in_progress;
    case 'completed': return styles.status_completed;
    case 'disputed': return styles.status_disputed;
    default: return null;
  }
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:'#f8faf8'},content:{padding:22,paddingTop:54,paddingBottom:36},back:{alignSelf:'flex-start',paddingVertical:8},backText:{fontSize:14,color:'#315c49',fontWeight:'700'},kicker:{marginTop:22,fontSize:9,letterSpacing:1.5,color:'#0d7153',fontWeight:'800'},title:{fontSize:29,fontWeight:'800',letterSpacing:-.6,color:'#152923',marginTop:8},sectionTitle:{fontSize:17,fontWeight:'800',color:'#1c3028',marginTop:24},error:{marginTop:14,color:'#a5342b',backgroundColor:'#fff0ed',padding:11,borderRadius:10,fontSize:11,lineHeight:17},empty:{marginTop:18,padding:18,borderRadius:15,backgroundColor:'#eaf5ee'},emptyTitle:{fontSize:15,fontWeight:'800',color:'#20523f'},emptyText:{fontSize:11,lineHeight:16,color:'#587167',marginTop:6},primary:{alignSelf:'flex-start',marginTop:14,backgroundColor:'#0d7153',paddingHorizontal:14,paddingVertical:10,borderRadius:10},primaryText:{fontSize:11,color:'#fff',fontWeight:'800'},card:{marginTop:12,padding:15,borderRadius:15,backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea'},cardHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},service:{flex:1,fontSize:13,fontWeight:'800',color:'#23382d'},status:{fontSize:8,fontWeight:'900',letterSpacing:.5,paddingHorizontal:7,paddingVertical:5,borderRadius:7,overflow:'hidden',color:'#765b1d',backgroundColor:'#fff3d5'},status_accepted:{color:'#176b42',backgroundColor:'#e3f4e9'},status_rejected:{color:'#9e332d',backgroundColor:'#fff0ed'},status_cancelled:{color:'#65736b',backgroundColor:'#eef1ef'},status_in_progress:{color:'#315f9d',backgroundColor:'#eaf0fa'},status_completed:{color:'#176b42',backgroundColor:'#e3f4e9'},status_disputed:{color:'#9e332d',backgroundColor:'#fff0ed'},business:{fontSize:11,fontWeight:'700',color:'#0d7153',marginTop:7},date:{fontSize:10,color:'#65776e',marginTop:7},address:{fontSize:10,lineHeight:15,color:'#65776e',marginTop:5},price:{fontSize:11,fontWeight:'800',color:'#24392e',marginTop:10},note:{fontSize:10,color:'#748279',lineHeight:15,marginTop:8},cancel:{alignSelf:'flex-start',paddingVertical:8,marginTop:4},cancelText:{fontSize:10,fontWeight:'800',color:'#a5342b'},quoteActions:{flexDirection:'row',gap:16,flexWrap:'wrap'},more:{alignItems:'center',padding:16,marginTop:6},moreText:{fontSize:11,color:'#0d7153',fontWeight:'800'}});
