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
  const screenHeight = Dimensions.get('window').height;


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

        // measure the relative
        const xPercent = cropRegion.x / screenWidth;
        const yPercent = cropRegion.y / screenHeight;
        const widthPercent = cropRegion.width / screenWidth;
        const heightPercent = cropRegion.height / screenHeight;

        // crop with percentage of screen * actual image
        const cropped = image.crop(
          xPercent * image.width,
          yPercent * image.height,
          widthPercent * image.width,
          heightPercent * image.height,
        );
        setImageState(cropped);
      }

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

      <ScanRegion
        onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setCropRegion({x, y, width, height})
      }}></ScanRegion>


      {/*shutter button control*/}
      <ShutterButton onPress={handleCapture}/>

      {/*produces falsy if no image has been taken*/}
      {imageState &&
        <View style={{
          top: '50%',
          left: '10%',
          width: 350,
          height: 150,
          borderColor: "red",
          borderWidth: 5,
          overflow: 'hidden',
          alignSelf: 'center',
          position: 'absolute',
        }}>
        <NitroImage
          style={{ flex: 1  }}
          // ! tells TS it's definitely not null from Image | null since it cannot be assigned that way
          image={imageState!}
        />
        </View>
      }
    </>
  )
}
