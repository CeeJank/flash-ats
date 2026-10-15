import createResizer from 'react-native-vision-camera-resizer';

export default async function useResizer() {
  const result = await createResizer({
    pixelLayout: 'planar',
    width: 28,
    height: 28,
    channelOrder: 'rgb',
    dataType: 'float32',
  })
}
