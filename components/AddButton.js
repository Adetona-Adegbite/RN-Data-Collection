import { Pressable, Text, View, StyleSheet } from "react-native";

export default function AddButton({ onPress, text }) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 15,
    overflow: "hidden",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#04C104",
    borderRadius: 15,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 35,
  },
});
