import Ionicons from "@expo/vector-icons/Ionicons";
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

export default function Perfil() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <ImageBackground source={Bg} style={styles.background}>
        <Header>
          <Text style={typography.title}>Minha conta</Text>
        </Header>
        <View style={styles.content}>
          <View style={styles.contentheader}>
            <Text style={typography.cardtitle}>Minha conta</Text>
          </View>
          <View style={styles.contentbody}>
            <Pressable
              style={styles.buttons}
              onPress={() => router.push("/(telas)/personalinfo")}
            >
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#333"
                style={{ marginRight: 13, marginLeft: 12 }}
              />
              <Text style={typography.cardtext}>Informações de usuário</Text>
            </Pressable>

            <Pressable
              style={styles.buttons}
              onPress={() => router.push("/(telas)/workinfo")}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color="#333"
                style={{ marginRight: 18, marginLeft: 12 }}
              />
              <Text style={typography.cardtext}>Gerenciar perfil</Text>
            </Pressable>

            <Pressable
  style={styles.buttons}
  onPress={() => router.push("/(telas)")}
>
  <Ionicons
    name="log-out-outline"
    size={24}
    color="#333"
    style={{ marginRight: 18, marginLeft: 12 }}
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
  content: {
    width: 260,
    height: 320,
    marginTop: 150,

    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    flexDirection: "column",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  contentheader: {
    padding: 20,
    width: "100%",
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  contentbody: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 8,
    gap: 20,
    marginBottom: 20,
  },
  background: {
    flex: 1,
  },
  buttons: {
    width: "90%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
});
