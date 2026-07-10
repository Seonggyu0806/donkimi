import { removeBlockedNumberApi } from '@/api/blocklist';
import { syncBlockedNumbers } from '@/lib/blocklistSync';
import { formatPhone } from '@/lib/phone';
import {
  callBlockAvailable,
  getBlockedNumbers,
  isRoleHeld,
  removeBlockedNumber,
  requestRole,
} from '@/native/callblock';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { useAlert } from '@/ui/AlertProvider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlockListScreen() {
  const { colors } = useTheme();
  const showAlert = useAlert();
  const styles = createStyles(colors);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [roleHeld, setRoleHeld] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyRole, setBusyRole] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRoleHeld(await isRoleHeld());
      // 서버(계정) 목록과 기기 목록을 동기화. 오프라인 등으로 실패하면 기기 목록만 사용.
      const list = await syncBlockedNumbers().catch(() => getBlockedNumbers());
      setNumbers(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRequestRole = async () => {
    setBusyRole(true);
    try {
      const granted = await requestRole();
      setRoleHeld(granted);
      if (!granted) {
        showAlert('권한 필요', '통화 차단을 쓰려면 돈킴이를 "통화 스크리닝 앱"으로 지정해야 해요.', undefined, {
          variant: 'warning',
        });
      }
    } finally {
      setBusyRole(false);
    }
  };

  const onRemove = (number: string) => {
    // 저장은 숫자만(정규화된) 형태이므로, 보여줄 때만 하이픈을 붙인다
    showAlert('차단 해제', `${formatPhone(number)} 번호의 차단을 해제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        style: 'destructive',
        onPress: async () => {
          await removeBlockedNumber(number);
          setNumbers((prev) => prev.filter((n) => n !== number));
          try {
            await removeBlockedNumberApi(number);
          } catch {
            // 서버 삭제 실패 시 다음 동기화 때 계정 목록에 남아있던 번호가 기기로 다시 내려와
            // 차단이 되살아날 수 있음 — 온라인 상태에서 다시 해제하도록 안내
            showAlert(
              '동기화 실패',
              '기기에서는 차단이 해제됐지만 서버 반영에 실패했어요. 인터넷 연결 후 다시 해제해주세요.',
              undefined,
              { variant: 'warning' },
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🚫 차단 번호 관리</Text>
        <View style={{ width: 44 }} />
      </View>

      {!callBlockAvailable ? (
        <View style={styles.center}>
          <Text style={styles.empty}>
            {Platform.OS === 'android'
              ? '이 기능은 개발 빌드(dev build)에서만 사용할 수 있어요.'
              : '통화 차단은 안드로이드에서만 지원돼요.'}
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <>
          {!roleHeld && (
            <View style={styles.roleCard}>
              <Text style={styles.roleText}>
                통화 차단을 쓰려면 돈킴이를 통화 스크리닝 앱으로 지정해야 해요.
              </Text>
              <TouchableOpacity style={styles.roleBtn} onPress={onRequestRole} disabled={busyRole}>
                {busyRole ? (
                  <ActivityIndicator color={colors.accentText} />
                ) : (
                  <Text style={styles.roleBtnText}>권한 설정하기</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.noticeRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textFaint} />
            <Text style={styles.noticeText}>
              연락처에 저장된 번호는 안드로이드 정책상 차단되지 않습니다.
            </Text>
          </View>

          <FlatList
            data={numbers}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>차단한 번호가 아직 없어요.</Text>}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Ionicons name="call-outline" size={18} color={colors.textMuted} />
                <Text style={styles.itemText}>{formatPhone(item)}</Text>
                <TouchableOpacity onPress={() => onRemove(item)}>
                  <Text style={styles.removeText}>해제</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
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
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    empty: { color: c.textFaint, textAlign: 'center', marginTop: 40, fontSize: 15, paddingHorizontal: 24 },
    noticeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 16,
      marginBottom: 4,
    },
    noticeText: { flex: 1, color: c.textFaint, fontSize: 12, lineHeight: 17 },
    roleCard: {
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 16,
      gap: 10,
    },
    roleText: { color: c.textSecondary, fontSize: 14, lineHeight: 20 },
    roleBtn: { backgroundColor: c.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
    roleBtnText: { color: c.accentText, fontSize: 14, fontWeight: 'bold' },
    list: { padding: 16, gap: 8 },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    itemText: { flex: 1, color: c.textSecondary, fontSize: 15, fontWeight: '600' },
    removeText: { color: c.danger, fontSize: 14, fontWeight: '600' },
  });
}
