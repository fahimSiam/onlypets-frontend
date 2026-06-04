import {
  View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../src/services/auth.service';
import { paymentsService } from '../../src/services/payments.service';
import { useAuthStore } from '../../src/stores/auth.store';
import { QueryKeys } from '../../src/constants/queryKeys';
import { disconnectSocket } from '../../src/lib/socket';

export default function SettingsModal() {
  const { logout, user } = useAuthStore();

  const { data: subStatus } = useQuery({
    queryKey: QueryKeys.subscriptionStatus,
    queryFn: paymentsService.getStatus,
  });

  const handleLogout = async () => {
    await authService.logout();
    disconnectSocket();
    logout();
    router.replace('/auth/login');
  };

  const SettingRow = ({
    icon, label, value, onPress, danger,
  }: { icon: string; label: string; value?: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
          <Ionicons name={icon as any} size={18} color={danger ? '#FF4444' : '#FF6B35'} />
        </View>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      {value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#444" />
      )}
    </TouchableOpacity>
  );

  const subscriptionLabel =
    subStatus?.status === 'influencer' ? '👑 Free Forever' :
    subStatus?.status === 'active' ? '✅ Active · $1/mo' :
    subStatus?.status === 'trial' ? '🎁 Free Trial' :
    '⚠️ Expired';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile card */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 28 }}>🐾</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{user.displayName ?? user.username}</Text>
              <Text style={styles.profileUsername}>@{user.username}</Text>
            </View>
          </View>
        )}

        {/* Account section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.section}>
          <SettingRow icon="person-outline" label="Edit Profile" onPress={() => { router.back(); router.push('/modals/edit-profile' as any); }} />
          <View style={styles.divider} />
          <SettingRow icon="paw-outline" label="My Pets" onPress={() => { router.back(); }} />
          <View style={styles.divider} />
          <SettingRow icon="ribbon-outline" label="My Badges" onPress={() => { router.back(); }} />
          <View style={styles.divider} />
          <SettingRow icon="star-outline" label="Points & Rewards" onPress={() => { router.back(); }} />
        </View>

        {/* Subscription section */}
        <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
        <View style={styles.section}>
          <SettingRow
            icon="card-outline"
            label="Subscription"
            value={subscriptionLabel}
            onPress={() => router.push('/modals/subscription' as any)}
          />
        </View>

        {/* Support section */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.section}>
          <SettingRow icon="help-circle-outline" label="Help & FAQ" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="document-text-outline" label="Terms of Service" onPress={() => {}} />
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() =>
              Alert.alert('Log out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: handleLogout },
              ])
            }
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>OnlyPets v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#333',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#141414', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#222',
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FF6B3522', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FF6B35',
  },
  profileName: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  profileUsername: { color: '#666', fontSize: 13, marginTop: 2 },
  sectionLabel: {
    color: '#444', fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    marginHorizontal: 20, marginBottom: 8, marginTop: 4,
  },
  section: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: '#141414', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#222',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FF6B3515', alignItems: 'center', justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: '#FF444415' },
  rowLabel: { color: '#FFFFFF', fontSize: 15 },
  rowLabelDanger: { color: '#FF4444' },
  rowValue: { color: '#666', fontSize: 13 },
  divider: { height: 0.5, backgroundColor: '#1E1E1E', marginLeft: 60 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  logoutText: { color: '#FF4444', fontSize: 15, fontWeight: '600' },
  version: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 8 },
});
