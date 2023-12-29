import { Pressable, Text, View, StyleSheet } from "react-native";

export default function ShowDetailsButton() {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Show Details</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 12,
  },
});
