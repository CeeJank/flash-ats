import { View, Text} from "react-native";
import React, { useEffect } from 'react';
import { Camera, useCameraPermission } from 'react-native-vision-camera';

export default function CapturePage() {
  // set up permissions
  const { hasPermission, requestPermission } = useCameraPermission()

  useEffect(() => {
    if (!hasPermission) requestPermission()
  },[hasPermission, requestPermission])

  return (
    <Camera
      style={{ flex: 1 }}
      isActive={hasPermission}
      device="back"
    />
  )
}
