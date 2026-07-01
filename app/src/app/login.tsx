import { useAuth } from '@/contexts/auth';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('입력 필요', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message ?? '로그인에 실패했습니다.')
        : '로그인에 실패했습니다.';
      Alert.alert('로그인 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>로그인</Text>
        <Text style={styles.subtitle}>돈킴이에 오신 것을 환영합니다</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#64748B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={busy}>
          {busy ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnText}>로그인</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/register')}>
          <Text style={styles.link}>계정이 없으신가요? 회원가입</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 14 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 12 },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  btn: {
    backgroundColor: '#FACC15',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  btnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#94A3B8', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
