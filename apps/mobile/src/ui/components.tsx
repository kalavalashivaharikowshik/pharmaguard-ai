import { useEffect, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { brand, font, radius, shadow, space, statusTone, useTheme } from './theme';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const haptic = {
  tap: () => Haptics.selectionAsync().catch(() => undefined),
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined),
};

export function Icon({ name, size = 22, color, style }: { name: IconName; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const { c } = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? c.text} style={style} />;
}

// ------------------------------------------------------------------- text

export function T({
  children,
  variant = 'body',
  color,
  muted,
  style,
  numberOfLines,
  center,
}: {
  children: ReactNode;
  variant?: keyof typeof font;
  color?: string;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  center?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[font[variant], { color: color ?? (muted ? c.textMuted : c.text) }, center && { textAlign: 'center' }, style]}
    >
      {children}
    </Text>
  );
}

// ------------------------------------------------------------------ screen

/** Page container: safe area, themed background, optional scroll + pull-to-refresh. */
export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  padded = true,
  edges = ['top'],
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { c, isDark } = useTheme();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[padded && { padding: space.lg, paddingBottom: 120 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[brand.blue]} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padded && { padding: space.lg }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={c.bg} />
      {body}
    </SafeAreaView>
  );
}

/** Large-title header with optional back button and right action. */
export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityLabel="Back">
          <Icon name="arrow-left" size={22} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <T variant={onBack ? 'h2' : 'h1'}>{title}</T>
        {subtitle ? (
          <T variant="small" muted style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function IconButton({ icon, onPress, badge, label }: { icon: IconName; onPress?: () => void; badge?: number; label: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      hitSlop={8}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconBtn, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name={icon} size={22} />
      {!!badge && (
        <View style={[styles.dotBadge, { backgroundColor: c.danger, borderColor: c.surface }]}>
          <Text style={styles.dotBadgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

// -------------------------------------------------------------------- cards

export function Card({
  children,
  style,
  onPress,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
}) {
  const { c } = useTheme();
  const base = [{ backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border }, shadow(c, 1), padded && { padding: space.lg }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [base, pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 }]}
    >
      {children}
    </Pressable>
  );
}

/** Brand gradient hero (Deep Blue → Medical Green), like the web dashboard. */
export function GradientCard({ children, style, colors }: { children: ReactNode; style?: StyleProp<ViewStyle>; colors?: [string, string, ...string[]] }) {
  return (
    <LinearGradient
      colors={colors ?? [brand.blue, brand.blueMid, brand.green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius.lg, padding: space.xl, overflow: 'hidden' }, style]}
    >
      <View style={styles.heroBubble1} />
      <View style={styles.heroBubble2} />
      {children}
    </LinearGradient>
  );
}

const TONE_KEYS = {
  success: ['success', 'successSoft'],
  danger: ['danger', 'dangerSoft'],
  warning: ['warning', 'warningSoft'],
  info: ['info', 'infoSoft'],
  primary: ['primary', 'primarySoft'],
  neutral: ['textMuted', 'surfaceAlt'],
} as const;
export type Tone = keyof typeof TONE_KEYS;

export function useTone(tone: Tone) {
  const { c } = useTheme();
  const [fg, bg] = TONE_KEYS[tone];
  return { fg: c[fg], bg: c[bg] };
}

export function StatTile({
  label,
  value,
  icon,
  tone = 'primary',
  hint,
  onPress,
  style,
}: {
  label: string;
  value: ReactNode;
  icon: IconName;
  tone?: Tone;
  hint?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTone(tone);
  return (
    <Card onPress={onPress} style={[{ flex: 1, minWidth: 150 }, style]}>
      <View style={[styles.tileIcon, { backgroundColor: t.bg }]}>
        <Icon name={icon} size={20} color={t.fg} />
      </View>
      <T variant="h2" style={{ marginTop: space.md }}>
        {value}
      </T>
      <T variant="small" muted style={{ marginTop: 2 }}>
        {label}
      </T>
      {hint ? (
        <T variant="tiny" color={t.fg} style={{ marginTop: 6 }}>
          {hint}
        </T>
      ) : null}
    </Card>
  );
}

// ------------------------------------------------------------------- badges

export function Badge({ label, tone, status, icon, size = 'md' }: { label?: string; tone?: Tone; status?: string; icon?: IconName; size?: 'sm' | 'md' }) {
  const resolved: Tone = tone ?? (status ? (statusTone(status) as Tone) : 'neutral');
  const t = useTone(resolved);
  const text = label ?? (status ?? '').replace(/_/g, ' ');
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, size === 'sm' && { paddingVertical: 2, paddingHorizontal: 8 }]}>
      {icon && <Icon name={icon} size={12} color={t.fg} />}
      <Text style={[styles.badgeText, { color: t.fg }, size === 'sm' && { fontSize: 10 }]}>{text.toUpperCase()}</Text>
    </View>
  );
}

// ------------------------------------------------------------------ buttons

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading,
  disabled,
  style,
  size = 'lg',
  color,
}: {
  color?: string;
  title: string;
  onPress?: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'md' | 'lg';
}) {
  const { c } = useTheme();
  const bg = { primary: brand.blue, secondary: c.surface, danger: c.danger, ghost: 'transparent', success: brand.green }[variant];
  const fg = color ?? (variant === 'secondary' || variant === 'ghost' ? c.text : '#FFFFFF');
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        haptic.light();
        onPress?.();
      }}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        size === 'md' && { paddingVertical: 10, paddingHorizontal: 14 },
        { backgroundColor: bg },
        variant === 'secondary' && { borderWidth: 1, borderColor: c.border },
        (disabled || loading) && { opacity: 0.55 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={20} color={fg} />}
          <Text style={[styles.buttonText, { color: fg }, size === 'md' && { fontSize: 14 }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------------- inputs

export function Field({
  label,
  icon,
  right,
  error,
  ...input
}: React.ComponentProps<typeof TextInput> & { label?: string; icon?: IconName; right?: ReactNode; error?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ marginBottom: space.lg }}>
      {label ? (
        <T variant="small" style={{ marginBottom: 6, fontWeight: '600' }}>
          {label}
        </T>
      ) : null}
      <View style={[styles.field, { backgroundColor: c.surface, borderColor: error ? c.danger : c.border }]}>
        {icon && <Icon name={icon} size={20} color={c.textMuted} />}
        <TextInput placeholderTextColor={c.textSoft} style={[styles.fieldInput, { color: c.text }]} {...input} />
        {right}
      </View>
      {error ? (
        <T variant="small" color={c.danger} style={{ marginTop: 4 }}>
          {error}
        </T>
      ) : null}
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder = 'Search' }: { value: string; onChangeText(v: string): void; placeholder?: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Icon name="magnify" size={20} color={c.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textSoft}
        style={[styles.fieldInput, { color: c.text }]}
        returnKeyType="search"
        autoCorrect={false}
      />
      {!!value && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search">
          <Icon name="close-circle" size={18} color={c.textSoft} />
        </Pressable>
      )}
    </View>
  );
}

