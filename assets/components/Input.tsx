import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { typography } from "../globalstyles/fonts";

interface IInputProps {
  label?: string;
  placeholder?: string;
  placeholderColor?: string;
  icon?: string;
  multiline?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  width?: number | string;
}

export const Input = ({
  label,
  placeholder,
  placeholderColor = "#C2C2C2",
  icon,
  multiline = false,
  value,
  onChangeText,
  width = "100%",
}: IInputProps) => {
  return (
    <View style={[styles.container, { width }]}>
      {(label || icon) && (
        <View style={styles.labelRow}>
          {icon && <Ionicons name={icon} size={18} color="#666" />}

          {label && <Text style={typography.inputlabel}>{label}</Text>}
        </View>
      )}

      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    alignSelf: "center",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  textarea: {
    height: 160,
    textAlignVertical: "top",
    paddingTop: 10,
  },
});
