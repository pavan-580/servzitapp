import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/common/Icon';
import { ProviderCard } from '../src/components/home/ProviderCard';
import { MOCK_PROVIDERS, MockProvider } from '../src/data/mockMarketplace';
import { Colors, Radius, Shadows } from '../src/theme/tokens';

type SortOption = 'nearest' | 'rating' | 'price';

export default function ProviderListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('nearest');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'electrical', label: 'Electrician' },
    { id: 'priest', label: 'Purohit & Pandit' },
    { id: 'land-sale', label: 'Plots & Land' },
    { id: 'car-rentals', label: 'Car Rentals' },
    { id: 'photography', label: 'Photography' },
    { id: 'property-rent', label: 'Flat Rentals' },
    { id: 'ac-service', label: 'AC Service' },
    { id: 'plumbing', label: 'Plumber' },
    { id: 'cleaning', label: 'Cleaning' },
  ];

  const sortedProviders = useMemo(() => {
    let list = [...MOCK_PROVIDERS];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }

    if (onlyAvailable) {
      list = list.filter((p) => p.isAvailableNow);
    }

    if (sortBy === 'nearest') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      list.sort((a, b) => a.startingPrice - b.startingPrice);
    }

    return list;
  }, [sortBy, onlyAvailable, selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <View style={styles.titleRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Verified Professionals</Text>
            <Text style={styles.headerSub}>Near Madhapur & Gachibowli, Hyderabad</Text>
          </View>
        </View>

        {/* Category Filter Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Sort & Availability Filter Bar */}
        <View style={styles.filterBar}>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>SORT BY:</Text>
            {[
              { id: 'nearest', label: 'Nearest' },
              { id: 'rating', label: 'Top Rated' },
              { id: 'price', label: 'Price' },
            ].map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSortBy(s.id as SortOption)}
                style={[
                  styles.sortBtn,
                  sortBy === s.id && styles.sortBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortBtnText,
                    sortBy === s.id && styles.sortBtnTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setOnlyAvailable(!onlyAvailable)}
            style={[
              styles.availToggle,
              onlyAvailable && styles.availToggleActive,
            ]}
          >
            <View
              style={[
                styles.availDot,
                onlyAvailable && styles.availDotActive,
              ]}
            />
            <Text
              style={[
                styles.availText,
                onlyAvailable && styles.availTextActive,
              ]}
            >
              Available Now
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Provider List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.resultsCount}>
          Showing {sortedProviders.length} verified partner{sortedProviders.length === 1 ? '' : 's'}
        </Text>

        {sortedProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onPress={() => {
              router.push({
                pathname: '/provider-detail',
                params: { id: provider.id },
              });
            }}
            onBookNow={() => {
              router.push({
                pathname: '/book-service',
                params: {
                  providerId: provider.id,
                  businessName: provider.businessName,
                  categorySlug: provider.categorySlug,
                  serviceName: provider.services[0]?.name || 'Standard Inspection',
                  price: String(provider.startingPrice),
                  pricingModel: provider.pricingModel,
                },
              });
            }}
          />
        ))}

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textTertiary,
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceMuted,
  },
  sortBtnActive: {
    backgroundColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
  },
  availToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
    gap: 5,
  },
  availToggleActive: {
    backgroundColor: Colors.successLight,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  availDotActive: {
    backgroundColor: Colors.success,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  availTextActive: {
    color: Colors.success,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
});

