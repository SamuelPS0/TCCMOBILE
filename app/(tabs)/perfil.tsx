import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header } from "../../assets/components/Header";
import { typography } from "../../assets/globalstyles/fonts";
import Bg from "../../assets/images/backgroundimage.png";
import { useAuth } from "../../src/context/AuthContext";

export default function Perfil() {
  const router = useRouter();
  const { logout } = useAuth();

  const FORMS_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSdGP9PZDXYMJVUacDK0O_-3uU-syLAvq3WLtg9W_3dzG3fShA/viewform";

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)");
    } catch {
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  };

  const handleFaleConosco = async () => {
    const supported = await Linking.canOpenURL(FORMS_URL);
    if (supported) {
      await Linking.openURL(FORMS_URL);
    } else {
      Alert.alert("Erro", "Não foi possível abrir o link do formulário.");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={Bg} style={styles.background}>
        <Header>
          <Text style={typography.title}>Minha conta</Text>
        </Header>

        <View style={styles.content}>
          <View style={styles.contentheader}>
            <Text style={[typography.title, { fontSize: 20, color: "#F05221" }]}>
              Minha conta
            </Text>
          </View>

          <View style={styles.contentbody}>
            <Pressable
              style={styles.buttons}
              onPress={() => router.push("/(telas)/personalinfo")}
            >
              <Ionicons
                name="person-outline"
                size={22}
                color="#333"
                style={styles.icon}
              />
              <Text style={typography.cardtext}>Informações de usuário</Text>
            </Pressable>

            <Pressable
              style={styles.buttons}
              onPress={() => router.push("/(telas)/workinfo")}
            >
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#333"
                style={styles.icon}
              />
              <Text style={typography.cardtext}>Gerenciar perfil</Text>
            </Pressable>

            <Pressable style={styles.buttons} onPress={handleFaleConosco}>
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color="#333"
                style={styles.icon}
              />
              <Text style={typography.cardtext}>Fale conosco</Text>
            </Pressable>

            <Pressable style={styles.buttons} onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#333"
                style={styles.icon}
              />
              <Text style={typography.cardtext}>Desconectar</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    width: 280,
    marginTop: 140,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignSelf: "center",
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  contentheader: {
    paddingBottom: 12,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  contentbody: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
  },
  buttons: {
    width: "90%",
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
    marginLeft: 14,
  },
});