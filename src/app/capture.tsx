import { View, Text} from "react-native";
import React, { useEffect } from 'react';
import { Camera, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { CapturePhotoButton } from "@/components/Button";

export default function CapturePage() {
  // set up permissions
  const { hasPermission, requestPermission } = useCameraPermission()

  useEffect(() => {
    if (!hasPermission) requestPermission()
  },[hasPermission, requestPermission])

  // create photo capturing output
  const photoOutput = usePhotoOutput();

  const handleCapture = async () => {
    try {
      const photo = await photoOutput.capturePhoto(
        // capturePhoto must have 2 {} arguments regardless
        {flashMode: 'off'},
        {}
      );



      photo.dispose();
    } catch (error) {
      console.error("Failed to capture photo:", error);
    }
  }


  return (
    <View>
      <Camera
        style={{ flex: 1 }}
        isActive={hasPermission}
        device="back"
        outputs={[photoOutput]}
      />

      // inline error handling will cause issues if capturePhoto() rejects, as dispose() is skipped
      <CapturePhotoButton onPress={handleCapture}/>
    </View>
  )
}
