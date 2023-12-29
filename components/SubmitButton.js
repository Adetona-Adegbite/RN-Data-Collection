import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  useFonts,
  NanumGothic_400Regular,
} from "@expo-google-fonts/nanum-gothic";

export default function SubmitButton({ text, onPress }) {
  const [fontLoaded] = useFonts({ NanumGothic_400Regular });

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressablePressed,
        ]}
        onPress={onPress}
      >
        <Text style={styles.text}>{text}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "NanumGothic_400Regular",
    color: "#000000",
    textAlign: "center",
  },
  container: {
    width: "75%",
    paddingVertical: 20,
    borderRadius: 25,
    backgroundColor: "#04C104",
    marginBottom: 10,
  },
  pressable: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  pressablePressed: {
    backgroundColor: "#0AA00A",
  },
});
