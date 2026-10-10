import { Text, View, StyleSheet } from "react-native";

type ScanRegionProps = {
  onLayout?: (event: any) => void
}

export function ScanRegion({ onLayout }: ScanRegionProps) {
  return (
    <View style={styles.scanBox} onLayout={onLayout}>
    </View>
  )
}

const styles = StyleSheet.create({
  scanBox: {
    top: '10%',
    left: '10%',
    width: 350,
    height: 150,
    borderColor: "red",
    borderWidth: 5,
    position: "absolute",
  }

})
