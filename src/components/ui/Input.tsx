import { View, TextInput, Text, TextInputProps, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, ...props }: InputProps) {
  return (
    <View style={containerStyle}>
      {label && (
        <Text style={{ color: '#888', fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#888"
        style={[{
          backgroundColor: '#1A1A1A',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: '#FFFFFF',
          fontSize: 15,
          borderWidth: error ? 1 : 0,
          borderColor: error ? '#FF4444' : 'transparent',
        }, props.style]}
        {...props}
      />
      {error && (
        <Text style={{ color: '#FF4444', fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}
