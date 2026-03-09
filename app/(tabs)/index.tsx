import { Image, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { typography } from "../globalstyles/fonts";
import Logo1 from "../images/LogoCircle.png";
import UniqueLogo from "../images/UniqueLogo.png";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header>
        <Image source={UniqueLogo}></Image>
      </Header>

      <View style={styles.boxtop}>
        <View style={styles.logoWrapper}>
          <Image source={Logo1} style={styles.logocircle} />
        </View>

        <Text
          style={[typography.title, { textAlign: "center", paddingTop: 20 }]}
        >
          Se prepare para uma nova<br></br>{" "}
          <Text style={{ color: "#F05221" }}>experiência</Text>
        </Text>
      </View>

      <View style={styles.boxmid}>
        <Text
          style={[typography.title, { color: "#8D8D8D", textAlign: "center" }]}
        >
          Você está a poucos passos de criar o seu perfil e apresentar ao mundo!
        </Text>
      </View>
      <View style={styles.boxbottom}>
        <Button width="80%">
          <Text style={typography.buttonText}>Cadastro</Text>
        </Button>

        <Button width="80%" variant="secondary">
          <Text style={[typography.buttonText, { color: "#F05221" }]}>
            Login
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  boxtop: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  boxmid: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 30,
    width: "100%",
  },

  boxbottom: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    width: "100%",
  },

  logoWrapper: {
    width: 192,
    height: 192,
    borderRadius: 96, // metade do tamanho

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    elevation: 12,

    backgroundColor: "#fff",
  },

  logocircle: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },
});
