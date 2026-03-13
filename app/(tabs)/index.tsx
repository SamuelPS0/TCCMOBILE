import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { Header } from "../../assets/components/Header";
import { typography } from "../../assets/globalstyles/fonts";
import Bg from "../../assets/images/backgroundimage.png";

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Home</Text>
      </Header>
      <ImageBackground source={Bg} style={styles.background}>
        <View style={styles.card}>
          <Ionicons name="add-outline" size={48} color="#000000" />
          <Text style={typography.alata}>Criar card</Text>
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
