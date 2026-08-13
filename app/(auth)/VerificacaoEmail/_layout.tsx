import { Stack } from "expo-router";

export default function VerificacaoEmailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="esqsenha1" />
      <Stack.Screen name="esqsenha2" />
      <Stack.Screen name="novaSenha" />
    </Stack>
  );
}