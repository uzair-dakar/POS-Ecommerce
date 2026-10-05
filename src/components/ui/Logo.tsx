import React, { memo } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { shadows } from '../../theme';

const APP_ICON = require('../../assets/images/app-icon.png');
const MARK = require('../../assets/images/logo-mark.png');
const MARK_LIGHT = require('../../assets/images/logo-mark-light.png');

/** Intrinsic proportions of the wordmark artwork; height follows the width. */
const MARK_ASPECT = 630 / 457;

export type LogoVariant = 'icon' | 'mark';

export type LogoProps = {
  /**
   * 'icon' is the app icon badge — the brand's real stamp, and the default
   * anywhere the logo is an identity mark rather than a headline.
   * 'mark' is the bare wordmark, for the few places a badge would read as a
   * second app icon sitting on the screen.
   */
  variant?: LogoVariant;
  /** Icon: the badge's side. Mark: its width. */
  size?: number;
  /** Mark only — 'light' is the white cut, for navy and photographic grounds. */
  tone?: 'brand' | 'light';
  /** Icon only — lifts the badge off the page. */
  elevated?: boolean;
  style?: ViewStyle;
};

/**
 * The Buzztill logo.
 *
 * Both forms are shipped as artwork cut from the real app icon, so nothing is
 * approximated in type and no runtime tinting is needed. The badge's corner
 * radius is baked into its alpha channel — that keeps the silhouette exact
 * under a shadow, where a clipping container would show square edges.
 */
function LogoBase({
  variant = 'icon',
  size = 44,
  tone = 'brand',
  elevated = false,
  style,
}: LogoProps) {
  const dimensions =
    variant === 'icon'
      ? { width: size, height: size }
      : { width: size, height: size / MARK_ASPECT };

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Buzztill"
      style={[dimensions, variant === 'icon' && elevated && shadows.card, style]}>
      <Image
        source={variant === 'icon' ? APP_ICON : tone === 'light' ? MARK_LIGHT : MARK}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});

export const Logo = memo(LogoBase);
