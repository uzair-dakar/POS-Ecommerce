module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 ships its worklet transform in react-native-worklets.
  // This plugin must stay last in the list.
  plugins: ['react-native-worklets/plugin'],
};
