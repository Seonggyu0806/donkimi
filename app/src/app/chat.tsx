import { getConversationHistory, sendChat } from '@/api/chat';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { RichText } from '@/ui/RichText';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

function newSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 카톡/아이메시지 스타일 "입력 중..." 점 3개 바운스 애니메이션
function TypingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ]),
      );
    const anims = [bounce(dot1, 0), bounce(dot2, 150), bounce(dot3, 300)];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dot1, dot2, dot3]);

  const dotStyle = (val: Animated.Value) => ({
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color,
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: val.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 3 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // 진단 결과에서 온 맥락(type/riskLevel/summary) 또는 기존 세션(sessionId)
  const params = useLocalSearchParams<{
    type?: string;
    riskLevel?: string;
    summary?: string;
    sessionId?: string;
  }>();

  const isExisting = !!params.sessionId; // 이력에서 다시 열기
  const [sessionId] = useState(() => params.sessionId ?? newSessionId());
  const [messages, setMessages] = useState<Msg[]>(
    isExisting
      ? []
      : params.summary
        ? [{ role: 'assistant', content: params.summary }]
        : [{ role: 'assistant', content: '안녕하세요! 진단 결과나 의심되는 내용에 대해 물어보세요. 🛡️' }],
  );
  const [loadingHistory, setLoadingHistory] = useState(isExisting);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const firstSend = useRef(!isExisting); // 기존 세션이면 meta 재전송 불필요
  const scrollRef = useRef<ScrollView>(null);

  // 기존 세션이면 이전 대화 복원
  useEffect(() => {
    if (!isExisting) return;
    (async () => {
      try {
        const h = await getConversationHistory(sessionId);
        setMessages(
          (h.messages ?? []).map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        );
      } catch {
        setMessages([{ role: 'assistant', content: '이전 대화를 불러오지 못했어요.' }]);
      } finally {
        setLoadingHistory(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setBusy(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const meta =
        firstSend.current && (params.type || params.riskLevel)
          ? { type: params.type ?? 'chat', riskLevel: params.riskLevel ?? 'MEDIUM' }
          : undefined;
      firstSend.current = false;
      const res = await sendChat(sessionId, text, meta);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message ?? '답변을 가져오지 못했습니다.')
        : '답변을 가져오지 못했습니다.';
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setBusy(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>💬 AI 상담</Text>
          <View style={{ width: 44 }} />
        </View>

        {loadingHistory ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m, i) => (
              <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                <RichText style={m.role === 'user' ? styles.textUser : styles.textAI}>{m.content}</RichText>
              </View>
            ))}
            {busy && (
              <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                <TypingDots color={colors.textMuted} />
              </View>
            )}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={colors.textFaint}
            value={input}
            onChangeText={setInput}
            onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={busy}>
            <Text style={styles.sendText}>전송</Text>
          </TouchableOpacity>
        </View>
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
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    back: { color: c.textMuted, fontSize: 15 },
    headerTitle: { color: c.text, fontSize: 17, fontWeight: 'bold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 10 },
    bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleUser: { alignSelf: 'flex-end', backgroundColor: c.accent },
    bubbleAI: { alignSelf: 'flex-start', backgroundColor: c.surface },
    typingBubble: { paddingVertical: 12 },
    textUser: { color: c.accentText, fontSize: 15, lineHeight: 21 },
    textAI: { color: c.textSecondary, fontSize: 15, lineHeight: 21 },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background,
    },
    input: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      color: c.text,
      fontSize: 15,
      maxHeight: 120,
    },
    sendBtn: { backgroundColor: c.accent, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
    sendText: { color: c.accentText, fontWeight: 'bold', fontSize: 15 },
  });
}
