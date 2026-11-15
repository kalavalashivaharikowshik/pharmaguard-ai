import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBackground, LogoMark } from './AuthBrand';
import { Button, Icon, type IconName, T } from '../../ui/components';
import { brand, space } from '../../ui/theme';

const { width } = Dimensions.get('window');

const SLIDES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'link-variant', title: 'Blockchain-verified medicines', text: 'Every batch has a tamper-proof fingerprint. One scan tells you if it is genuine.' },
  { icon: 'robot-happy-outline', title: 'AI-run recalls', text: 'AI agents find every affected unit, alert holders and track completion in minutes.' },
  { icon: 'shield-check', title: 'Unsafe drugs blocked', text: 'Expired, recalled or tampered stock is blocked at the counter and removed for good.' },
];

export default function WelcomeScreen({ onContinue }: { onContinue(): void }) {
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList>(null);
  const last = index === SLIDES.length - 1;

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <LogoMark size={44} animate={false} />
          <T variant="title" color="#FFF">
            PharmaGuard AI
          </T>
          <View style={{ flex: 1 }} />
          {!last && (
            <Pressable onPress={onContinue} hitSlop={10} style={{ padding: 8 }}>
              <T variant="bodyStrong" color="rgba(255,255,255,0.8)">
                Skip
              </T>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={list}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(s) => s.title}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.iconRing}>
                <View style={styles.iconInner}>
                  <Icon name={item.icon} size={72} color="#FFFFFF" />
                </View>
              </View>
              <T variant="h1" color="#FFF" center style={{ marginTop: space.xxl }}>
                {item.title}
              </T>
              <T color="rgba(255,255,255,0.8)" center style={{ marginTop: space.md, lineHeight: 23, maxWidth: 320 }}>
                {item.text}
              </T>
            </View>
          )}
        />

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          <Button
            title={last ? 'Get started' : 'Next'}
            icon={last ? 'login' : 'arrow-right'}
            variant="success"
            onPress={() => {
              if (last) onContinue();
              else {
                list.current?.scrollToIndex({ index: index + 1 });
                setIndex(index + 1);
              }
            }}
          />
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: space.xl, paddingTop: space.md },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xxl },
  iconRing: { width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  iconInner: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(46,139,87,0.55)', alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingHorizontal: space.xl, paddingBottom: space.xl, gap: space.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 26, backgroundColor: brand.greenLight },
});
