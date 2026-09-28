import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import FastImage, { type ResizeMode, type Source } from 'react-native-fast-image';
import { colors } from '../../theme';

export type AppImageProps = {
  source: Source | number;
  style?: ViewStyle | ViewStyle[];
  resizeMode?: ResizeMode;
};

/**
 * All remote imagery goes through FastImage: it caches to disk, so scrolling
 * back up a feed never re-downloads, and decoding happens off the JS thread.
 */
function AppImageBase({ source, style, resizeMode = 'cover' }: AppImageProps) {
  return (
    <View style={[styles.placeholder, style]}>
      <FastImage source={source as Source} style={StyleSheet.absoluteFill} resizeMode={resizeMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
});

export const AppImage = memo(AppImageBase);
