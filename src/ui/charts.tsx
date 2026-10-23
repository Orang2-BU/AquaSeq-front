import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { fmt, T } from './primitives';
import { color, radius, space } from './theme/tokens';

const FONT = 'Figtree_500Medium';

/**
 * Tren garis ink dengan halo (pola Iconly "Health App"). Titik terakhir/terpilih diberi pil nilai hitam.
 * `signals[i]` true = EWMA melewati batas kontrol → zona diarsir "sinyal tren".
 */
export function TrendChart({
  points,
  ucl,
  signals,
  summary,
  max = 100,
  unit = '',
}: {
  points: { label: string; value: number | null }[];
  ucl?: (number | null)[];
  signals?: boolean[];
  summary: string;
  max?: number;
  unit?: string;
}) {
  const [w, setW] = useState(320);
  const h = 150;
  const pad = { l: 4, r: 16, t: 26, b: 22 };
  const n = Math.max(points.length - 1, 1);
  const x = (i: number) => pad.l + ((w - pad.l - pad.r) * i) / n;
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - Math.min(v, max) / max);
  const valid = points.map((p, i) => ({ ...p, i })).filter((p) => p.value !== null) as {
    label: string;
    value: number;
    i: number;
  }[];
  const [sel, setSel] = useState<number | null>(null);
  const focus = valid.find((p) => p.i === sel) ?? valid.at(-1);
  const line = valid.map((p) => `${x(p.i)},${y(p.value)}`).join(' ');
  const firstSignal = signals?.findIndex(Boolean) ?? -1;
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
    >
      <Svg width={w} height={h}>
        {firstSignal >= 0 ? (
          <>
            <Rect
              x={x(firstSignal)}
              y={pad.t - 8}
              width={w - pad.r - x(firstSignal)}
              height={h - pad.t - pad.b + 8}
              fill="rgba(60,198,210,0.14)"
            />
            <SvgText
              x={x(firstSignal) + 6}
              y={pad.t + 4}
              fontSize={11}
              fontFamily={FONT}
              fill={color.primary}
            >
              sinyal tren
            </SvgText>
          </>
        ) : null}
        {ucl?.some((u) => u !== null) ? (
          <Polyline
            points={ucl
              .map((u, i) => (u === null ? null : `${x(i)},${y(u)}`))
              .filter(Boolean)
              .join(' ')}
            fill="none"
            stroke={color.danger}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ) : null}
        <Polyline
          points={line}
          fill="none"
          stroke="rgba(13,14,16,0.10)"
          strokeWidth={8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Polyline
          points={line}
          fill="none"
          stroke={color['on-surface']}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {valid.map((p) => (
          <Circle
            key={p.i}
            cx={x(p.i)}
            cy={y(p.value)}
            r={p.i === focus?.i ? 4.5 : 3}
            fill={color['on-surface']}
          />
        ))}
        {focus ? (
          <>
            <Line
              x1={x(focus.i)}
              x2={x(focus.i)}
              y1={y(focus.value)}
              y2={h - pad.b}
              stroke={color['on-surface']}
              strokeWidth={1}
            />
            <Rect
              x={Math.min(x(focus.i) - 22, w - 46)}
              y={Math.max(y(focus.value) - 30, 0)}
              width={44}
              height={22}
              rx={11}
              fill={color['on-surface']}
            />
            <SvgText
              x={Math.min(x(focus.i), w - 24)}
              y={Math.max(y(focus.value) - 15, 15)}
              fontSize={12}
              fontFamily="Figtree_600SemiBold"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              {fmt(focus.value, 0) + unit}
            </SvgText>
          </>
        ) : null}
        {[0, Math.floor(n / 2), n].map((i) =>
          points[i] ? (
            <SvgText
              key={i}
              x={x(i)}
              y={h - 4}
              fontSize={11}
              fontFamily={FONT}
              fill={color['on-surface-muted']}
              textAnchor={i === 0 ? 'start' : i === n ? 'end' : 'middle'}
            >
              {points[i].label}
            </SvgText>
          ) : null,
        )}
      </Svg>
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' }}
      >
        {points.map((p, i) => (
          <Pressable
            key={i}
            style={{ flex: 1 }}
            accessibilityLabel={`${p.label}: ${p.value === null ? 'tidak ada skor' : fmt(p.value)}`}
            onPress={() => setSel(i)}
          />
        ))}
      </View>
    </View>
  );
}

export interface PlateWell {
  id: string;
  ct: number | null;
  label: string;
  state: 'ok' | 'gagal' | 'dikeluarkan' | 'kosong';
}

