import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CategoryTile,
  CATEGORY_VISUALS,
} from '../../src/components/common/CategoryIllustration';
import { Icon } from '../../src/components/common/Icon';
import { useLanguage } from '../../src/context/LanguageContext';
import {
  MOCK_LOCAL_BUSINESSES,
  MOCK_PROPERTIES,
} from '../../src/data/mockMarketplace';
import { Colors, Radius, Shadows, Typography } from '../../src/theme/tokens';

const VERTICALS = ['All Services', 'Local Shops', 'Properties', 'Rentals'];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const [activeVertical, setActiveVertical] = useState('All Services');
  const [search, setSearch] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All Areas');

  const localities = ['All Areas', 'Madhapur', 'Gachibowli', 'Banjara Hills', 'Kondapur'];
  const categories = Object.values(CATEGORY_VISUALS);

  const filteredCategories = categories.filter((c) =>
    c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    c.nameTe.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Header with Safe Area Inset */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
        <Text style={styles.headerTitle}>Explore Marketplace</Text>
        <Text style={styles.headerSub}>
          Discover verified services, local businesses & properties
        </Text>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Icon name="search" size={17} color={Colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search categories, shops or properties..."
            placeholderTextColor={Colors.textTertiary}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Icon name="close" size={14} color={Colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>

        {/* Verticals Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {VERTICALS.map((v) => {
            const isActive = activeVertical === v;
            return (
              <Pressable
                key={v}
                onPress={() => setActiveVertical(v)}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isActive && styles.tabChipTextActive,
                  ]}
                >
                  {v}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Locality Selector */}
        <View style={styles.localityBar}>
          <Text style={styles.localityLabel}>AREA:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {localities.map((loc) => (
              <Pressable
                key={loc}
                onPress={() => setSelectedLocality(loc)}
                style={[
                  styles.localityPill,
                  selectedLocality === loc && styles.localityPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.localityPillText,
                    selectedLocality === loc && styles.localityPillTextActive,
                  ]}
                >
                  {loc}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Vertical Content */}
        {activeVertical === 'All Services' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              All Service Categories ({filteredCategories.length})
            </Text>
            <View style={styles.grid}>
              {filteredCategories.map((cat) => (
                <Pressable
                  key={cat.slug}
                  onPress={() => {
                    router.push({
                      pathname: '/category-detail',
                      params: {
                        slug: cat.slug,
                        nameEn: cat.nameEn,
                        nameTe: cat.nameTe,
                      },
                    });
                  }}
                  style={styles.gridItem}
                >
                  <CategoryTile
                    slug={cat.slug}
                    language={language}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {(activeVertical === 'Local Shops' || activeVertical === 'All Services') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verified Local Stores</Text>
            {MOCK_LOCAL_BUSINESSES.map((b) => (
              <View key={b.id} style={styles.businessCard}>
                <View style={styles.businessIcon}>
                  <Icon name="store" size={20} color={Colors.primary} />
                </View>
                <View style={styles.businessInfo}>
                  <Text style={styles.businessName}>{b.name}</Text>
                  <Text style={styles.businessCat}>
                    {b.category} • {b.locality} ({b.distanceKm} km away)
                  </Text>
                  <Text style={styles.businessOffer}>{b.offerText}</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/providers')}
                  style={styles.viewShopBtn}
                >
                  <Text style={styles.viewShopText}>View</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {(activeVertical === 'Properties' ||
          activeVertical === 'Rentals' ||
          activeVertical === 'All Services') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Properties & Housing</Text>
            {MOCK_PROPERTIES.map((p) => (
              <View key={p.id} style={styles.propertyCard}>
                <View style={styles.propRow}>
                  <View style={styles.propTag}>
                    <Text style={styles.propTagText}>
                      FOR {p.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.propPrice}>{p.priceFormatted}</Text>
                </View>
                <Text style={styles.propTitle}>{p.title}</Text>
                <Text style={styles.propMeta}>
                  {p.bhk} • {p.sqft} sqft • {p.locality}, {p.city}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  tabsScroll: {
    paddingVertical: 12,
    gap: 8,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  localityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  localityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
  },
  localityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
  },
  localityPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  localityPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  localityPillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    ...Shadows.sm,
  },
  businessIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  businessCat: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  businessOffer: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentAmberDark,
    marginTop: 2,
  },
  viewShopBtn: {
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  viewShopText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  propertyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    ...Shadows.sm,
  },
  propRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  propTag: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  propTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  propPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  propTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  propMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
});

