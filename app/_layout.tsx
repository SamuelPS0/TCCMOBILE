import { useEffect } from "react";
import { useColorScheme } from "react-native";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";

import { Alata_400Regular } from "@expo-google-fonts/alata";
import { InstrumentSans_700Bold } from "@expo-google-fonts/instrument-sans";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";

import { AuthProvider, useAuth } from "../src/context/AuthContext";


// 🔹 Wrapper principal
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}


// 🔹 Navegação + proteção de rotas
function RootNavigation() {
  const colorScheme = useColorScheme();

  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    InstrumentSans_700Bold,
    Inter_700Bold,
    Inter_400Regular,
    Alata_400Regular,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

useEffect(() => {
  if (loading || !segments.length) return;

  const inAuthGroup = segments[0] === "(auth)";

  // 🔥 força abrir no index público
  if (!user && segments[0] === undefined) {
    router.replace("/(auth)");
    return;
  }

  if (!user && !inAuthGroup) {
    router.replace("/(auth)");
  }

  if (user && inAuthGroup) {
    router.replace("/(tabs)");
  }

}, [user, segments, loading, router]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}