import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  useFrameOutput,
  usePhotoOutput,
} from "react-native-vision-camera";
import {
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useTextRecognition,
  PhotoRecognizer,
} from "react-native-vision-camera-ocr-plus";
import { scheduleOnRN } from "react-native-worklets";
import Ocrzone from "@/components/Ocrzone";
import {
  NitroImage,
  type Image as NitroImageHandle,
} from "react-native-nitro-image";
import { sendPin } from "@/services/sendPin";

type SubmissionState = "idle" | "submitting" | "success" | "error";

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
  const [frozen, setFrozen] = useState(false);
  const [frozenImage, setFrozenImage] = useState<NitroImageHandle | null>(null);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const lastPinRef = useRef<string | null>(null);
  const stableCountRef = useRef(0);
  const freezingRef = useRef(false);
  const frozenRef = useRef(false);

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
      );

      let path: string;
      let image: NitroImageHandle;

      try {
        path = await photo.saveToTemporaryFileAsync();
        image = await photo.toImageAsync();
      } finally {
        photo.dispose();
      }

      // freeze and confirm the 6 digit pin
      frozenRef.current = true;
      setFrozenImage(image);
      setFrozen(true);
      setFinalPin(candidatePin);
      setErrorMessage("");

      try {
        const result = await PhotoRecognizer({ uri: path });
        const confirmedPin = extractPin(result.resultText);
        setFinalPin(confirmedPin ?? candidatePin);
      } catch {
        // The stable live OCR result is still available if photo OCR fails.
        setFinalPin(candidatePin);
      }
    } catch (error) {
      console.error("Failed to capture PIN confirmation image", error);
      setErrorMessage("Could not capture the PIN. Please try again.");
    } finally {
      freezingRef.current = false;
    }
  }

  // capture photo
  const photoOutput = usePhotoOutput();

  function handleOcrText(text: string) {
    setDetectedText(text);
    const pin = extractPin(text);
    if (!pin || frozen || frozenRef.current || freezingRef.current) return;

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
    onFrame(frame) {
      "worklet"; // transformed JS that can run outside the react native JS runtime on another thread
      const result = scanText(frame); // ocr function, reads frame orientation, returns text
      if (result.resultText) {
        // this is the bridge that sets the pin from the frame thread to the RN thread
        scheduleOnRN(handleOcrText, result.resultText); // sets react state update back on React-native thread
      }
      // release frame memory
      frame.dispose();
    },
  });

  const onRetake = () => {
    setFrozen(false);
    frozenRef.current = false;
    setFrozenImage(null);
    setFinalPin(null);
    setDetectedText("");
    setSubmissionState("idle");
    setErrorMessage("");
    lastPinRef.current = null;
    stableCountRef.current = 0;
  };

  const pinRegex = /\b\d(?:[\s-]?\d){5}\b/;

  function extractPin(text: string) {
    const match = text.match(pinRegex);
    return match ? match[0].replace(/\D/g, "") : null;
  }

  const onSubmit = async () => {
    if (!finalPin || submissionState === "submitting") return;

    setSubmissionState("submitting");
    setErrorMessage("");

    try {
      await sendPin(finalPin);
      setSubmissionState("success");
    } catch {
      setSubmissionState("error");
      setErrorMessage("The PIN could not be submitted. Please try again.");
    }
  };

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);
  if (!device) return null;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        isActive={!frozen}
        device={device}
        outputs={[frameOutput, photoOutput]} // send camera frames into processor
      />

      {frozenImage ? (
        <NitroImage
          image={frozenImage}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {!frozen ? (
        <>
          <View style={styles.scanStatus}>
            <Text style={styles.scanStatusText}>
              {errorMessage || (detectedText ? "Reading PIN..." : "Scanning...")}
            </Text>
          </View>
          <Ocrzone onLayout={onLayout} style={styles.ocrZone} />
        </>
      ) : (
        <View style={styles.confirmationPanel}>
          {submissionState === "success" ? (
            <>
              <Text style={styles.confirmationTitle}>PIN submitted</Text>
              <Text style={styles.pinText}>{finalPin}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onRetake}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>Scan another</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.confirmationTitle}>Is this PIN correct?</Text>
              <Text selectable style={styles.pinText}>
                {finalPin ?? "------"}
              </Text>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={submissionState === "submitting"}
                  onPress={onRetake}
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.flexButton,
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Retake</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={!finalPin || submissionState === "submitting"}
                  onPress={onSubmit}
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.flexButton,
                    styles.primaryButton,
                    (!finalPin || submissionState === "submitting") &&
                      styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  {submissionState === "submitting" ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Submit</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scanStatus: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scanStatusText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  ocrZone: {
    position: "absolute",
    top: "32%",
    alignSelf: "center",
    maxWidth: "88%",
  },
  confirmationPanel: {
    position: "absolute",
    right: 16,
    bottom: 28,
    left: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    padding: 20,
  },
  confirmationTitle: {
    color: "#171717",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  pinText: {
    marginVertical: 14,
    color: "#111827",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  errorText: {
    marginBottom: 12,
    color: "#b42318",
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 18,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#176b4d",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.72,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
