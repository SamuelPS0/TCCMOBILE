import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, View } from "react-native";
import { typography } from "../globalstyles/fonts";

interface ISelectProps {
  label?: string;
  icon?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  width?: number | string;
}

export const SelectInput = ({
  label,
  icon,
  selectedValue,
  onValueChange,
  options,
  width = "100%",
}: ISelectProps) => {
  return (
    <View style={[styles.container, { width }]}>
      {(label || icon) && (
        <View style={styles.labelRow}>
          {icon && <Ionicons name={icon} size={18} color="#666" />}
          {label && <Text style={typography.inputlabel}>{label}</Text>}
        </View>
      )}

      <View style={styles.select}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {options.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
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

  select: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 50,
    justifyContent: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  picker: {
    width: "100%",
    height: 50,
  },
});
