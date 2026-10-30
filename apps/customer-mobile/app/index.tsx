import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { restoreSession, SignedInUser } from '../src/auth/session';

type Category = { id: string; slug: string; nameEn: string; nameTe: string | null };
type NearbyProvider = {
  providerId: string;
  businessId: string;
  businessName: string;
  businessDescription: string | null;
  offeringId: string;
  serviceId: string;
  serviceNameEn: string;
  serviceNameTe: string | null;
  pricingModel: 'fixed' | 'inspection' | 'quote';
  priceMinor: string | null;
  currency: string;
  availabilityStatus: 'available_now' | 'outside_scheduled_hours' | 'not_configured';
  distanceMeters: number;
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [providers, setProviders] = useState<NearbyProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(10000);
  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);

  useEffect(() => {
    let active = true;
    restoreSession().then((user) => { if (active) setSignedInUser(user); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!API_BASE) {
      setCategoryError('Marketplace API is not configured for this build.');
      setCategoriesLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCategoriesLoading(true);
      setCategoryError(null);
      try {
        const response = await fetch(`${API_BASE}/service-categories?q=${encodeURIComponent(search)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Could not load service categories. Try again.');
        const payload = await response.json() as { items: Category[] };
        setCategories(payload.items);
      } catch (error) {
        if (!controller.signal.aborted) setCategoryError(error instanceof Error ? error.message : 'Could not load service categories.');
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    }, 220);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search]);

  useEffect(() => {
    if (!location || !API_BASE) {
      setProviders([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setProvidersLoading(true);
      setProviderError(null);
      const params = new URLSearchParams({ lat: String(location.lat), lng: String(location.lng), radiusMeters: String(radiusMeters) });
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (search.trim()) params.set('q', search.trim());
      try {
        const response = await fetch(`${API_BASE}/providers/nearby?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Nearby services could not be loaded. Check your connection and retry.');
        const payload = await response.json() as { items: NearbyProvider[] };
        setProviders(payload.items);
      } catch (error) {
        if (!controller.signal.aborted) setProviderError(error instanceof Error ? error.message : 'Nearby services could not be loaded.');
      } finally {
        if (!controller.signal.aborted) setProvidersLoading(false);
      }
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [location, selectedCategory, search, radiusMeters]);

  async function useCurrentLocation() {
    setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationError('Location permission was not granted. You can still browse service categories.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
    } catch {
      setLocationError('Your current location could not be read. Please try again.');
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.top}>
        <View><Text style={styles.kicker}>YOUR NEIGHBOURHOOD</Text><Text style={styles.location}>{location ? 'Current location selected' : 'Location not selected'}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign in or open your profile" onPress={() => router.push('/sign-in')} style={styles.avatar}><Text style={styles.avatarText}>{signedInUser?.displayName?.slice(0, 1).toUpperCase() ?? 'S'}</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/sign-in')}><Text style={styles.accountLink}>{signedInUser ? `Signed in as ${signedInUser.displayName || signedInUser.phoneE164}` : 'Sign in to save addresses and manage bookings'}</Text></Pressable>
      {signedInUser ? <View style={styles.accountShortcuts}><Pressable accessibilityRole="button" onPress={() => router.push('/addresses')} style={styles.addressShortcut}><Text style={styles.addressShortcutText}>Saved addresses</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/bookings')} style={styles.addressShortcut}><Text style={styles.addressShortcutText}>My bookings</Text></Pressable></View> : null}
      <Pressable accessibilityRole="button" onPress={useCurrentLocation} style={styles.locationButton}>
        <Text style={styles.locationButtonText}>{location ? 'Refresh current location' : 'Use my current location'}</Text>
      </Pressable>
      <Text style={styles.locationNote}>Your location is requested only when you tap above and is used to search nearby providers.</Text>
      {locationError ? <Text accessibilityRole="alert" style={styles.errorText}>{locationError}</Text> : null}

      <Text style={styles.greeting}>What do you{'\n'}need help with?</Text>
      <TextInput value={search} onChangeText={setSearch} style={styles.search} placeholder="Search services or businesses" placeholderTextColor="#7c8983" accessibilityLabel="Search marketplace" returnKeyType="search" />

      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.heading}>Service categories</Text><Text style={styles.link}>{categories.length} found</Text></View>
        {categoriesLoading ? <ActivityIndicator style={styles.loader} color="#0d7153" accessibilityLabel="Loading service categories" /> : null}
        {categoryError ? <Text accessibilityRole="alert" style={styles.errorText}>{categoryError}</Text> : null}
        {!categoriesLoading && !categoryError && categories.length === 0 ? <Text style={styles.helper}>No categories match your search.</Text> : null}
        <View style={styles.categories}>
          {categories.map((category, index) => {
            const selected = selectedCategory === category.id;
            return <Pressable key={category.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSelectedCategory(selected ? null : category.id)} style={styles.category}>
              <View style={[styles.categoryIcon, selected && styles.categoryIconSelected, { backgroundColor: selected ? '#dff3e9' : ['#e6f4ec','#fff0df','#eaf0fa','#f8eafa'][index % 4] }]}><Text style={styles.symbol}>{category.nameEn.slice(0, 1).toUpperCase()}</Text></View>
              <Text numberOfLines={2} style={[styles.categoryName, selected && styles.selectedText]}>{category.nameEn}</Text>
            </Pressable>;
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.heading}>Nearby professionals</Text>{location ? <Text style={styles.link}>{radiusMeters / 1000} km radius</Text> : null}</View>
        {!location ? <View style={styles.empty}><Text style={styles.emptyTitle}>Choose a location to discover nearby providers</Text><Text style={styles.emptyText}>We’ll show provider details and distances only when the marketplace has verified location data.</Text></View> : null}
        {location && providersLoading ? <ActivityIndicator style={styles.loader} color="#0d7153" accessibilityLabel="Searching nearby providers" /> : null}
        {location && providerError ? <Text accessibilityRole="alert" style={styles.errorText}>{providerError}</Text> : null}
        {location && !providersLoading && !providerError && providers.length === 0 ? <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No verified providers found nearby</Text>
          <Text style={styles.emptyText}>There are no matching approved providers with a service area covering this location in the selected radius.</Text>
          {radiusMeters < 100000 ? <Pressable style={styles.expandButton} onPress={() => setRadiusMeters((value) => Math.min(value * 2, 100000))}><Text style={styles.expandText}>Expand search radius</Text></Pressable> : null}
        </View> : null}
        {providers.map((provider) => <View key={provider.offeringId} style={styles.providerCard}>
          <View style={styles.row}><Text style={styles.providerName}>{provider.businessName}</Text><Text style={styles.distance}>{formatDistance(provider.distanceMeters)}</Text></View>
          <Text style={styles.providerService}>{provider.serviceNameEn}</Text>
          {provider.businessDescription ? <Text numberOfLines={2} style={styles.providerDescription}>{provider.businessDescription}</Text> : null}
          <View style={styles.row}><Text style={styles.price}>{formatPrice(provider)}</Text><Text style={provider.availabilityStatus === 'available_now' ? styles.available : styles.unavailable}>{formatAvailability(provider.availabilityStatus)}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/book-service', params: { offeringId: provider.offeringId, serviceName: provider.serviceNameEn, businessName: provider.businessName, priceMinor: provider.priceMinor ?? '', currency: provider.currency, pricingModel: provider.pricingModel } })} style={styles.bookButton}><Text style={styles.bookText}>{provider.pricingModel === 'quote' ? 'Request a quote' : 'Request booking'}</Text></Pressable>
        </View>)}
      </View>
      <Text style={styles.footer}>DISCOVER. CONNECT. BOOK. GROW.</Text>
    </ScrollView>
  );
}

function formatDistance(meters: number) {
  return meters < 1000 ? `${meters} m away` : `${(meters / 1000).toFixed(1)} km away`;
}

function formatPrice(provider: NearbyProvider) {
  if (provider.priceMinor === null || provider.pricingModel === 'quote') return 'Request a quote';
  const amount = Number(provider.priceMinor) / 100;
  const label = new Intl.NumberFormat('en-IN', { style: 'currency', currency: provider.currency, maximumFractionDigits: 0 }).format(amount);
  return provider.pricingModel === 'inspection' ? `${label} inspection` : `From ${label}`;
}

function formatAvailability(status: NearbyProvider['availabilityStatus']) {
  if (status === 'available_now') return 'Available now';
  if (status === 'outside_scheduled_hours') return 'Outside working hours';
  return 'Hours not listed';
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:'#f8faf8'},content:{paddingTop:58,paddingHorizontal:22,paddingBottom:30},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},kicker:{fontSize:9,letterSpacing:1.5,color:'#64776e',fontWeight:'700'},location:{fontSize:14,fontWeight:'700',color:'#18362b',marginTop:5},avatar:{width:40,height:40,borderRadius:14,backgroundColor:'#dff2e7',alignItems:'center',justifyContent:'center'},avatarText:{fontSize:18,fontWeight:'800',color:'#0f694f'},accountLink:{fontSize:11,color:'#0d7153',fontWeight:'700',marginTop:8},accountShortcuts:{flexDirection:'row',gap:18},addressShortcut:{alignSelf:'flex-start',paddingVertical:8},addressShortcutText:{fontSize:11,color:'#52675b',fontWeight:'700'},locationButton:{alignSelf:'flex-start',marginTop:16,backgroundColor:'#e5f3eb',paddingHorizontal:13,paddingVertical:10,borderRadius:11},locationButtonText:{fontSize:12,fontWeight:'700',color:'#0d6b50'},locationNote:{fontSize:10,lineHeight:15,color:'#718078',marginTop:8},greeting:{fontSize:31,lineHeight:37,fontWeight:'800',letterSpacing:-.8,color:'#152923',marginTop:28},search:{height:52,backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea',borderRadius:15,paddingHorizontal:16,marginTop:19,fontSize:13},section:{marginTop:30},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},heading:{fontSize:17,fontWeight:'800',color:'#1c3028'},link:{fontSize:11,fontWeight:'700',color:'#0d7153'},loader:{marginVertical:20},categories:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:18,marginTop:18},category:{width:'31%',alignItems:'center'},categoryIcon:{width:58,height:58,borderRadius:18,alignItems:'center',justifyContent:'center'},categoryIconSelected:{borderWidth:2,borderColor:'#0d7153'},symbol:{fontSize:22,fontWeight:'800',color:'#275343'},categoryName:{fontSize:11,fontWeight:'600',color:'#47584f',marginTop:8,textAlign:'center'},selectedText:{color:'#0d6b50'},helper:{fontSize:12,color:'#687971',marginTop:12},errorText:{fontSize:12,lineHeight:18,color:'#a5342b',backgroundColor:'#fff0ed',padding:11,borderRadius:10,marginTop:12},empty:{marginTop:15,padding:17,borderRadius:16,backgroundColor:'#eaf5ee'},emptyTitle:{fontSize:14,fontWeight:'800',color:'#20523f'},emptyText:{fontSize:11,lineHeight:17,color:'#587167',marginTop:7},expandButton:{alignSelf:'flex-start',marginTop:14,backgroundColor:'#0d6b50',paddingHorizontal:13,paddingVertical:10,borderRadius:10},expandText:{fontSize:11,fontWeight:'700',color:'#fff'},providerCard:{marginTop:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea',borderRadius:15,padding:15},providerName:{flex:1,fontSize:14,fontWeight:'800',color:'#23382d'},distance:{fontSize:10,fontWeight:'700',color:'#52675b'},providerService:{fontSize:11,color:'#0c7152',fontWeight:'700',marginTop:6},providerDescription:{fontSize:11,lineHeight:16,color:'#6a7971',marginTop:7},price:{fontSize:11,fontWeight:'700',color:'#24392e',marginTop:12},available:{fontSize:10,fontWeight:'700',color:'#167248',marginTop:12},unavailable:{fontSize:10,fontWeight:'600',color:'#8a6a26',marginTop:12},bookButton:{alignSelf:'flex-start',marginTop:12,backgroundColor:'#0d7153',paddingVertical:9,paddingHorizontal:13,borderRadius:10},bookText:{fontSize:10,fontWeight:'800',color:'#fff'},quoteOnly:{fontSize:10,color:'#7a877f',marginTop:12},footer:{textAlign:'center',marginTop:35,fontSize:9,letterSpacing:1.5,fontWeight:'700',color:'#94a39a'},
});
