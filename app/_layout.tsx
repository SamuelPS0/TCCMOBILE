import { Alata_400Regular } from "@expo-google-fonts/alata";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { InstrumentSans_700Bold } from "@expo-google-fonts/instrument-sans";

import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    InstrumentSans_700Bold,
    Inter_700Bold,
    Inter_400Regular,
    Alata_400Regular,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
