import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  useFrameOutput,
  usePhotoOutput,
} from "react-native-vision-camera";
import { NitroModules } from "react-native-nitro-modules";
import { useSharedValue } from "react-native-reanimated";
import { View, StyleSheet, Text } from "react-native";
import {
  useTextRecognition,
  ScanRegion,
  PhotoRecognizer,
} from "react-native-vision-camera-ocr-plus";
import { scheduleOnRN } from "react-native-worklets";
import { Submit, Verify, Retake } from "../components/Buttons";
import Ocrzone from "@/components/Ocrzone";
import { Dimensions, LayoutChangeEvent } from "react-native";
import { NitroImageProps, NitroImage, type Image as NitroImageHandle} from "react-native-nitro-image";

export default function CameraComponent() {
  // ask for camera permission
  const { hasPermission, requestPermission } = useCameraPermission();

  // use rear camera
  const device = useCameraDevice("back");
  const [detectedText, setDetectedText] = useState("");

  // creates ocr recognizer
  const { scanText, recognizer } = useTextRecognition({
    language: "latin",
    frameSkipThreshold: 5,
  });

  const [finalPin, setFinalPin] = useState<string | null>(null);
  const [stableCount, setStableCount] = useState(0);

  const [frozen, setFrozen] = useState(false);
  const [frozenImage, setFrozenImage] = useState<NitroImageHandle | null>(null);


  const lastPinRef = useRef<string | null>(null);
  const stableCountRef = useRef(0);
  const freezingRef = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    const { width: sw, height: sh } = Dimensions.get("window");

    recognizer.configure({
      language: "latin",
      frameSkipThreshold: 5,
      useLightweightMode: false,
      scanRegion: {
        // compares against Dimensions.get("window")
        // 1. get  ocr box position
        // 2. get screen size
        // 3. convert ocr box into %
        // 4. tells ocr recognizer to scan only that part of the frame
        left: (x / sw) * 100,
        top: (y / sh) * 100,
        width: (Math.min(width, sw) / sw) * 100,
        height: (Math.min(height, sh) / sh) * 100,
      },
    });
  };

  async function freezeAndConfirm(candidatePin: string) {
    if (freezingRef.current) return;
    freezingRef.current = true;

    try {
      const photo = await photoOutput.capturePhoto(
        { flashMode: "off", enableShutterSound: false },
        {}
      )

      const path = await photo.saveToTemporaryFileAsync();
      const image = await photo.toImageAsync();

      // freeze and confirm the 6 digit pin
      setFrozenImage(image);
      setFrozen(true);

      const result = await PhotoRecognizer({ uri: path });
      const confirmedPin = extractPin(result.resultText)

      setFinalPin(confirmedPin ?? candidatePin);

      photo.dispose();
    } finally {
      freezingRef.current = false;

    }
  }

  // capture photo
  const photoOutput = usePhotoOutput();

  function handleOcrText(text: string) {
    setDetectedText(text);
    const pin = extractPin(text);
    if (!pin || frozen) return;

    // trust algorithm
    if (lastPinRef.current === pin) {
      stableCountRef.current += 1;
    } else {
      lastPinRef.current = pin;
      stableCountRef.current = 1;
    }

    if (stableCountRef.current >= 3) {
      void freezeAndConfirm(pin);
    }

  }

  // create the frame processor
  const frameOutput = useFrameOutput({ // creates vision camera frame output
    pixelFormat: "rgb",
    onFrame(frame) { //
      "worklet"; // transformed JS that can run outside the react native JS runtime on another thread
      const result = scanText(frame); // ocr function, reads frame orientation, returns text
      const pin = extractPin(result.resultText);
      if (pin) {
        scheduleOnRN(handleOcrText, pin);
        }
      if (result.resultText) {
        scheduleOnRN(handleOcrText, result.resultText); // sets react state update back on React-native thread

      }
      // release frame memory
      frame.dispose();
    },
  });

  const onRetake = () => {
    setFrozen(false);
    setFrozenImage(null);
    setFinalPin(null);
    setDetectedText("")
    lastPinRef.current = null;
    stableCountRef.current = 0;
  }

  const pinRegex = /\b\d(?:[/s-]?\d){5}\b/;

  function extractPin(text: string) {
    const match = text.match(pinRegex);
    return match ? match[0].replace(/\D/g, "") : null;
  }

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
        outputs={[frameOutput, photoOutput]} // send camera frames into processor
      />
      <Text style={styles.ocrText}>{detectedText}</Text>
      <Submit
        background="#fff"
        text="Submit"
        onTap={onTap}
        width={isLarge ? 200 : 100}
        height={isLarge ? 100 : 50}
      />
      <Ocrzone onLayout={onLayout} style={styles.ocrZone}></Ocrzone>
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
