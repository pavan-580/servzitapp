import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from './Icon';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = 'Verified',
  size = 'md',
  style,
}) => {
  const isSm = size === 'sm';
  return (
    <View style={[styles.verifiedBadge, isSm && styles.verifiedBadgeSm, style]}>
      <View style={[styles.checkCircle, isSm && styles.checkCircleSm]}>
        <Text style={[styles.checkText, isSm && styles.checkTextSm]}>✓</Text>
      </View>
      <Text style={[styles.verifiedLabel, isSm && styles.verifiedLabelSm]}>{label}</Text>
    </View>
  );
};

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount,
  size = 'md',
  style,
}) => {
  const isSm = size === 'sm';
  return (
    <View style={[styles.ratingBadge, isSm && styles.ratingBadgeSm, style]}>
      <Icon name="star" size={isSm ? 11 : 13} color={Colors.accentAmberDark} />
      <Text style={[styles.ratingText, isSm && styles.ratingTextSm]}>
        {rating.toFixed(1)}
      </Text>
      {reviewCount !== undefined ? (
        <Text style={[styles.reviewCountText, isSm && styles.reviewCountTextSm]}>
          ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
};

interface DistanceBadgeProps {
  distanceMeters: number;
  style?: ViewStyle;
}

export const DistanceBadge: React.FC<DistanceBadgeProps> = ({ distanceMeters, style }) => {
  const formatted =
    distanceMeters < 1000
      ? `${Math.round(distanceMeters)}m`
      : `${(distanceMeters / 1000).toFixed(1)} km`;

  return (
    <View style={[styles.distanceBadge, style]}>
      <Icon name="location" size={11} color={Colors.textTertiary} />
      <Text style={styles.distanceText}>{formatted}</Text>
    </View>
  );
};

interface StatusPillProps {
  status: 'available_now' | 'outside_hours' | 'busy';
  style?: ViewStyle;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, style }) => {
  const isAvailable = status === 'available_now';
  return (
    <View
      style={[
        styles.statusPill,
        isAvailable ? styles.statusAvailable : styles.statusOutside,
        style,
      ]}
    >
      <View
        style={[
          styles.statusDot,
          isAvailable ? styles.statusDotAvailable : styles.statusDotOutside,
        ]}
      />
      <Text
        style={[
          styles.statusText,
          isAvailable ? styles.statusTextAvailable : styles.statusTextOutside,
        ]}
      >
        {isAvailable ? 'Available Now' : 'Outside Hours'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.verifiedBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 4,
  },
  verifiedBadgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.verified,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSm: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: -1,
  },
  checkTextSm: {
    fontSize: 8,
  },
  verifiedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 0.2,
  },
  verifiedLabelSm: {
    fontSize: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentAmberLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    gap: 3,
  },
  ratingBadgeSm: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accentAmberDark,
  },
  ratingTextSm: {
    fontSize: 11,
  },
  reviewCountText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  reviewCountTextSm: {
    fontSize: 10,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 5,
  },
  statusAvailable: {
    backgroundColor: Colors.successLight,
  },
  statusOutside: {
    backgroundColor: Colors.surfaceMuted,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotAvailable: {
    backgroundColor: Colors.success,
  },
  statusDotOutside: {
    backgroundColor: Colors.textTertiary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusTextAvailable: {
    color: Colors.success,
  },
  statusTextOutside: {
    color: Colors.textTertiary,
  },
});

