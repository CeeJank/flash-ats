import React, { useEffect, useState } from "react";
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  useFrameOutput,
} from "react-native-vision-camera";
import { NitroModules } from "react-native-nitro-modules";
import { useSharedValue } from "react-native-reanimated";
import { View, StyleSheet, Text } from "react-native";
import { useTextRecognition } from "react-native-vision-camera-ocr-plus";
import { scheduleOnRN } from "react-native-worklets";
import { Submit, Verify, Retake } from "../components/Buttons";
import Ocrzone from "@/components/Ocrzone";

export default function CameraComponent() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const [detectedText, setDetectedText] = useState("");
  const { scanText } = useTextRecognition({
    language: "latin",
    frameSkipThreshold: 5,
  });

  const handleLayout;
  const frameOutput = useFrameOutput({
    pixelFormat: "rgb",
    onFrame(frame, { scanRegion: {} }) {
      "worklet";
      const result = scanText(frame);
      if (result.resultText) {
        scheduleOnRN(setDetectedText, result.resultText);
      }
      frame.dispose();
    },
  });

  const onTap = () => {
    return;
  };

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);
  if (!device) return null;

  const isLarge = true;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill}
        isActive={true}
        device={device}
        outputs={[frameOutput]}
      />
      <Text style={styles.ocrText}>{detectedText}</Text>
      <Submit
        background="#fff"
        text="Submit"
        onTap={onTap}
        width={isLarge ? 200 : 100}
        height={isLarge ? 100 : 50}
      />
      <Ocrzone></Ocrzone>
    </View>
  );
}

const styles = StyleSheet.create({
  ocrText: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#fff",
    color: "black",
  },
  ocrZone: {
    position: "absolute",
    top: 20,
  },
});
