import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

export function GoogleSignInButton({ onPress, busy }: { onPress: () => void; busy?: boolean }) {
  const { colors, scheme } = useTheme();
  const styles = createStyles(colors, scheme);

  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} disabled={busy} activeOpacity={0.8}>
      {busy ? (
        <ActivityIndicator color={colors.textSecondary} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text style={styles.text}>Google로 계속하기</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function createStyles(c: ThemeColors, scheme: 'light' | 'dark') {
  return StyleSheet.create({
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: scheme === 'dark' ? c.surface : '#FFFFFF',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 14,
    },
    text: { color: c.text, fontSize: 15, fontWeight: '600' },
  });
}
