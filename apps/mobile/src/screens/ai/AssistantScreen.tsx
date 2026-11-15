import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { aiService, type ChatTurn } from '../../services/aiService';
import { Icon, T, haptic } from '../../ui/components';
import { brand, radius, space, useTheme } from '../../ui/theme';

const SUGGESTIONS = ['Which batches expire soon?', 'Show recent recalls', 'What are my highest-risk batches?', 'Will any stock run low?'];
type Msg = ChatTurn & { id: string };

export default function AssistantScreen() {
  const navigation = useNavigation<any>();
  const { c } = useTheme();
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'w', role: 'assistant', content: "Hi! I'm PharmaGuard AI. Ask me about your inventory, expiring batches, recalls, transfers or risks." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef<FlatList<Msg>>(null);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    haptic.light();
    const history = messages.filter((m) => m.id !== 'w').map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { id: `${Date.now()}u`, role: 'user', content: message }]);
    setInput('');
    setBusy(true);
    try {
      const res = await aiService.chat(message, history);
      setMessages((m) => [...m, { id: `${Date.now()}a`, role: 'assistant', content: res.answer }]);
    } catch {
      setMessages((m) => [...m, { id: `${Date.now()}e`, role: 'assistant', content: "Sorry, I couldn't reach the server. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.surface }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Back">
          <Icon name="arrow-left" />
        </Pressable>
        <LinearGradient colors={[brand.blue, brand.green]} style={styles.botAvatar}>
          <Icon name="robot-happy-outline" size={22} color="#FFF" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <T variant="title">PharmaGuard AI</T>
          <T variant="tiny" color={c.success}>
            ● Online · uses only data your role can see
          </T>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: space.lg, gap: space.md }}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const mine = item.role === 'user';
            return (
              <View style={[styles.bubble, mine ? { alignSelf: 'flex-end', backgroundColor: brand.blue, borderBottomRightRadius: 4 } : { alignSelf: 'flex-start', backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderBottomLeftRadius: 4 }]}>
                <T color={mine ? '#FFF' : c.text} style={{ lineHeight: 22 }}>
                  {item.content}
                </T>
              </View>
            );
          }}
          ListFooterComponent={
            busy ? (
              <View style={[styles.bubble, { alignSelf: 'flex-start', backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }]}>
                <ActivityIndicator color={c.primary} />
              </View>
            ) : messages.length <= 1 ? (
              <View style={{ gap: 8, marginTop: space.sm }}>
                <T variant="tiny" muted>
                  TRY ASKING
                </T>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => send(s)} style={[styles.suggest, { borderColor: c.border, backgroundColor: c.surface }]}>
                    <Icon name="lightning-bolt-outline" size={18} color={c.primary} />
                    <T style={{ flex: 1 }}>{s}</T>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
        />
        <View style={[styles.inputBar, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about your stock…"
            placeholderTextColor={c.textSoft}
            style={[styles.input, { color: c.text, backgroundColor: c.bg }]}
            multiline
            maxLength={1000}
          />
          <Pressable onPress={() => send(input)} disabled={!input.trim() || busy} style={[styles.send, { opacity: !input.trim() || busy ? 0.4 : 1 }]} accessibilityLabel="Send">
            <LinearGradient colors={[brand.blue, brand.green]} style={styles.sendInner}>
              <Icon name="send" size={20} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  botAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '84%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.md, padding: space.md },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: space.md, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 120 },
  send: { borderRadius: 22 },
  sendInner: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
