import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/common/Icon';
import { Colors, Radius, Shadows, Typography } from '../../src/theme/tokens';

export default function InboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>('chats');

  const chats = [
    {
      id: 'c1',
      providerName: 'Sri Sai Electrical & Power Solutions',
      lastMessage: 'I have reached Madhapur signal. Will be there in 5 mins.',
      time: '12:42 PM',
      unread: 1,
      bookingRef: '#BK-9021',
      avatarBg: Colors.primaryMuted,
      initial: 'S',
    },
    {
      id: 'c2',
      providerName: 'Hyderabad Cool Tech AC Services',
      lastMessage: 'Thank you for choosing us! Hope the AC cooling is optimal.',
      time: 'Yesterday',
      unread: 0,
      bookingRef: '#BK-8840',
      avatarBg: '#ECFEFF',
      initial: 'H',
    },
  ];

  const notifications = [
    {
      id: 'n1',
      title: 'Booking Confirmed',
      desc: 'Your electrical inspection is scheduled for Today at 4:30 PM.',
      time: '1 hour ago',
      icon: 'check' as const,
    },
    {
      id: 'n2',
      title: 'Monsoon Safety Offer',
      desc: 'Use code MONSOON20 to get flat 20% off on all home rewiring.',
      time: 'Yesterday',
      icon: 'tag' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
        <Text style={styles.headerTitle}>Messages & Alerts</Text>
        <Text style={styles.headerSub}>Real-time updates from your providers</Text>

        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setActiveTab('chats')}
            style={[styles.tab, activeTab === 'chats' && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, activeTab === 'chats' && styles.tabTextActive]}
            >
              Direct Chats (1)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('notifications')}
            style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'notifications' && styles.tabTextActive,
              ]}
            >
              Notifications (2)
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {activeTab === 'chats' && (
          <View style={styles.list}>
            {chats.map((chat) => (
              <Pressable
                key={chat.id}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.chatCard,
                  pressed && styles.chatCardPressed,
                ]}
              >
                <View
                  style={[styles.chatAvatar, { backgroundColor: chat.avatarBg }]}
                >
                  <Text style={styles.chatInitial}>{chat.initial}</Text>
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatHeaderRow}>
                    <Text numberOfLines={1} style={styles.chatName}>
                      {chat.providerName}
                    </Text>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>
                  <Text style={styles.bookingRefBadge}>{chat.bookingRef}</Text>
                  <Text numberOfLines={1} style={styles.lastMessage}>
                    {chat.lastMessage}
                  </Text>
                </View>

                {chat.unread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'notifications' && (
          <View style={styles.list}>
            {notifications.map((notif) => (
              <View key={notif.id} style={styles.notifCard}>
                <View style={styles.notifIconWrap}>
                  <Icon name={notif.icon} size={18} color={Colors.primary} />
                </View>
                <View style={styles.notifInfo}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifDesc}>{notif.desc}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  list: {
    gap: 10,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    ...Shadows.sm,
  },
  chatCardPressed: {
    backgroundColor: Colors.surfaceSubtle,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  chatTime: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  bookingRefBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accentAmberDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    ...Shadows.sm,
  },
  notifIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  notifDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 5,
  },
});

