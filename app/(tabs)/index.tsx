import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Header } from "../../assets/components/Header";
import { typography } from "../../assets/globalstyles/fonts";
import Bg from "../../assets/images/backgroundimage.png";
import { useAuth } from "../../src/context/AuthContext";
import { getPendingPrestadorProfile } from "../../src/storage/onboardingStorage";

export default function Landing() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleCreateProfile() {
    if (!user) {
      console.log("Usuário não autenticado");
      return;
    }

    const pendingProfile = await getPendingPrestadorProfile();
    const cpf =
      user.cpf ||
      (pendingProfile?.userId === String(user.id) ? pendingProfile?.cpf : "");

    router.push({
      pathname: "/(telas)/accCreate",
      params: {
        userId: String(user.id),
        cpf: cpf || "",
      },
    });
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={Bg} style={styles.background}>
        <Header style={styles.headerarea}>
          <Text style={typography.title}>Home</Text>
        </Header>
        <Pressable onPress={handleCreateProfile}>
          <View style={styles.card}>
            <Ionicons name="add-outline" size={48} color="#000000" />
            <Text style={typography.alata}>Criar card</Text>
          </View>
        </Pressable>
      </ImageBackground>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerarea: {
    boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)",
  },
  background: {
    flex: 1,
  },
  card: {
    width: 260,
    height: 130,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    flexDirection: "row",
    marginTop: 120,
  },
});
