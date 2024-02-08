import { StyleSheet, TextInput, View } from "react-native";

export default function InputBox({
  placeholder,
  secureTextEntry,
  onChangeText,
  value,
  padding = 20,
  Xstyles,
}) {
  return (
    <View style={[styles.container, Xstyles]}>
      <View style={styles.inputBox}>
        <TextInput
          style={{ color: "#ffffff", padding: padding }}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          placeholderTextColor="#b9b9b9"
          onChangeText={onChangeText}
          value={value}
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
