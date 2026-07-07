import { useAuth } from '@/contexts/auth';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { useAlert } from '@/ui/AlertProvider';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WithdrawScreen() {
  const { user, withdraw } = useAuth();
  const { colors } = useTheme();
  const showAlert = useAlert();
  const styles = createStyles(colors);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const isLocal = user?.provider === 'LOCAL';

  const doWithdraw = async () => {
    setBusy(true);
    try {
      await withdraw(isLocal ? password : undefined);
      router.replace('/login');
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message ?? '회원 탈퇴에 실패했습니다.')
        : '회원 탈퇴에 실패했습니다.';
      showAlert('탈퇴 실패', msg, undefined, { variant: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = () => {
    if (isLocal && !password) {
      showAlert('입력 필요', '본인 확인을 위해 비밀번호를 입력하세요.', undefined, { variant: 'warning' });
      return;
    }
    showAlert(
      '정말 탈퇴하시겠어요?',
      '탈퇴하면 계정과 분석 이력, 차단 번호, 대화 기록이 모두 삭제되며 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴하기', style: 'destructive', onPress: doWithdraw },
      ],
      { variant: 'danger' },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>회원 탈퇴</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.warning}>
          탈퇴하면 계정 정보, 분석·대화 이력, 차단 번호가 모두 삭제되며 복구할 수 없어요.
        </Text>

        {isLocal && (
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        )}

        <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={busy}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>탈퇴하기</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    back: { color: c.textMuted, fontSize: 15 },
    title: { color: c.text, fontSize: 18, fontWeight: 'bold' },
    inner: { flex: 1, paddingHorizontal: 24, paddingTop: 12, gap: 14 },
    warning: { color: c.textSecondary, fontSize: 14, lineHeight: 20 },
    input: {
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: c.text,
      fontSize: 15,
    },
    btn: {
      backgroundColor: c.danger,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 6,
    },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  });
}
