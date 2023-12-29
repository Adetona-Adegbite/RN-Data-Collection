import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  useFonts,
  NanumGothic_400Regular,
} from "@expo-google-fonts/nanum-gothic";

export default function OauthButton({ text, onPress }) {
  const [fontLoaded] = useFonts({ NanumGothic_400Regular });

  return (
    <>
      {fontLoaded && (
        <View style={styles.container}>
          <Pressable onPress={onPress}>
            <Text style={styles.text}>{text}</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    width: "45%",
    borderRadius: 15,
    paddingVertical: 15,
    marginVertical: 10,
  },
  text: {
    fontFamily: "NanumGothic_400Regular",
    textAlign: "center",
  },
});
