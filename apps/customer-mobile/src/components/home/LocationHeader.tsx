import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppMode } from '../../context/AppModeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors, Radius, Typography } from '../../theme/tokens';
import { Icon } from '../common/Icon';

interface LocationHeaderProps {
  locality: string;
  city: string;
  pincode?: string;
  onPressLocation: () => void;
  onPressProfile: () => void;
  userInitial?: string;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({
  locality,
  city,
  pincode,
  onPressLocation,
  onPressProfile,
  userInitial = 'S',
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { mode, setMode } = useAppMode();

  const handleToggleMode = async () => {
    const nextMode = mode === 'customer' ? 'provider' : 'customer';
    await setMode(nextMode);
    router.replace('/(tabs)');
  };

  // PhonePe-style Radar Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.6,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim, opacityAnim]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
      
      {/* Location Selector (Left) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change location"
        onPress={onPressLocation}
        style={styles.locationContainer}
      >
        {/* Animated PhonePe-Style Radar Pin */}
        <View style={styles.pinWrapper}>
          <Animated.View
            style={[
              styles.radarWave,
              {
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          <View style={styles.pinCircle}>
            <Icon name="location" size={15} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.textWrapper}>
          <View style={styles.kickerRow}>
            <Text style={styles.kicker}>{t.yourNeighbourhood}</Text>
            <Icon name="chevron-down" size={12} color={Colors.primaryDark} />
          </View>
          <Text numberOfLines={1} style={styles.locationTitle}>
            {locality ? `${locality}, ${city}` : 'Select premises'}
            {pincode ? ` • ${pincode}` : ''}
          </Text>
        </View>
      </Pressable>

      {/* Right Controls: Direct Mode Switcher & Language Switcher */}
      <View style={styles.rightActions}>
        
        {/* 1-Tap Partner / Customer Direct Mode Toggle */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch between customer and partner mode"
          onPress={handleToggleMode}
          style={[
            styles.modeTogglePill,
            mode === 'provider' ? styles.modePillProvider : styles.modePillCustomer,
          ]}
        >
          <Text style={styles.modeIcon}>{mode === 'provider' ? '🏠' : '⚡'}</Text>
          <Text style={styles.modeLabel}>
            {mode === 'provider' ? 'Customer' : 'Partner'}
          </Text>
        </Pressable>

        {/* Quick Language Switcher Pills */}
        <View style={styles.langPillsWrap}>
          {(['en', 'te', 'hi'] as const).map((l) => (
            <Pressable
              key={l}
              onPress={() => setLanguage(l)}
              style={[
                styles.langBtn,
                language === l && styles.langBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.langBtnText,
                  language === l && styles.langBtnTextActive,
                ]}
              >
                {l === 'en' ? 'EN' : l === 'te' ? 'తె' : 'हि'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* User Profile Avatar */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile settings"
          onPress={onPressProfile}
          style={styles.avatarButton}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial.toUpperCase()}</Text>
          </View>
          <View style={styles.notificationDot} />
        </Pressable>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  pinWrapper: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    position: 'relative',
  },
  radarWave: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  textWrapper: {
    flex: 1,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  kicker: {
    ...Typography.kicker,
    color: Colors.primaryDark,
    fontSize: 9,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1.2,
    gap: 4,
  },
  modePillCustomer: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.primary,
  },
  modePillProvider: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  modeIcon: {
    fontSize: 11,
  },
  modeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  langPillsWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.full,
    padding: 2,
    gap: 1,
  },
  langBtn: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  langBtnActive: {
    backgroundColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  langBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  notificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentAmber,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
