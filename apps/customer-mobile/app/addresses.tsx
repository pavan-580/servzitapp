import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { authenticatedFetch } from '../src/auth/session';

type Address = { id: string; label: string; addressLines: string[]; localityName: string | null; postalCode: string | null; lat: number; lng: number; isDefault: boolean };

export default function AddressesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Address[]>([]);
  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await authenticatedFetch('/me/addresses');
      if (!response.ok) throw new Error(response.status === 401 ? 'Sign in to manage saved addresses.' : 'Saved addresses could not be loaded. Try again.');
      const payload = await response.json() as { items: Address[] };
      setItems(payload.items);
    } catch (e) { setError(e instanceof Error ? e.message : 'Saved addresses could not be loaded.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function captureLocation() {
    setError(null); setNotice(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') { setError('Location permission is required to attach accurate coordinates to this address.'); return; }
      const point = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoordinates({ lat: point.coords.latitude, lng: point.coords.longitude });
      setNotice('Current coordinates captured. Add the address details below.');
    } catch { setError('Your location could not be read. Try again or use a map-based address selector when maps are configured.'); }
  }

  async function save() {
    if (!address.trim()) { setError('Enter an address or locality description.'); return; }
    if (!coordinates) { setError('Capture your current location before saving this address.'); return; }
    setSaving(true); setError(null); setNotice(null);
    try {
      const response = await authenticatedFetch('/me/addresses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() || 'Other', addressLines: [address.trim()], lat: coordinates.lat, lng: coordinates.lng }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Sign in to save an address.' : 'The address could not be saved. Check the details and retry.');
      setAddress(''); setCoordinates(null); setNotice('Address saved.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'The address could not be saved.'); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const response = await authenticatedFetch(`/me/addresses/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('This address could not be removed. Try again.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'This address could not be removed.'); }
  }

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹  Back</Text></Pressable>
    <Text style={styles.kicker}>YOUR SERVZ’IT ACCOUNT</Text><Text style={styles.title}>Saved addresses</Text>
    <Text style={styles.subtitle}>Save a place with its real coordinates so nearby discovery can use it accurately.</Text>
    <View style={styles.form}>
      <Text style={styles.label}>LABEL</Text><TextInput value={label} onChangeText={setLabel} style={styles.input} maxLength={40} accessibilityLabel="Address label" />
      <Text style={styles.label}>ADDRESS</Text><TextInput value={address} onChangeText={setAddress} style={[styles.input, styles.multiline]} multiline maxLength={600} placeholder="House, street, locality" accessibilityLabel="Address details" />
      <Pressable accessibilityRole="button" onPress={captureLocation} style={styles.secondary}><Text style={styles.secondaryText}>{coordinates ? 'Capture location again' : 'Use current location'}</Text></Pressable>
      {coordinates ? <Text style={styles.coordinate}>Coordinates captured: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</Text> : null}
      <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={[styles.primary, saving && styles.disabled]}>{saving ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>Save address</Text>}</Pressable>
    </View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}{notice ? <Text style={styles.notice}>{notice}</Text> : null}
    <View style={styles.listHeader}><Text style={styles.sectionTitle}>Your places</Text><Pressable accessibilityRole="button" onPress={() => void load()}><Text style={styles.refresh}>Refresh</Text></Pressable></View>
    {loading ? <ActivityIndicator style={{ marginTop: 22 }} color="#0d7153" accessibilityLabel="Loading saved addresses"/> : null}
    {!loading && items.length === 0 ? <Text style={styles.empty}>No saved addresses yet.</Text> : null}
    {items.map((item) => <View key={item.id} style={styles.card}>
      <View style={styles.cardHeading}><Text style={styles.cardTitle}>{item.label}</Text>{item.isDefault ? <Text style={styles.default}>DEFAULT</Text> : null}</View>
      <Text style={styles.cardText}>{item.addressLines.join(', ')}</Text>
      <Text style={styles.coordinate}>{item.localityName ? `${item.localityName} · ` : ''}{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</Text>
      <Pressable accessibilityRole="button" onPress={() => void remove(item.id)} style={styles.remove}><Text style={styles.removeText}>Remove address</Text></Pressable>
    </View>)}
  </ScrollView>;
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:'#f8faf8'},content:{paddingTop:54,paddingHorizontal:22,paddingBottom:38},back:{paddingVertical:8,alignSelf:'flex-start'},backText:{color:'#315c49',fontWeight:'700',fontSize:14},kicker:{marginTop:26,color:'#0d7153',letterSpacing:1.5,fontSize:9,fontWeight:'800'},title:{marginTop:9,color:'#152923',fontSize:29,fontWeight:'800',letterSpacing:-.6},subtitle:{marginTop:8,color:'#65776e',fontSize:12,lineHeight:18},form:{marginTop:19,backgroundColor:'#fff',padding:16,borderWidth:1,borderColor:'#e8eeea',borderRadius:16},label:{marginTop:10,color:'#53675c',fontWeight:'800',fontSize:9,letterSpacing:1.1},input:{marginTop:7,minHeight:47,borderWidth:1,borderColor:'#dfe9e2',borderRadius:12,paddingHorizontal:12,color:'#1d3428',fontSize:13},multiline:{minHeight:76,paddingTop:12,textAlignVertical:'top'},secondary:{alignSelf:'flex-start',marginTop:13,paddingHorizontal:13,paddingVertical:10,backgroundColor:'#e5f3eb',borderRadius:10},secondaryText:{fontSize:11,fontWeight:'800',color:'#0d7153'},coordinate:{fontSize:10,color:'#738279',marginTop:8},primary:{marginTop:14,minHeight:46,borderRadius:12,backgroundColor:'#0d7153',alignItems:'center',justifyContent:'center'},disabled:{opacity:.6},primaryText:{fontSize:12,fontWeight:'800',color:'#fff'},error:{marginTop:13,color:'#a5342b',backgroundColor:'#fff0ed',padding:11,borderRadius:10,fontSize:11,lineHeight:17},notice:{marginTop:13,color:'#236847',backgroundColor:'#e5f3eb',padding:11,borderRadius:10,fontSize:11,lineHeight:17},listHeader:{marginTop:27,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{fontSize:17,fontWeight:'800',color:'#1c3028'},refresh:{fontSize:11,fontWeight:'700',color:'#0d7153'},empty:{marginTop:13,color:'#718078',fontSize:12},card:{marginTop:11,backgroundColor:'#fff',borderWidth:1,borderColor:'#e8eeea',borderRadius:14,padding:14},cardHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},cardTitle:{fontSize:13,fontWeight:'800',color:'#23382d'},default:{fontSize:8,letterSpacing:1,fontWeight:'800',color:'#0d7153'},cardText:{fontSize:11,lineHeight:16,color:'#5d7066',marginTop:7},remove:{alignSelf:'flex-start',marginTop:10,paddingVertical:5},removeText:{fontSize:10,fontWeight:'700',color:'#a5342b'}});
