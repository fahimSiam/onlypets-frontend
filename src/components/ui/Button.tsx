import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variants = {
  primary: { bg: '#6BC24A', text: '#FFFFFF', border: 'transparent' },
  secondary: { bg: '#2EC4B6', text: '#FFFFFF', border: 'transparent' },
  outline: { bg: 'transparent', text: '#6BC24A', border: '#6BC24A' },
  ghost: { bg: 'transparent', text: '#FFFFFF', border: 'transparent' },
  danger: { bg: '#FF4444', text: '#FFFFFF', border: 'transparent' },
};

const sizes = {
  sm: { px: 12, py: 6, fontSize: 13 },
  md: { px: 20, py: 12, fontSize: 15 },
  lg: { px: 24, py: 16, fontSize: 16 },
};

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, style, textStyle }: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[{
        backgroundColor: v.bg,
        borderWidth: v.border === 'transparent' ? 0 : 1.5,
        borderColor: v.border,
        borderRadius: 12,
        paddingHorizontal: s.px,
        paddingVertical: s.py,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        opacity: disabled ? 0.5 : 1,
      }, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[{ color: v.text, fontSize: s.fontSize, fontWeight: '600' }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
