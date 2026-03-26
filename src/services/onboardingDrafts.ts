import AsyncStorage from "@react-native-async-storage/async-storage";

type OnboardingDraft = {
  userId?: string;
  cpf?: string;
};

const ONBOARDING_DRAFT_KEY = "onboarding_draft";

export async function saveOnboardingDraft(draft: OnboardingDraft) {
  try {
    await AsyncStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.log("Erro ao salvar draft de onboarding", error);
  }
}

export async function getOnboardingDraft(): Promise<OnboardingDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_DRAFT_KEY);

    if (!raw) return null;

    try {
  return JSON.parse(raw) as OnboardingDraft;
} catch {
  await AsyncStorage.removeItem(ONBOARDING_DRAFT_KEY);
  return null;
}
  } catch (error) {
    console.log("Erro ao ler draft de onboarding", error);
    return null;
  }
}

export async function clearOnboardingDraft() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch (error) {
    console.log("Erro ao limpar draft de onboarding", error);
  }
}
