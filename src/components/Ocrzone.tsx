import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Button,
  LayoutChangeEvent,
} from "react-native";

export default function Ocrzone({
  onLayout,
}: {
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  return <View onLayout={onLayout} style={[styles.ocrContainer]}></View>;
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
