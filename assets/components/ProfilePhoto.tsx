import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface ProfilePhotoProps {
  size?: number;
  imageUri?: string | null;
  onChangeImage?: (data: { uri: string; base64: string | null }) => void;
  editable?: boolean;
}

export const ProfilePhoto = ({
  size = 100,
  imageUri = null,
  onChangeImage,
  editable = true,
}: ProfilePhotoProps) => {
  const pickPhoto = async () => {
    if (!editable) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permissão necessária para acessar fotos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      onChangeImage?.({
        uri: asset.uri,
        base64: asset.base64 ?? null,
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={pickPhoto}
      style={{ width: size, height: size }}
      activeOpacity={0.8}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Ionicons name="person-outline" size={size / 2} color="#999" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
});
