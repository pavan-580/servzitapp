import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { apiBase, restoreSession, signOut, SignedInUser, storeSession } from '../src/auth/session';

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<SignedInUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => { let active = true; restoreSession().then((user) => { if (active) setExistingUser(user); }).finally(() => { if (active) setCheckingSession(false); }); return () => { active = false; }; }, []);

  async function logout() {
    setBusy(true); setError(null);
    try { await signOut(); setExistingUser(null); setNotice('You are signed out.'); }
    catch { setError('The session could not be cleared. Try again.'); }
    finally { setBusy(false); }
  }

  async function requestCode() {
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) { setError('Enter a phone number with its country code, such as +91…'); return; }
    if (!apiBase()) { setError('Sign in is unavailable because this app build has no API address.'); return; }
    setBusy(true); setError(null); setNotice(null);
    try {
      const response = await fetch(`${apiBase()}/auth/otp/request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneE164: normalized }),
      });
      const payload = await response.json() as { message?: string; messageText?: string };
      if (!response.ok) throw new Error(typeof payload.message === 'string' ? payload.message : 'Could not send a verification code. Try again.');
      setPhone(normalized); setSent(true); setNotice('If this number can receive verification, a code was sent.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send a verification code.'); }
    finally { setBusy(false); }
  }

  async function verifyCode() {
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!/^\d{4,10}$/.test(code)) { setError('Enter the verification code you received.'); return; }
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBase()}/auth/otp/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneE164: normalized, code }),
      });
      const payload = await response.json() as { accessToken?: string; refreshToken?: string; message?: string; user?: unknown };
      if (!response.ok || !payload.accessToken || !payload.refreshToken) throw new Error(typeof payload.message === 'string' ? payload.message : 'The code could not be confirmed. Check it and try again.');
      await storeSession(payload.accessToken, payload.refreshToken);
      router.replace('/');
    } catch (e) { setError(e instanceof Error ? e.message : 'The code could not be confirmed.'); }
    finally { setBusy(false); }
  }

  return <View style={styles.page}>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹  Back</Text></Pressable>
    <Text style={styles.brand}>SERVZ’IT</Text>
    {checkingSession ? <ActivityIndicator style={{ marginTop: 28 }} color="#0d7153" accessibilityLabel="Checking your sign-in status"/> : null}
    {!checkingSession && existingUser ? <>
      <Text style={styles.title}>You’re signed in.</Text>
      <Text style={styles.subtitle}>{existingUser.displayName || existingUser.phoneE164}</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.primary}><Text style={styles.primaryText}>Continue to Servz’it</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void logout()} style={styles.secondary}><Text style={styles.secondaryText}>{busy ? 'Signing out…' : 'Sign out'}</Text></Pressable>
    </> : null}
    {!checkingSession && !existingUser ? <>
    <Text style={styles.title}>Welcome to your{ '\n' }neighbourhood.</Text>
    <Text style={styles.subtitle}>Sign in with your phone to save addresses and manage your bookings.</Text>
    <Text style={styles.label}>PHONE NUMBER</Text>
    <TextInput value={phone} onChangeText={setPhone} editable={!sent && !busy} style={styles.input} placeholder="+91 98765 43210" keyboardType="phone-pad" accessibilityLabel="Phone number including country code" autoComplete="tel" />
    {sent ? <><Text style={[styles.label, { marginTop: 20 }]}>VERIFICATION CODE</Text><TextInput value={code} onChangeText={setCode} style={styles.input} placeholder="Enter code" keyboardType="number-pad" accessibilityLabel="Verification code" autoComplete="one-time-code" maxLength={10} /></> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    <Pressable accessibilityRole="button" disabled={busy} onPress={sent ? verifyCode : requestCode} style={[styles.primary, busy && styles.disabled]}>
      {busy ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>{sent ? 'Verify and continue' : 'Send verification code'}</Text>}
    </Pressable>
    {sent ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setSent(false); setCode(''); setNotice(null); }} style={styles.secondary}><Text style={styles.secondaryText}>Change phone number</Text></Pressable> : null}
    <Text style={styles.terms}>By continuing, you agree to Servz’it’s Terms and Privacy Policy.</Text>
    </> : null}
  </View>;
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:'#f8faf8',paddingHorizontal:24,paddingTop:58},back:{alignSelf:'flex-start',paddingVertical:8,paddingRight:14},backText:{color:'#315c49',fontWeight:'700',fontSize:14},brand:{marginTop:34,color:'#0d7153',letterSpacing:2.2,fontWeight:'900',fontSize:13},title:{marginTop:16,color:'#152923',fontWeight:'800',fontSize:32,lineHeight:39,letterSpacing:-.8},subtitle:{marginTop:11,color:'#65776e',fontSize:14,lineHeight:21},label:{marginTop:32,color:'#53675c',fontWeight:'800',fontSize:10,letterSpacing:1.2},input:{marginTop:8,height:54,borderWidth:1,borderColor:'#dfe9e2',borderRadius:14,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16,color:'#1d3428'},error:{marginTop:14,color:'#a5342b',backgroundColor:'#fff0ed',padding:12,borderRadius:10,fontSize:12,lineHeight:18},notice:{marginTop:14,color:'#236847',backgroundColor:'#e5f3eb',padding:12,borderRadius:10,fontSize:12,lineHeight:18},primary:{marginTop:24,minHeight:52,borderRadius:14,backgroundColor:'#0d7153',alignItems:'center',justifyContent:'center'},disabled:{opacity:.6},primaryText:{color:'#fff',fontWeight:'800',fontSize:14},secondary:{marginTop:14,alignSelf:'center',padding:10},secondaryText:{color:'#0d7153',fontSize:13,fontWeight:'700'},terms:{marginTop:'auto',marginBottom:34,textAlign:'center',fontSize:10,lineHeight:15,color:'#87948d'},
});
