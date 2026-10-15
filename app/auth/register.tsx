import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { authService } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/stores/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Letters, numbers, _ and . only'),
  displayName: z.string().max(50).optional(),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await authService.register(data);
      setUser(result.user);
      router.replace('/tabs/feed');
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message;
      Alert.alert('Sign up failed', Array.isArray(msg) ? msg[0] : msg ?? 'Please try again.');
    }
  };

  const fields = [
    { name: 'email' as const, placeholder: 'Email address', icon: 'mail-outline', keyboard: 'email-address' as const, secure: false },
    { name: 'username' as const, placeholder: 'Username', icon: 'at-outline', keyboard: 'default' as const, secure: false },
    { name: 'displayName' as const, placeholder: 'Display name (optional)', icon: 'person-outline', keyboard: 'default' as const, secure: false },
    { name: 'password' as const, placeholder: 'Password', icon: 'lock-closed-outline', keyboard: 'default' as const, secure: true },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoPaw}>
            <Text style={{ fontSize: 32 }}>🐠</Text>
          </View>
          <Text style={styles.logoText}>OnlyPets</Text>
          <Text style={styles.logoTagline}>First 6 months completely free</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Join thousands of pet lovers</Text>

          {fields.map(({ name, placeholder, icon, keyboard, secure }) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputRow, errors[name] && styles.inputRowError]}>
                    <Ionicons name={icon as any} size={18} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={placeholder}
                      placeholderTextColor="#555"
                      keyboardType={keyboard}
                      autoCapitalize="none"
                      secureTextEntry={secure && !showPassword}
                      value={value}
                      onChangeText={onChange}
                    />
                    {secure && (
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                        <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {errors[name] && (
                    <Text style={styles.errorText}>{errors[name]?.message}</Text>
                  )}
                </View>
              )}
            />
          ))}

          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting && { opacity: 0.6 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By signing up you agree to our{' '}
            <Text style={{ color: '#6BC24A' }}>Terms</Text> &{' '}
            <Text style={{ color: '#6BC24A' }}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoPaw: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#6BC24A', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#6BC24A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  logoTagline: { fontSize: 13, color: '#44CC88', marginTop: 4, fontWeight: '500' },
  card: { backgroundColor: '#141414', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#222' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  inputWrapper: { marginBottom: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E1E', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
    paddingHorizontal: 14, height: 52,
  },
  inputRowError: { borderColor: '#FF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  errorText: { color: '#FF4444', fontSize: 12, marginTop: 5, marginLeft: 4 },
  primaryBtn: {
    backgroundColor: '#6BC24A', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: '#6BC24A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  terms: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerText: { color: '#666', fontSize: 14 },
  footerLink: { color: '#6BC24A', fontSize: 14, fontWeight: '600' },
});
