import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Shadows } from '../../theme/tokens';
import { Icon } from '../common/Icon';

interface SearchBarHeroProps {
  onPress: () => void;
  placeholder?: string;
}

export const SearchBarHero: React.FC<SearchBarHeroProps> = ({
  onPress,
  placeholder = "Search 'Electrician', 'AC Repair', 'Plumber'...",
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search services, businesses, and properties"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.searchIconWrapper}>
        <Icon name="search" size={18} color={Colors.primary} />
      </View>
      <Text numberOfLines={1} style={styles.placeholderText}>
        {placeholder}
      </Text>
      <View style={styles.divider} />
      <View style={styles.filterButton}>
        <Icon name="filter" size={15} color={Colors.textTertiary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    ...Shadows.sm,
  },
  containerPressed: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.primaryBorder,
  },
  searchIconWrapper: {
    marginRight: 10,
  },
  placeholderText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  filterButton: {
    padding: 2,
  },
});

