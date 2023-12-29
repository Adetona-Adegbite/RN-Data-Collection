import { StyleSheet, TextInput, View } from "react-native";

export default function InputBox({
  placeholder,
  secureTextEntry,
  onChangeText,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.inputBox}>
        <TextInput
          style={{ color: "#ffffff", padding: 20 }}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          placeholderTextColor="#b9b9b9"
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  inputBox: {
    backgroundColor: "#323232",
    width: "75%",
    borderRadius: 25,
    marginBottom: 20,
  },
});
