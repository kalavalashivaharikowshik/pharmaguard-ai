import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { brand, useTheme } from './theme';
import { T } from './components';

/** Smooth area chart; points after `forecastFrom` are drawn dashed in green. */
export function AreaChart({
  data,
  height = 150,
  width = 320,
  forecastFrom,
}: {
  data: { label: string; value: number }[];
  height?: number;
  width?: number;
  forecastFrom?: number;
}) {
  const { c } = useTheme();
  if (!data.length) return null;
  const pad = { l: 6, r: 6, t: 12, b: 22 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = Math.max(1, ...data.map((d) => d.value));
  const x = (i: number) => pad.l + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w);
  const y = (v: number) => pad.t + h - (v / max) * h;
  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  const line = (from: number, to: number) =>
    pts
      .slice(from, to + 1)
      .map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
      .join(' ');
  const split = forecastFrom ?? data.length;
  const actualEnd = Math.min(split, data.length) - 1;
  const area = `${line(0, actualEnd)} L${x(actualEnd).toFixed(1)},${pad.t + h} L${x(0).toFixed(1)},${pad.t + h} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="pgArea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={brand.blueLight} stopOpacity="0.35" />
          <Stop offset="1" stopColor={brand.blueLight} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <Rect key={f} x={pad.l} y={pad.t + h * f} width={w} height={1} fill={c.border} />
      ))}
      {actualEnd > 0 && <Path d={area} fill="url(#pgArea)" />}
      <Path d={line(0, actualEnd)} stroke={c.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      {split < data.length && (
        <Path d={line(actualEnd, data.length - 1)} stroke={brand.green} strokeWidth={2.5} strokeDasharray="6 5" fill="none" />
      )}
      {pts.map(([px, py], i) => (
        <Circle key={i} cx={px} cy={py} r={i === actualEnd ? 4.5 : 2.5} fill={i >= split ? brand.green : c.primary} />
      ))}
      {data.map((d, i) => (
        <SvgText key={d.label + i} x={x(i)} y={height - 6} fontSize={10} fill={c.textMuted} textAnchor="middle">
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}

/** Donut with legend. */
export function Donut({ segments, size = 130, thickness = 18, centerLabel, centerValue }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const { c } = useTheme();
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
      <View>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.surfaceAlt} strokeWidth={thickness} fill="none" />
            {total > 0 &&
              segments.map((s) => {
                const len = (s.value / total) * circ;
                const el = (
                  <Circle
                    key={s.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={s.color}
                    strokeWidth={thickness}
                    fill="none"
                    strokeDasharray={`${len} ${circ - len}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += len;
                return el;
              })}
          </G>
        </Svg>
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <T variant="h2">{centerValue ?? total}</T>
          {centerLabel ? (
            <T variant="tiny" muted>
              {centerLabel}
            </T>
          ) : null}
        </View>
      </View>
      <View style={{ gap: 8, flex: 1 }}>
        {segments.map((s) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
            <T variant="small" style={{ flex: 1 }}>
              {s.label}
            </T>
            <T variant="small" style={{ fontWeight: '700' }}>
              {s.value}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Simple vertical bars. */
export function Bars({ data, height = 120, width = 300, colors }: { data: { label: string; value: number }[]; height?: number; width?: number; colors?: string[] }) {
  const { c } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = Math.min(34, (width / Math.max(1, data.length)) * 0.55);
  const gap = (width - bw * data.length) / Math.max(1, data.length);
  const h = height - 22;
  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const bh = Math.max(3, (d.value / max) * (h - 14));
        const x = gap / 2 + i * (bw + gap);
        return (
          <G key={d.label}>
            <Rect x={x} y={h - bh} width={bw} height={bh} rx={6} fill={colors?.[i] ?? c.primary} />
            <SvgText x={x + bw / 2} y={h - bh - 4} fontSize={10} fontWeight="700" fill={c.text} textAnchor="middle">
              {d.value}
            </SvgText>
            <SvgText x={x + bw / 2} y={height - 6} fontSize={10} fill={c.textMuted} textAnchor="middle">
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
