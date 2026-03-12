import ExpoCheckbox from "expo-checkbox";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface ICheckboxProps {
  label: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const CheckboxInput = ({
  label,
  value,
  onChange,
}: ICheckboxProps) => {
  return (
    <Pressable
      style={styles.container}
      onPress={() => onChange(!value)}
    >
      <ExpoCheckbox
        value={value}
        onValueChange={onChange}
        color={value ? "#F05221" : undefined}
        style={styles.checkbox}
      />

      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },

  label: {
    fontSize: 14,
    flexShrink: 1,
    lineHeight: 20,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});