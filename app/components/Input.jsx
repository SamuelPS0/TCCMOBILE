import { StyleSheet, Text, TextInput, View } from "react-native";
import { typography } from "../globalstyles/fonts";


interface IInputProps {
  label?: string; // label acima do input
  placeholder?: string;
  placeholderColor?: string;
  value: string;
  onChangeText: (text: string) => void;
  width?: number | string;
}

export const Input = ({
  label,
  placeholder,
  placeholderColor = "#C2C2C2",
  value,
  onChangeText,
  width = "100%",
}: IInputProps) => {
  return (
    <View style={[styles.container, { width }]}>
      {label && <Text style={typography.inputlabel}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8, // espaço entre inputs
    alignSelf: "center", // centraliza horizontalmente
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});