import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { aiService, type ChatTurn } from '../../services/aiService';
import { COLORS } from '../../utils/theme';

const SUGGESTIONS = ['Which batches expire soon?', 'Show recent recalls', 'What are my highest-risk batches?', 'Will any stock run low?'];

type Msg = ChatTurn & { id: string };

export default function AssistantScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'welcome', role: 'assistant', content: 'Hi! Ask me about your inventory, expiring batches, recalls, transfers or risks.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    const history = messages.filter((m) => m.id !== 'welcome').map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { id: `${Date.now()}u`, role: 'user', content: message }]);
    setInput('');
    setBusy(true);
    try {
      const res = await aiService.chat(message, history);
      setMessages((m) => [...m, { id: `${Date.now()}a`, role: 'assistant', content: res.answer }]);
    } catch {
      setMessages((m) => [...m, { id: `${Date.now()}e`, role: 'assistant', content: 'Sorry, I could not reach the server. Check your connection and try again.' }]);
    } finally {
      setBusy(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Back" style={styles.back}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Answers use only data your role can see</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.bot]}>
              <Text style={item.role === 'user' ? styles.userText : styles.botText}>{item.content}</Text>
            </View>
          )}
          ListFooterComponent={
            busy ? (
              <View style={[styles.bubble, styles.bot]}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : messages.length <= 1 ? (
              <View style={styles.chips}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s} style={styles.chip} onPress={() => send(s)}>
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
        />
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question…"
            placeholderTextColor={COLORS.subtitle}
            style={styles.input}
            maxLength={1000}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <TouchableOpacity style={[styles.send, (!input.trim() || busy) && { opacity: 0.5 }]} onPress={() => send(input)} disabled={!input.trim() || busy} accessibilityLabel="Send">
            <MaterialIcons name="send" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
  back: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.subtitle },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  user: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  bot: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  userText: { color: COLORS.white, fontSize: 15, lineHeight: 21 },
  botText: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.white },
  chipText: { color: COLORS.text, fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
  input: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.text },
  send: { width: 48, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});
