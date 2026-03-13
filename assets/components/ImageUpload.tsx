import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ImageUploadProps {
  label?: string;
  icon?: string; // nova prop para ícone
  width?: number | string;
  height?: number;
}

export const ImageUpload = ({
  label,
  icon,
  width = "100%",
  height = 150,
}: ImageUploadProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permissão para acessar fotos é necessária!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { width }]}>
      {(label || icon) && (
        <View style={styles.labelRow}>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color="#666"
              style={{ marginRight: 6 }}
            />
          )}
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[styles.uploadBox, { height }]}
        onPress={pickImage}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%", borderRadius: 6 }}
          />
        ) : (
          <Ionicons name="image-outline" size={40} color="#999" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { color: "#727272", fontWeight: "500", fontSize: 14 },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
});
