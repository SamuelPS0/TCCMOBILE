import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { typography } from "../globalstyles/fonts";

interface IDateInputProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  width?: number | string;
  placeholder?: string;
  minimumDate?: Date;
  error?: string;
}

export const DateInput = ({
  label,
  value,
  onChange,
  width = "100%",
  placeholder = "Selecione",
  minimumDate,
  error,
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

      <Pressable
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.text, !value && styles.placeholderText]}>
          {value ? value.toLocaleDateString("pt-BR") : placeholder}
        </Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          minimumDate={minimumDate}
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

  inputError: {
    borderColor: "red",
  },
  text: {
    fontSize: 16,
  },
  placeholderText: {
    color: "#999",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
