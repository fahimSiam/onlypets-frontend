import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setLoading(true);
    // TODO: implement backend POST /auth/forgot-password
    // For now show success message immediately
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, paddingTop: insets.top }}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ paddingHorizontal: 16, paddingVertical: 14 }}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
        {/* Icon */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔐</Text>
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 28, marginBottom: 8 }}>
            Forgot password?
          </Text>
          <Text style={{ color: Colors.muted, fontSize: 15, lineHeight: 22 }}>
            No worries! Enter your email address and we'll send you a reset link.
          </Text>
        </View>

        {sent ? (
          /* Success state */
          <View style={{
            backgroundColor: Colors.success + '22',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: Colors.success + '44',
            alignItems: 'center',
            gap: 10,
          }}>
            <Text style={{ fontSize: 32 }}>📧</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
              Check your email!
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              We've sent reset instructions to{' '}
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{email}</Text>
              . Check your inbox (and spam folder).
            </Text>
          </View>
        ) : (
          /* Email input */
          <View>
            <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              placeholder="you@example.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSend}
              style={{
                backgroundColor: Colors.surfaceDark,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#FFFFFF',
                fontSize: 15,
                borderWidth: error ? 1 : 0,
                borderColor: error ? Colors.danger : 'transparent',
              }}
            />
            {error && (
              <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 6 }}>{error}</Text>
            )}

            <TouchableOpacity
              onPress={handleSend}
              disabled={loading}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 20,
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Send Reset Email</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Back to login */}
        <TouchableOpacity
          onPress={() => router.replace('/auth/login' as any)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 }}
        >
          <Ionicons name="arrow-back" size={14} color={Colors.muted} />
          <Text style={{ color: Colors.muted, fontSize: 14 }}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
