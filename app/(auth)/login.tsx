import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../../assets/components/Button";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { typography } from "../../assets/globalstyles/fonts";
import LogoExtenso from "../../assets/images/LogoExtenso.png";


  export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Login</Text>
      </Header>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>
      <View style={styles.logoarea}>
        <Image source={LogoExtenso} style={styles.mainlogo}></Image>
      </View>
      <View style={styles.inputsarea}>
        <Input
          label="Email*"
          placeholder="Digite seu email"
          width={"90%"}
          value={email}
          onChangeText={setEmail}
        />

        <Input
          label="Senha*"
          placeholder="Digite sua senha"
          width={"90%"}
          value={senha}
          onChangeText={setSenha}
        />
      </View>
      <View style={styles.buttonarea}>
        <Button onPress={() => router.replace("/(tabs)")}>
          <Text style={typography.buttonText}>Continuar</Text>
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
  logoarea: {
    flex: 1.7,
    justifyContent: "center",
    paddingRight: 25,
    alignSelf: "center",
  },
  mainlogo: {
    width: 350,
    height: 200,
  },
  inputsarea: {
    flex: 1,
    gap: 20,
  },
  buttonarea: {
    flex: 1,
    alignSelf: "center",
    paddingTop: 55,
    width: "90%",
  },
  backButton: {
    position: "absolute",
    left: 25,
    top: 68,
  },
});
