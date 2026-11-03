import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppMode } from '../../context/AppModeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors, Radius, Shadows, Typography } from '../../theme/tokens';
import { Icon } from './Icon';

interface RoleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useLanguage();
  const { mode, setMode } = useAppMode();

  const handleSelectMode = async (selected: 'customer' | 'provider') => {
    await setMode(selected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SERVZ'IT</Text>
          </View>

          <Text style={styles.title}>{t.chooseRoleTitle}</Text>
          <Text style={styles.subTitle}>
            One unified app for Indian households and verified local businesses.
            Switch anytime.
          </Text>

          {/* Option 1: Customer */}
          <Pressable
            accessibilityRole="button"
            onPress={() => handleSelectMode('customer')}
            style={[
              styles.optionCard,
              mode === 'customer' && styles.optionCardActive,
            ]}
          >
            <View style={styles.optionIconBox}>
              <Text style={{ fontSize: 24 }}>🏠</Text>
            </View>
            <View style={styles.optionTextCol}>
              <View style={styles.optionHeaderRow}>
                <Text style={styles.optionTitle}>{t.iNeedService}</Text>
                {mode === 'customer' ? (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.optionDesc}>{t.iNeedServiceDesc}</Text>
            </View>
          </Pressable>

          {/* Option 2: Provider / Partner */}
          <Pressable
            accessibilityRole="button"
            onPress={() => handleSelectMode('provider')}
            style={[
              styles.optionCard,
              mode === 'provider' && styles.optionCardActive,
            ]}
          >
            <View
              style={[
                styles.optionIconBox,
                { backgroundColor: Colors.accentAmberLight },
              ]}
            >
              <Text style={{ fontSize: 24 }}>⚡</Text>
            </View>
            <View style={styles.optionTextCol}>
              <View style={styles.optionHeaderRow}>
                <Text style={styles.optionTitle}>{t.iOfferService}</Text>
                {mode === 'provider' ? (
                  <View
                    style={[
                      styles.activePill,
                      { backgroundColor: Colors.accentAmberDark },
                    ]}
                  >
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.optionDesc}>{t.iOfferServiceDesc}</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>{t.continueBtn} ›</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 22,
    alignItems: 'center',
    ...Shadows.lg,
  },
  logoBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 18,
  },
  optionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  optionCardActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activePill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

