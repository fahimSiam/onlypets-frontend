import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useStripe } from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { paymentsService } from '../../src/services/payments.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/stores/auth.store';
import { useMyProfile } from '../../src/hooks/useProfile';

const BENEFITS = [
  { icon: '📸', text: 'Unlimited posts' },
  { icon: '💬', text: 'Direct messages' },
  { icon: '🐾', text: 'Swipe & match nearby pets' },
  { icon: '🏆', text: 'Full badge system' },
  { icon: '🔥', text: 'Streak tracking & rewards' },
  { icon: '⭐', text: 'Points & leaderboard' },
];

function daysRemaining(trialStartedAt: string | null): number {
  if (!trialStartedAt) return 0;
  const start = new Date(trialStartedAt).getTime();
  const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const end = start + sixMonthsMs;
  const diff = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function SubscriptionModal() {
  const insets = useSafeAreaInsets();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { data: profile } = useMyProfile();

  const { data: subStatus, isLoading: statusLoading } = useQuery({
    queryKey: QueryKeys.subscriptionStatus,
    queryFn: paymentsService.getStatus,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const { clientSecret } = await paymentsService.createSubscription();

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'OnlyPets',
        style: 'alwaysDark',
      });

      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw new Error(presentError.message);
    },
    onSuccess: () => {
      Alert.alert('Success! 🎉', 'You are now subscribed to OnlyPets Premium!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: Error) => {
      if (err.message !== 'The payment has been canceled.') {
        Alert.alert('Payment failed', err.message ?? 'Something went wrong. Please try again.');
      }
    },
  });

  const isInfluencer = profile?.subscriptionStatus === 'influencer' || subStatus?.status === 'influencer';
  const isActive = subStatus?.status === 'active';
  const isTrial = subStatus?.status === 'trial';
  const trialDays = daysRemaining(profile?.trialStartedAt ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#FFFFFF', fontWeight: '700', fontSize: 17, textAlign: 'center' }}>OnlyPets Premium</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Influencer status */}
        {isInfluencer && (
          <View style={{
            backgroundColor: Colors.primary + '22',
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            marginBottom: 24,
            borderWidth: 1,
            borderColor: Colors.primary + '44',
          }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>👑</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 20, textAlign: 'center' }}>
              You're FREE forever!
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 14, textAlign: 'center', marginTop: 6 }}>
              Your Influencer badge grants you lifetime access to all premium features.
            </Text>
          </View>
        )}

        {/* Trial countdown */}
        {isTrial && !isInfluencer && (
          <View style={{
            backgroundColor: Colors.secondary + '22',
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: Colors.secondary + '44',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
            <Text style={{ fontSize: 28 }}>{trialDays > 30 ? '🎉' : trialDays > 7 ? '⏳' : '⚠️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Free Trial Active</Text>
              <Text style={{ color: Colors.muted, fontSize: 13, marginTop: 2 }}>
                {trialDays > 0
                  ? `${trialDays} days remaining in your 6-month trial`
                  : 'Your trial has expired — subscribe to keep access'}
              </Text>
            </View>
          </View>
        )}

        {/* Active subscription */}
        {isActive && (
          <View style={{
            backgroundColor: Colors.success + '22',
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: Colors.success + '44',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            <View>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Active — $1/month</Text>
              <Text style={{ color: Colors.muted, fontSize: 13, marginTop: 2 }}>Thank you for supporting OnlyPets!</Text>
            </View>
          </View>
        )}

        {/* Headline */}
        {!isInfluencer && !isActive && (
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🐾</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 26, textAlign: 'center' }}>
              Everything you need
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 15, textAlign: 'center', marginTop: 4 }}>
              for just $1/month
            </Text>
          </View>
        )}

        {/* Benefits */}
        <View style={{
          backgroundColor: Colors.surfaceDark,
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          gap: 14,
        }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            What's included
          </Text>
          {BENEFITS.map((b) => (
            <View key={b.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{b.icon}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>{b.text}</Text>
              <Ionicons name="checkmark" size={16} color={Colors.success} style={{ marginLeft: 'auto' }} />
            </View>
          ))}
        </View>

        {/* Plan card + Subscribe */}
        {!isInfluencer && !isActive && (
          <View style={{
            backgroundColor: Colors.primary + '22',
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: Colors.primary,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>Monthly Plan</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ color: Colors.primary, fontWeight: '900', fontSize: 28 }}>$1</Text>
                <Text style={{ color: Colors.muted, fontSize: 13, marginTop: 8 }}>/mo</Text>
              </View>
            </View>
            <Text style={{ color: Colors.muted, fontSize: 13, marginBottom: 16 }}>Cancel anytime. No commitments.</Text>

            <TouchableOpacity
              onPress={() => subscribeMutation.mutate()}
              disabled={subscribeMutation.isPending || statusLoading}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: subscribeMutation.isPending ? 0.8 : 1,
              }}
            >
              {subscribeMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Subscribe for $1/month</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={{ color: Colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          By subscribing, you agree to our Terms of Service.{'\n'}
          Subscription renews monthly. Cancel anytime.
        </Text>

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
}
