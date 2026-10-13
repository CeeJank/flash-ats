import { View, Text, Dimensions} from "react-native";
import React, { useEffect, useState } from 'react';
import { Camera, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { ShutterButton } from "@/components/Button";
import { ScanRegion } from "@/components/Region";
import { Image, NitroImage } from 'react-native-nitro-image';

export default function CapturePage() {
  // set up permissions
  const { hasPermission, requestPermission } = useCameraPermission();

  // for setting the image on screen, rerenders
  const [imageState, setImageState] = useState<Image | null>(null);


  // Capturing the ScanRegion coords for cropping
   type CropRegion = {
     x: number,
     y: number,
     width: number,
     height: number,
   }
   const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);

  // get dimensions from screen
  const screenWidth = Dimensions.get('window').width;


  // runs after render, checks for data change after render
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
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

      const image = await photo.toImageAsync();
      if (cropRegion) {

        // scale of image to actual screen
        const scale = image.width / screenWidth;

        // crop with percentage of screen * actual image
        // multiply with the actual width and height of the image, which just means the dimensions of the device
        const cropped = image.crop(
          cropRegion.x * scale,
          cropRegion.y * scale,
          cropRegion.width * scale,
          cropRegion.height * scale,
        );
        setImageState(cropped);

      }

      // dispose after to save memory
      photo.dispose();
    } catch (error) {
      console.error("Failed to capture photo:", error);
    }
  }


  return (
    <>
      <Camera
        style={{ flex: 1 }}
        isActive={hasPermission}
        device="back"
        outputs={[photoOutput]}
      />

      {/*takes coordinates of box on screen on render*/}
      <ScanRegion
        onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setCropRegion({x, y, width, height})
      }}></ScanRegion>


      {/*shutter button control*/}
      <ShutterButton onPress={handleCapture}/>

      {/* && produces falsy if no image has been taken*/}
      {imageState &&
        <View style={{
          width: 350,
          height: 150,
          top: '50%',
          left: '10%',
          borderColor: "red",
          borderWidth: 5,
          position: 'absolute',
        }}>
        {/*render the image itself*/}
        <NitroImage
          style={{flex: 1}}
          // ! tells TS it's definitely not null from Image | null since it cannot be assigned that way
          image={imageState!}
        />
        </View>
      }
    </>
  )
}
