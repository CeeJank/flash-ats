import { Text, View, StyleSheet } from "react-native";


interface regionProps {
  width: number;
  height: number;
  top: number;
  left: number;
}

export function scanRegion({ width, height, top, left }: regionProps) {
  return (
    <View>
      <div style={styles.scanBox}
        width={width}
        height={height}
        top={top}
        percentage={percentage}
      ></div>
    </View>
  )
}

const styles = StyleSheet.create({
  scanBox: {
    borderColor: "red",
    borderWidth: 5,
    position: "absolute",
    padding: 2,
  }

})
