/**
 * Fonts are linked from the app's own asset folder rather than a package, so
 * `npx react-native-asset` copies them into both native projects.
 */
module.exports = {
  project: {
    ios: { sourceDir: './ios' },
    android: {},
  },
  assets: ['./src/assets/fonts'],
};
