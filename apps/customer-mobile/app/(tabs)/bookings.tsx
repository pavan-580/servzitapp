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

export default function BookingsTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'quotations'>('upcoming');

  const activeJob = {
    id: 'bk-9021',
    serviceName: 'General Electrical Inspection & Troubleshooting',
    businessName: 'Sri Sai Electrical & Power Solutions',
    technicianName: 'Ramesh Kumar (Certified Wireman)',
    status: 'on_the_way',
    statusLabel: 'Technician on the way',
    scheduledTime: 'Today, 4:30 PM',
    address: 'Flat 402, Sai Residency, Madhapur, Hyderabad',
    totalPrice: '₹199',
    pricingType: 'Inspection Charge',
    currentStep: 4,
  };

  const steps = [
    { title: 'Request Sent', desc: 'Received by provider' },
    { title: 'Accepted', desc: 'Technician assigned' },
    { title: 'Confirmed', desc: 'Slot locked' },
    { title: 'On the Way', desc: 'Arriving in ~15 mins' },
    { title: 'Work In Progress', desc: 'Service ongoing' },
    { title: 'Completed', desc: 'OTP verification' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 38) + 8 }]}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>Manage appointments & track active jobs</Text>

        {/* Filter Switcher */}
        <View style={styles.filterRow}>
          {[
            { id: 'upcoming', label: 'Active (1)' },
            { id: 'completed', label: 'Completed (4)' },
            { id: 'quotations', label: 'Quotes (0)' },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setFilter(tab.id as typeof filter)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filter === 'upcoming' && (
          <>
            {/* Live Active Job Card with Timeline */}
            <View style={styles.activeJobCard}>
              <View style={styles.jobTopRow}>
                <View style={styles.liveIndicator}>
                  <View style={styles.livePulse} />
                  <Text style={styles.liveText}>ACTIVE SERVICE</Text>
                </View>
                <Text style={styles.jobId}>#{activeJob.id}</Text>
              </View>

              <Text style={styles.jobServiceTitle}>{activeJob.serviceName}</Text>
              <Text style={styles.jobBusinessName}>
                {activeJob.businessName}
              </Text>
              <Text style={styles.jobTechName}>
                Assigned: {activeJob.technicianName}
              </Text>

              {/* Status Timeline */}
              <View style={styles.timelineContainer}>
                <Text style={styles.timelineHeader}>SERVICE PROGRESS</Text>
                {steps.map((st, idx) => {
                  const stepNumber = idx + 1;
                  const isDone = stepNumber < activeJob.currentStep;
                  const isCurrent = stepNumber === activeJob.currentStep;
                  return (
                    <View key={idx} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View
                          style={[
                            styles.timelineDot,
                            isDone && styles.timelineDotDone,
                            isCurrent && styles.timelineDotCurrent,
                          ]}
                        >
                          {isDone ? (
                            <Text style={styles.checkMark}>✓</Text>
                          ) : (
                            <Text style={styles.stepNum}>{stepNumber}</Text>
                          )}
                        </View>
                        {idx < steps.length - 1 ? (
                          <View
                            style={[
                              styles.timelineLine,
                              isDone && styles.timelineLineDone,
                            ]}
                          />
                        ) : null}
                      </View>
                      <View style={styles.timelineTextWrap}>
                        <Text
                          style={[
                            styles.stepTitle,
                            (isDone || isCurrent) && styles.stepTitleActive,
                          ]}
                        >
                          {st.title}
                        </Text>
                        <Text style={styles.stepDesc}>{st.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Service Address & Scheduled Time */}
              <View style={styles.jobDetailsBox}>
                <View style={styles.detailRow}>
                  <Icon name="clock" size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{activeJob.scheduledTime}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="location" size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {activeJob.address}
                  </Text>
                </View>
              </View>

              {/* Actions Footer */}
              <View style={styles.jobActionsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/(tabs)/inbox')}
                  style={styles.chatActionBtn}
                >
                  <Icon name="chat" size={16} color={Colors.primary} />
                  <Text style={styles.chatActionText}>Chat</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={styles.callActionBtn}
                >
                  <Icon name="phone" size={16} color="#FFFFFF" />
                  <Text style={styles.callActionText}>Call Technician</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {filter === 'completed' && (
          <View style={styles.pastList}>
            {[
              {
                service: 'Split AC Deep Jet Foam Cleaning',
                business: 'Hyderabad Cool Tech AC Services',
                date: '24 Oct 2026',
                amount: '₹499',
                status: 'Completed',
              },
              {
                service: 'Bathroom Drain Blockage Removal',
                business: 'Krishna River Plumbing Solutions',
                date: '12 Sep 2026',
                amount: '₹249',
                status: 'Completed',
              },
            ].map((item, idx) => (
              <View key={idx} style={styles.pastCard}>
                <View style={styles.pastRow}>
                  <Text style={styles.pastService}>{item.service}</Text>
                  <Text style={styles.pastAmount}>{item.amount}</Text>
                </View>
                <Text style={styles.pastBusiness}>{item.business}</Text>
                <View style={styles.pastFooter}>
                  <Text style={styles.pastDate}>{item.date}</Text>
                  <View style={styles.statusSuccessBadge}>
                    <Text style={styles.statusSuccessText}>{item.status}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push('/providers')}
                  style={styles.rebookBtn}
                >
                  <Text style={styles.rebookText}>Book Again</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {filter === 'quotations' && (
          <View style={styles.emptyContainer}>
            <Icon name="calendar" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Pending Quotations</Text>
            <Text style={styles.emptyDesc}>
              When you request customized pricing for large jobs, provider
              estimates will show here.
            </Text>
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
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  filterTab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  activeJobCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    padding: 16,
    ...Shadows.md,
  },
  jobTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 5,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  jobId: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  jobServiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  jobBusinessName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  jobTechName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  timelineContainer: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 14,
  },
  timelineHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.textTertiary,
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timelineDotCurrent: {
    backgroundColor: Colors.accentAmberDark,
    borderColor: Colors.accentAmberDark,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  timelineLine: {
    width: 2,
    height: 22,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  timelineLineDone: {
    backgroundColor: Colors.primary,
  },
  timelineTextWrap: {
    flex: 1,
    paddingBottom: 14,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  stepTitleActive: {
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  jobDetailsBox: {
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  jobActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 6,
  },
  chatActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  callActionBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    gap: 6,
  },
  callActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pastList: {
    gap: 12,
  },
  pastCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Shadows.sm,
  },
  pastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  pastService: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  pastAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  pastBusiness: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  pastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pastDate: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  statusSuccessBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusSuccessText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  rebookBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  rebookText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});

