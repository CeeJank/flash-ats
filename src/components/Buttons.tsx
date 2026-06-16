import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

interface Props {
  background?: string;
  size?: number;
  width?: number;
  height?: number;
  onTap?: () => void;
  text: string;
  disabled?: boolean;
}

export function Submit({ background = "#fff", text, onTap, ...rest }: Props) {
  return (
    <TouchableOpacity onPress={onTap}>
      <Text style={[styles.buttonStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}

export function Verify({ background, text, onTap }: Props) {
  return (
    <TouchableOpacity onPress={onTap}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );
}

export function Retake({ background, text, onTap }: Props) {
  return (
    <TouchableOpacity onPress={onTap}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    color: "#fff",
    backgroundColor: "#FF0000",
    fontSize: 32,
    fontWeight: "condensedBold",
    borderColor: "#000000",
    borderWidth: 5,
    width: 200,
    textAlign: "center",
  },
});
