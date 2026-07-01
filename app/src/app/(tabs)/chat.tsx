import { sendChat } from '@/api/chat';
import axios from 'axios';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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

export default function ChatTab() {
  const [sessionId] = useState(newSessionId);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: '안녕하세요! 피싱·사기 의심 내용을 물어보세요. 위험 여부와 대처법을 알려드릴게요. 🛡️' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setBusy(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const res = await sendChat(sessionId, text);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💬 AI 챗봇 상담</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
              <Text style={m.role === 'user' ? styles.textUser : styles.textAI}>{m.content}</Text>
            </View>
          ))}
          {busy && (
            <View style={[styles.bubble, styles.bubbleAI]}>
              <ActivityIndicator color="#94A3B8" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#64748B"
            value={input}
            onChangeText={setInput}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 10 },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#FACC15' },
  bubbleAI: { alignSelf: 'flex-start', backgroundColor: '#1E293B' },
  textUser: { color: '#0F172A', fontSize: 15, lineHeight: 21 },
  textAI: { color: '#E2E8F0', fontSize: 15, lineHeight: 21 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: { backgroundColor: '#FACC15', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
  sendText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
});
