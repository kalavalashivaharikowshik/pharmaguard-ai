import { Component, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type State = { error: Error | null };

/** Shows the error on screen instead of letting the app close. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('App error:', error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: '#0F4C81', padding: 24, paddingTop: 72 }}>
        <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>Something went wrong</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 16 }}>
          Please take a screenshot of this screen and share it with the developer.
        </Text>
        <ScrollView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 12 }}>
          <Text selectable style={{ color: '#FFF', fontSize: 13, fontFamily: 'monospace' }}>
            {String(error?.message ?? error)}
            {'\n\n'}
            {String(error?.stack ?? '').split('\n').slice(0, 12).join('\n')}
          </Text>
        </ScrollView>
        <Pressable onPress={() => this.setState({ error: null })} style={{ marginTop: 16, backgroundColor: '#2E8B57', borderRadius: 12, padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
