import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;

  // NOVO
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPressRightIcon?: () => void;
  error?: string;
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
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  editable = true,
   rightIcon,
  onPressRightIcon,
  error,
}: IInputProps) => {
  return (
    <View style={[styles.container, { width }]}>
      {(label || icon) && (
        <View style={styles.labelRow}>
          {icon && <Ionicons name={icon} size={18} color="#666" />}
          {label && <Text style={typography.inputlabel}>{label}</Text>}
        </View>
      )}

            <View>
        <TextInput
          style={[
            styles.input,
            multiline && styles.textarea,
            rightIcon && styles.inputWithRightIcon,
            error && styles.inputError,
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />

        {rightIcon && (
          <Pressable style={styles.rightIconButton} onPress={onPressRightIcon}>
            <Ionicons name={rightIcon} size={22} color="#666" />
          </Pressable>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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


  
  inputWithRightIcon: {
    paddingRight: 44,
  },
  rightIconButton: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  
  inputError: {
    borderColor: "red",
  },

  textarea: {
    height: 160,
    textAlignVertical: "top",
    paddingTop: 10,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});