import React, { useMemo, useState } from 'react';
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
import { Icon } from '../src/components/common/Icon';
import { ProviderCard } from '../src/components/home/ProviderCard';
import {
  MOCK_PROVIDERS,
  POPULAR_SEARCH_TAGS,
} from '../src/data/mockMarketplace';
import { Colors, Radius, Shadows } from '../src/theme/tokens';

export default function UniversalSearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'Electrician in Madhapur',
    'AC Jet Wash',
    'Kitchen Sink Leakage',
  ]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_PROVIDERS.filter((p) => {
      const matchText =
        p.businessName.toLowerCase().includes(q) ||
        p.categoryNameEn.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.services.some((s) => s.name.toLowerCase().includes(q));

      if (!matchText) return false;
      if (onlyVerified && !p.isVerified) return false;
      if (minRating && p.rating < minRating) return false;
      if (maxDistanceKm && p.distanceKm > maxDistanceKm) return false;
      return true;
    });
  }, [query, onlyVerified, minRating, maxDistanceKm]);

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    if (!recentSearches.includes(tag)) {
      setRecentSearches([tag, ...recentSearches.slice(0, 4)]);
    }
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  return (
    <View style={styles.container}>
      {/* Top Search Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <View style={styles.searchRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to previous screen"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
          </Pressable>

          <View style={styles.searchField}>
            <Icon name="search" size={17} color={Colors.primary} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search services, pros, shops..."
              placeholderTextColor={Colors.textTertiary}
              style={styles.input}
              returnKeyType="search"
            />
            {query ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setQuery('')}
                style={styles.clearBtn}
              >
                <Icon name="close" size={14} color={Colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Filter Chips Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <Pressable
            onPress={() => setOnlyVerified(!onlyVerified)}
            style={[styles.filterChip, onlyVerified && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                onlyVerified && styles.filterChipTextActive,
              ]}
            >
              ✓ Verified Pros Only
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMinRating(minRating === 4.8 ? null : 4.8)}
            style={[styles.filterChip, minRating === 4.8 && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                minRating === 4.8 && styles.filterChipTextActive,
              ]}
            >
              ★ 4.8+ Rating
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMaxDistanceKm(maxDistanceKm === 2 ? null : 2)}
            style={[
              styles.filterChip,
              maxDistanceKm === 2 && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                maxDistanceKm === 2 && styles.filterChipTextActive,
              ]}
            >
              Under 2 km
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* If no query is typed yet, show Recent and Trending Searches */}
        {!query.trim() ? (
          <>
            {recentSearches.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <Pressable onPress={handleClearHistory}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </Pressable>
                </View>

                {recentSearches.map((item, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSelectTag(item)}
                    style={styles.recentItem}
                  >
                    <Icon name="clock" size={14} color={Colors.textTertiary} />
                    <Text style={styles.recentText}>{item}</Text>
                    <Icon name="chevron-right" size={14} color={Colors.textTertiary} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {/* Trending Local Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Near Hyderabad</Text>
              <View style={styles.tagsContainer}>
                {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSelectTag(tag)}
                    style={styles.tagChip}
                  >
                    <Icon name="sparkles" size={12} color={Colors.accentAmberDark} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* Search Results */
          <View style={styles.section}>
            <Text style={styles.resultsCount}>
              Found {searchResults.length} matching professional{searchResults.length === 1 ? '' : 's'}
            </Text>

            {searchResults.length === 0 ? (
              <View style={styles.noResultsBox}>
                <Icon name="search" size={32} color={Colors.textTertiary} />
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsDesc}>
                  Try searching for general terms like "electrician", "AC", "cleaning" or clear active filters.
                </Text>
              </View>
            ) : (
              searchResults.map((provider) => (
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
                        serviceName: provider.services[0]?.name || 'Standard Inspection',
                        price: String(provider.startingPrice),
                        pricingModel: provider.pricingModel,
                      },
                    });
                  }}
                />
              ))
            )}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  filtersScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 10,
  },
  recentText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    gap: 6,
    ...Shadows.sm,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 10,
  },
  noResultsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  noResultsDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