export function Chips<V extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: V; label: string; count?: number }[];
  value: V;
  onChange(v: V): void;
}) {
  const { c } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              haptic.tap();
              onChange(o.value);
            }}
            style={[styles.chip, { backgroundColor: active ? brand.blue : c.surface, borderColor: active ? brand.blue : c.border }]}
          >
            <Text style={[styles.chipText, { color: active ? '#FFFFFF' : c.text }]}>
              {o.label}
              {o.count !== undefined ? `  ${o.count}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------- sections

export function Section({ title, action, onAction, children, style }: { title: string; action?: string; onAction?: () => void; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View style={[{ marginTop: space.xl }, style]}>
      <View style={styles.sectionHead}>
        <T variant="h3">{title}</T>
        {action && (
          <Pressable onPress={onAction} hitSlop={8}>
            <T variant="small" color={c.primary} style={{ fontWeight: '700' }}>
              {action}
            </T>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

export function ListRow({
  icon,
  iconTone = 'primary',
  title,
  subtitle,
  right,
  onPress,
  last,
}: {
  icon?: IconName;
  iconTone?: Tone;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const { c } = useTheme();
  const t = useTone(iconTone);
  const content = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: t.bg }]}>
          <Icon name={icon} size={20} color={t.fg} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" numberOfLines={1}>
          {title}
        </T>
        {subtitle ? (
          <T variant="small" muted numberOfLines={2} style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={22} color={c.textSoft} /> : null)}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => pressed && { opacity: 0.6 }}
    >
      {content}
    </Pressable>
  );
}

export function KeyValue({ label, value, mono }: { label: string; value?: ReactNode; mono?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={styles.kv}>
      <T variant="small" muted>
        {label}
      </T>
      <Text style={[font.bodyStrong, { color: c.text, flexShrink: 1, textAlign: 'right' }, mono && { fontFamily: 'monospace', fontSize: 12 }]} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

export function ProgressBar({ value, tone = 'success' }: { value: number; tone?: Tone }) {
  const { c } = useTheme();
  const t = useTone(tone);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: Math.max(0, Math.min(100, value)), duration: 600, useNativeDriver: false }).start();
  }, [value, anim]);
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surfaceAlt, overflow: 'hidden' }}>
      <Animated.View style={{ height: 8, borderRadius: 4, backgroundColor: t.fg, width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export function Avatar({ name, size = 44 }: { name?: string; size?: number }) {
  const initials = (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <LinearGradient colors={[brand.blue, brand.green]} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFF', fontWeight: '800', fontSize: size * 0.38 }}>{initials}</Text>
    </LinearGradient>
  );
}

// ------------------------------------------------------------------- states

export function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ height, width, borderRadius: radius.sm, backgroundColor: c.surfaceAlt, opacity: pulse }, style]} />;
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View style={{ gap: space.md }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <Skeleton height={18} width="60%" />
          <Skeleton height={12} width="40%" style={{ marginTop: 10 }} />
          <Skeleton height={12} width="80%" style={{ marginTop: 8 }} />
        </Card>
      ))}
    </View>
  );
}

export function Empty({ icon = 'inbox-outline', title, message, action }: { icon?: IconName; title: string; message?: string; action?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: c.primarySoft }]}>
        <Icon name={icon} size={34} color={c.primary} />
      </View>
      <T variant="h3" center>
        {title}
      </T>
      {message ? (
        <T muted center style={{ marginTop: 6, maxWidth: 280 }}>
          {message}
        </T>
      ) : null}
      {action ? <View style={{ marginTop: space.lg }}>{action}</View> : null}
    </View>
  );
}

/** Fades and slides children in on mount. */
export function FadeIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 380, delay, useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function useBottomInset() {
  return useSafeAreaInsets().bottom;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  iconBtn: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dotBadge: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  dotBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  heroBubble1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -40 },
  heroBubble2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, left: -30 },
  tileIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, paddingHorizontal: 18, borderRadius: radius.md },
  buttonText: { fontSize: 16, fontWeight: '700' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, minHeight: 52 },
  fieldInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, height: 48 },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14 },
  chipText: { fontSize: 13, fontWeight: '700' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 13 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});