/** Heatmap plate 8×12: makin rendah Ct makin pekat; gagal QC bergaris merah; dikeluarkan abu. */
export function PlateHeatmap({
  wells,
  onPress,
  summary,
}: {
  wells: PlateWell[];
  onPress?: (id: string) => void;
  summary: string;
}) {
  const rows = 'ABCDEFGH'.split('');
  const byId = new Map(wells.map((w) => [w.id, w]));
  const shade = (ct: number) => {
    const t = Math.min(Math.max((35 - ct) / 20, 0), 1);
    return `rgba(10,107,120,${0.12 + t * 0.78})`;
  };
  return (
    <View accessibilityLabel={summary} style={{ gap: 3 }}>
      {rows.map((r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 3 }}>
          {Array.from({ length: 12 }, (_, c) => {
            const id = `${r}${c + 1}`;
            const w = byId.get(id);
            const bg =
              !w || w.state === 'kosong'
                ? color.track
                : w.state === 'dikeluarkan'
                  ? color['outline-strong']
                  : w.ct === null
                    ? color['surface-raised']
                    : shade(w.ct);
            return (
              <Pressable
                key={id}
                disabled={!w}
                onPress={() => w && onPress?.(id)}
                accessibilityRole="button"
                accessibilityLabel={
                  w
                    ? `Well ${id}, ${w.label}, Ct ${w.ct === null ? 'tidak teramplifikasi' : fmt(w.ct, 2)}${w.state !== 'ok' ? `, ${w.state}` : ''}`
                    : `Well ${id} kosong`
                }
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: radius.xs - 2,
                  backgroundColor: bg,
                  borderWidth: w?.state === 'gagal' ? 2 : 1,
                  borderColor: w?.state === 'gagal' ? color.danger : color.outline,
                }}
              />
            );
          })}
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: space.md, flexWrap: 'wrap', marginTop: space.xs }}>
        <Legend bg={shade(16)} label="Ct rendah" />
        <Legend bg={shade(32)} label="Ct tinggi" />
        <Legend bg={color['surface-raised']} label="Tidak teramplifikasi" />
        <Legend bg={color['outline-strong']} label="Dikeluarkan" />
        <Legend bg={color['surface-raised']} border={color.danger} label="Gagal QC" />
      </View>
    </View>
  );
}

function Legend({ bg, label, border }: { bg: string; label: string; border?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          backgroundColor: bg,
          borderWidth: border ? 2 : 1,
          borderColor: border ?? color.outline,
        }}
      />
      <T v="caption" c="on-surface-muted">
        {label}
      </T>
    </View>
  );
}

/** Kurva standar: titik Ct terhadap log10 salinan/rxn dan garis regresi. */
export function StandardCurveChart({
  points,
  slope,
  intercept,
  summary,
}: {
  points: { copiesRxn: number; ct: number }[];
  slope: number;
  intercept: number;
  summary: string;
}) {
  const [w, setW] = useState(320);
  const h = 200;
  const xs = points.map((p) => Math.log10(p.copiesRxn));
  const [x0, x1] = [Math.min(...xs) - 0.3, Math.max(...xs) + 0.3];
  const cts = points.map((p) => p.ct);
  const [y0, y1] = [Math.min(...cts) - 2, Math.max(...cts) + 2];
  const sx = (v: number) => 30 + ((w - 40) * (v - x0)) / (x1 - x0);
  const sy = (v: number) => 10 + ((h - 40) * (y1 - v)) / (y1 - y0);
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
    >
      <Svg width={w} height={h}>
        <Line
          x1={sx(x0)}
          y1={sy(slope * x0 + intercept)}
          x2={sx(x1)}
          y2={sy(slope * x1 + intercept)}
          stroke={color.primary}
          strokeWidth={1.5}
        />
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={sx(Math.log10(p.copiesRxn))}
            cy={sy(p.ct)}
            r={4}
            fill={color['on-surface']}
          />
        ))}
        {[...new Set(xs)].map((v) => (
          <SvgText
            key={v}
            x={sx(v)}
            y={h - 8}
            fontSize={11}
            fontFamily={FONT}
            fill={color['on-surface-muted']}
            textAnchor="middle"
          >
            {`10^${v}`}
          </SvgText>
        ))}
        {[Math.ceil(y0), Math.floor(y1)].map((v) => (
          <SvgText
            key={v}
            x={2}
            y={sy(v) + 4}
            fontSize={11}
            fontFamily={FONT}
            fill={color['on-surface-muted']}
          >
            {String(v)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
