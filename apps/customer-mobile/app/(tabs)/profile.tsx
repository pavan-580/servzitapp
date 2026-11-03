import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { restoreSession, signOut, SignedInUser } from '../../src/auth/session';
import { Icon, IconName } from '../../src/components/common/Icon';
import { useAppMode } from '../../src/context/AppModeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Language } from '../../src/i18n/translations';
import { Colors, Radius, Shadows, Typography } from '../../src/theme/tokens';

export default function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { mode, toggleMode } = useAppMode();
  const [user, setUser] = useState<SignedInUser | null>(null);

  useEffect(() => {
    let active = true;
    restoreSession().then((u) => {
      if (active) setUser(u);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of SERVZ’IT?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          setUser(null);
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 38) + 8 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.slice(0, 1) || 'S'}
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {user?.displayName || 'Pavan Sai'}
          </Text>
          <Text style={styles.userPhone}>
            {user?.phoneE164 || '+91 98765 43210'}
          </Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>
              {mode === 'provider' ? 'VERIFIED SERVICE PARTNER' : 'SERVZ’IT PRIME USER'}
            </Text>
          </View>
        </View>
      </View>

      {/* Role Switcher Card (Customer <-> Partner) */}
      <View style={styles.roleCard}>
        <View style={styles.roleCardLeft}>
          <Text style={styles.roleCardTitle}>
            {mode === 'customer' ? 'Earn as a Partner?' : 'Need a Service?'}
          </Text>
          <Text style={styles.roleCardDesc}>
            {mode === 'customer'
              ? 'Receive customer leads and grow your local service business.'
              : 'Book trusted electricians, AC mechanics and home services.'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            await toggleMode();
            router.replace('/(tabs)');
          }}
          style={styles.switchRoleBtn}
        >
          <Text style={styles.switchRoleBtnText}>
            {mode === 'customer' ? t.switchToProvider : t.switchToCustomer}
          </Text>
        </Pressable>
      </View>

      {/* Language Switcher Card (English / Telugu / Hindi) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="sparkles" size={16} color={Colors.primary} />
          <Text style={styles.cardHeaderTitle}>{t.appLanguage}</Text>
        </View>
        <View style={styles.langSwitchRow}>
          {[
            { id: 'en', label: 'English' },
            { id: 'te', label: 'తెలుగు (Telugu)' },
            { id: 'hi', label: 'हिंदी (Hindi)' },
          ].map((item) => {
            const isSelected = language === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => setLanguage(item.id as Language)}
                style={[styles.langBtn, isSelected && styles.langBtnActive]}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    isSelected && styles.langBtnTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Account Settings Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>{t.myAccount}</Text>

        {[
          {
            title: t.savedAddressesMenu,
            sub: 'Home, office and secondary locations',
            icon: 'location' as IconName,
            onPress: () => router.push('/addresses'),
          },
          {
            title: t.paymentsMenu,
            sub: 'UPI, cards and cash transaction receipts',
            icon: 'tag' as IconName,
            onPress: () => Alert.alert('Payments', 'No pending invoices.'),
          },
          {
            title: t.favoriteProsMenu,
            sub: 'Saved providers in your area',
            icon: 'heart' as IconName,
            onPress: () => router.push('/providers'),
          },
        ].map((item, idx) => (
          <Pressable
            key={idx}
            accessibilityRole="button"
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <View style={styles.menuIconWrap}>
              <Icon name={item.icon} size={18} color={Colors.primary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      {/* Help & Compliance Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>SUPPORT & TRUST</Text>

        {[
          {
            title: t.helpSupportMenu,
            sub: 'Instant resolution for service issues',
            icon: 'shield-check' as IconName,
            onPress: () =>
              Alert.alert('Support', 'Calling SERVZ’IT Priority Helpline: 1800-SERVZIT'),
          },
          {
            title: t.privacyMenu,
            sub: 'Indian data privacy & consumer protection guidelines',
            icon: 'info' as IconName,
            onPress: () =>
              Alert.alert('Privacy', 'Your data is secured with AES-256 encryption.'),
          },
        ].map((item, idx) => (
          <Pressable
            key={idx}
            accessibilityRole="button"
            onPress={item.onPress}
            style={styles.menuItem}
          >
            <View style={styles.menuIconWrap}>
              <Icon name={item.icon} size={18} color={Colors.primary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      {/* Sign Out / Sign In Button */}
      <View style={styles.authActionWrap}>
        {user ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleSignOut}
            style={styles.signOutBtn}
          >
            <Text style={styles.signOutText}>{t.logOut}</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/sign-in')}
            style={styles.signInBtn}
          >
            <Text style={styles.signInText}>{t.signInRegister}</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.footerVersion}>SERVZ'IT v0.1.0 • Built for AP & Telangana</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    borderColor: Colors.border,
    marginBottom: 12,
    ...Shadows.sm,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  memberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentAmberLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    marginTop: 6,
  },
  memberBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accentAmberDark,
    letterSpacing: 0.5,
  },
  roleCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    padding: 14,
    marginBottom: 14,
    ...Shadows.sm,
  },
  roleCardLeft: {
    marginBottom: 10,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  roleCardDesc: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 15,
  },
  switchRoleBtn: {
    backgroundColor: '#1E40AF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  switchRoleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 14,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  langSwitchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  langBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  menuSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.kicker,
    color: Colors.textTertiary,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 13,
    marginBottom: 8,
    ...Shadows.sm,
  },
  menuItemPressed: {
    backgroundColor: Colors.surfaceSubtle,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  authActionWrap: {
    marginTop: 10,
    marginBottom: 16,
  },
  signOutBtn: {
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  signInBtn: {
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerVersion: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
});
