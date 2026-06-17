import React from "react";
import { View, StyleSheet, LayoutChangeEvent, ViewStyle } from "react-native";

export default function Ocrzone({
  onLayout,
  style,
}: {
  onLayout?: (e: LayoutChangeEvent) => void;
  style?: ViewStyle;
}) {
  return <View onLayout={onLayout} style={[styles.ocrContainer, style]}></View>;
}

const styles = StyleSheet.create({
  ocrContainer: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "red",
    width: 400,
    height: 200,
  },
});
