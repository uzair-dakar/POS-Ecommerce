import React, { memo } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme';

/**
 * Inline SVG icon set — no icon font, no native linking, and only the
 * paths we actually ship. Add a new glyph by adding one entry here.
 * Every path is authored on a 24x24 grid.
 */
const paths = {
  home: 'M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  store: 'M4 9h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM3 9l1.5-5h15L21 9z',
  bag: 'M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 8V6a3 3 0 0 1 6 0v2',
  user: 'M4 21v-1a7 7 0 0 1 16 0v1M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8',
  search: 'M20 20l-4.2-4.2M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0',
  heart: 'M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  bike: 'M5.5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18.5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 8h5l3.5 7M9 8 6.5 15M9 8 8 5H6',
  star: 'm12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z',
  chevronRight: 'm9.5 5 7 7-7 7',
  chevronDown: 'm5 9.5 7 7 7-7',
  arrowRight: 'M4 12h15m-6-6 6 6-6 6',
  arrowLeft: 'M20 12H5m6 6-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z',
  sliders: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 4v6M8 14v6',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6 6 18',
  percent: 'm6 18 12-12M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  gift: 'M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM2 7h20v4H2zM12 7v14M12 7S10.5 3 8 3a2 2 0 0 0 0 4zM12 7s1.5-4 4-4a2 2 0 0 1 0 4z',
  card: 'M3 6h18v12H3zM3 10h18',
  bell: 'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  calendar: 'M4 6h16v15H4zM4 11h16M8 3v4M16 3v4',
  bolt: 'm13 3-8 10h6l-1 8 8-10h-6z',
} as const;

export type IconName = keyof typeof paths;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  /** Filled glyphs read as "active"; outlined as "inactive". */
  filled?: boolean;
  strokeWidth?: number;
};

function IconBase({
  name,
  size = 22,
  color = colors.text,
  filled = false,
  strokeWidth = 1.9,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={paths[name]}
        stroke={filled ? 'none' : color}
        fill={filled ? color : 'none'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A filled dot, used for "open now" / live indicators. */
export const Dot = memo(function Dot({
  size = 8,
  color = colors.success,
}: {
  size?: number;
  color?: string;
}) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={r} cy={r} r={r} fill={color} />
    </Svg>
  );
});

export const Icon = memo(IconBase);
