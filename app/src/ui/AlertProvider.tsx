import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type AlertVariant = 'info' | 'success' | 'danger' | 'warning';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  variant?: AlertVariant;
}

type ShowAlertFn = (title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) => void;

const AlertContext = createContext<ShowAlertFn | undefined>(undefined);

const VARIANT_META: Record<AlertVariant, { icon: keyof typeof Ionicons.glyphMap; color: (c: ThemeColors) => string }> = {
  info: { icon: 'information-circle', color: (c) => c.accent },
  success: { icon: 'checkmark-circle', color: (c) => c.success },
  danger: { icon: 'close-circle', color: (c) => c.danger },
  warning: { icon: 'warning', color: (c) => c.warning },
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState<string | undefined>();
  const [buttons, setButtons] = useState<AlertButton[]>([{ text: '확인' }]);
  const [variant, setVariant] = useState<AlertVariant>('info');

  const showAlert = useCallback<ShowAlertFn>((t, m, b, options) => {
    setTitle(t);
    setMessage(m);
    setButtons(b && b.length > 0 ? b : [{ text: '확인' }]);
    setVariant(options?.variant ?? 'info');
    setVisible(true);
  }, []);

  const close = (btn: AlertButton) => {
    setVisible(false);
    // 모달이 닫히는 애니메이션과 겹치지 않도록 다음 틱에 실행
    setTimeout(() => btn.onPress?.(), 50);
  };

  const meta = VARIANT_META[variant];
  const iconColor = meta.color(colors);

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
              <Ionicons name={meta.icon} size={30} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <View style={styles.buttonRow}>
              {buttons.map((b, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.button,
                    b.style === 'cancel' && styles.buttonCancel,
                    b.style === 'destructive' && styles.buttonDestructive,
                    i > 0 && styles.buttonGap,
                  ]}
                  onPress={() => close(b)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      b.style === 'cancel' && styles.buttonTextCancel,
                      b.style === 'destructive' && styles.buttonTextDestructive,
                    ]}
                  >
                    {b.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(15, 17, 20, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      gap: 4,
    },
    iconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    title: { color: c.text, fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
    message: { color: c.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 },
    buttonRow: { flexDirection: 'row', marginTop: 20, width: '100%' },
    button: { flex: 1, backgroundColor: c.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
    buttonGap: { marginLeft: 8 },
    buttonText: { color: c.accentText, fontSize: 15, fontWeight: '700' },
    buttonCancel: { backgroundColor: c.background },
    buttonTextCancel: { color: c.textSecondary },
    buttonDestructive: { backgroundColor: c.danger },
    buttonTextDestructive: { color: '#FFFFFF' },
  });
}
