import { useAuth } from '@/contexts/auth';
import { isGoogleCancel, signInWithGoogle } from '@/native/googleAuth';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { useAlert } from '@/ui/AlertProvider';
import { GoogleSignInButton } from '@/ui/GoogleSignInButton';
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

export default function RegisterScreen() {
  const { register, loginWithGoogleToken } = useAuth();
  const { colors } = useTheme();
  const showAlert = useAlert();
  const styles = createStyles(colors);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const onSubmit = async () => {
    if (!nickname || !email || !password) {
      showAlert('입력 필요', '닉네임, 이메일, 비밀번호를 모두 입력하세요.', undefined, { variant: 'warning' });
      return;
    }
    setBusy(true);
    try {
      await register(nickname.trim(), email.trim(), password);
      showAlert(
        '회원가입 완료',
        '이제 로그인해 주세요!',
        [{ text: '확인', onPress: () => router.replace('/login') }],
        { variant: 'success' },
      );
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message ?? '회원가입에 실패했습니다.')
        : '회원가입에 실패했습니다.';
      showAlert('회원가입 실패', msg, undefined, { variant: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  // 구글 계정으로 가입 = 로그인과 동일 요청(신규면 백엔드가 자동 가입)
  const onGoogleSignIn = async () => {
    setGoogleBusy(true);
    try {
      const idToken = await signInWithGoogle();
      if (!idToken) return; // 사용자가 취소함
      await loginWithGoogleToken(idToken);
      router.replace('/');
    } catch (e) {
      if (isGoogleCancel(e)) return;
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message ?? 'Google 가입에 실패했습니다.')
        : 'Google 가입에 실패했습니다.';
      showAlert('가입 실패', msg, undefined, { variant: 'danger' });
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>계정을 만들고 피싱 탐지를 시작하세요</Text>

        <TextInput
          style={styles.input}
          placeholder="닉네임"
          placeholderTextColor={colors.textFaint}
          value={nickname}
          onChangeText={setNickname}
        />
        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={colors.textFaint}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={busy}>
          {busy ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.btnText}>회원가입</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSignInButton onPress={onGoogleSignIn} busy={googleBusy} />

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.link}>이미 계정이 있으신가요? 로그인</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 14 },
    title: { fontSize: 30, fontWeight: 'bold', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginBottom: 12 },
    input: {
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: c.text,
      fontSize: 15,
    },
    btn: {
      backgroundColor: c.accent,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 6,
    },
    btnText: { color: c.accentText, fontSize: 16, fontWeight: 'bold' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
    dividerText: { color: c.textFaint, fontSize: 13 },
    link: { color: c.textMuted, textAlign: 'center', marginTop: 16, fontSize: 14 },
  });
}
