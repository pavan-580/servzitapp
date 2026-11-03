import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { Area, POPULAR_AREAS, useLocationContext } from '../../context/LocationContext';
import { Colors, Radius, Shadows, Typography } from '../../theme/tokens';
import { Icon } from '../common/Icon';

export const AreaPickerModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const {
    currentArea,
    setCurrentArea,
    isDetecting,
    detectLocation,
    isAreaModalVisible,
    closeAreaModal,
    lastDetectedCoords,
  } = useLocationContext();

  const [search, setSearch] = useState('');

  // PhonePe-style satellite ping animation
  const radarScale = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isDetecting) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(radarScale, {
              toValue: 2.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(radarOpacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(radarScale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(radarOpacity, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isDetecting, radarScale, radarOpacity]);

  const filteredAreas = POPULAR_AREAS.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.pincode.includes(search)
  );

  const handleSelectArea = (area: Area) => {
    setCurrentArea(area);
    closeAreaModal();
  };

  const handleUseGps = async () => {
    await detectLocation();
    closeAreaModal();
  };

  return (
    <Modal
      visible={isAreaModalVisible}
      animationType="slide"
      transparent
      onRequestClose={closeAreaModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          
          {/* Sheet Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{t.selectAreaModalTitle}</Text>
              <Text style={styles.headerSub}>
                Hyderabad, Vijayawada & Visakhapatnam Premises
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={closeAreaModal}
              style={styles.closeBtn}
            >
              <Icon name="close" size={16} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* PhonePe-Style GPS Location Radar Button */}
          <Pressable
            accessibilityRole="button"
            onPress={handleUseGps}
            style={styles.gpsBtn}
          >
            <View style={styles.gpsIconWrap}>
              <Animated.View
                style={[
                  styles.radarPulse,
                  {
                    transform: [{ scale: radarScale }],
                    opacity: radarOpacity,
                  },
                ]}
              />
              {isDetecting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="location" size={18} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.gpsTextCol}>
              <Text style={styles.gpsTitle}>
                {isDetecting ? t.detectingLocation : t.useCurrentLocation}
              </Text>
              <Text style={styles.gpsSub}>
                {lastDetectedCoords
                  ? `GPS Locked: ${lastDetectedCoords.lat.toFixed(4)}° N, ${lastDetectedCoords.lng.toFixed(4)}° E`
                  : 'Instant satellite premises detection via PostGIS'}
              </Text>
            </View>
            <View style={styles.gpsActionPill}>
              <Text style={styles.gpsActionText}>Detect</Text>
            </View>
          </Pressable>

          {/* Search Field */}
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={Colors.textTertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t.searchAreaPlaceholder}
              placeholderTextColor={Colors.textTertiary}
              style={styles.searchInput}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')}>
                <Icon name="close" size={14} color={Colors.textTertiary} />
              </Pressable>
            ) : null}
          </View>

          {/* Locality List */}
          <Text style={styles.sectionKicker}>SUPPORTED LOCALITIES & PREMISES</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.areasList}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {filteredAreas.map((area) => {
              const isSelected = currentArea.id === area.id || currentArea.name === area.name;
              return (
                <Pressable
                  key={area.id}
                  accessibilityRole="button"
                  onPress={() => handleSelectArea(area)}
                  style={[
                    styles.areaRow,
                    isSelected && styles.areaRowSelected,
                  ]}
                >
                  <View style={styles.areaLeft}>
                    <View
                      style={[
                        styles.areaPinBox,
                        isSelected && styles.areaPinBoxSelected,
                      ]}
                    >
                      <Icon
                        name="location"
                        size={16}
                        color={isSelected ? '#FFFFFF' : Colors.primary}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.areaName,
                          isSelected && styles.areaNameSelected,
                        ]}
                      >
                        {area.name}
                      </Text>
                      <Text style={styles.areaDetails}>
                        {area.formattedAddress || `${area.city}, ${area.state} • ${area.pincode}`}
                      </Text>
                    </View>
                  </View>
                  {isSelected ? (
                    <View style={styles.selectedCheck}>
                      <Icon name="check" size={14} color="#FFFFFF" />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '82%',
    ...Shadows.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  gpsIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarPulse: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: '#34D399',
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  gpsSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  gpsActionPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  gpsActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  sectionKicker: {
    ...Typography.kicker,
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 10,
  },
  areasList: {
    maxHeight: 280,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  areaRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  areaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  areaPinBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaPinBoxSelected: {
    backgroundColor: Colors.primary,
  },
  areaName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  areaNameSelected: {
    color: Colors.primaryDark,
  },
  areaDetails: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedCheck: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
