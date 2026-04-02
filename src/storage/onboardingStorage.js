import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_PRESTADOR_KEY = "pending_prestador_profile";

export async function savePendingPrestadorProfile(data) {
  if (!data) return;

  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PENDING_PRESTADOR_KEY, JSON.stringify(payload));
}

export async function getPendingPrestadorProfile() {
  const raw = await AsyncStorage.getItem(PENDING_PRESTADOR_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearPendingPrestadorProfile() {
  await AsyncStorage.removeItem(PENDING_PRESTADOR_KEY);
}
