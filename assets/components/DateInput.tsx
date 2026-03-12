import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { typography } from "../globalstyles/fonts";

interface IDateInputProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  width?: number | string;
}

export const DateInput = ({
  label,
  value,
  onChange,
  width = "100%",
}: IDateInputProps) => {
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(event: any, selectedDate?: Date) {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  }

  return (
    <View style={[styles.container, { width }]}>
      {label && <Text style={typography.inputlabel}>{label}</Text>}

      <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={styles.text}>{value.toLocaleDateString("pt-BR")}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    alignSelf: "center",
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  text: {
    fontSize: 16,
  },
});
