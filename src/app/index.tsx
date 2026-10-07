import { Text, View, StyleSheet } from "react-native";
import { CapturePageButton } from "@/components/Button";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <CapturePageButton label="Scan PIN" onPress={() => router.navigate('/capture')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
