import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "../../assets/components/Button";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { typography } from "../../assets/globalstyles/fonts";
import LogoExtenso from "../../assets/images/LogoExtenso.png";
import { useAuth } from "../../src/context/AuthContext";
import { loginRequest } from "../../src/services/authService";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);

      const usuario = await loginRequest(email, senha);

      await login(usuario);

      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (message === "INVALID_CREDENTIALS") {
        Alert.alert("Login inválido", "Email ou senha incorretos.");
      } else if (message === "USER_INACTIVE") {
        Alert.alert("Usuário inativo", "Sua conta está desativada.");
      } else {
        Alert.alert("Erro", "Não foi possível realizar o login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Login</Text>
      </Header>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>

      <View style={styles.logoarea}>
        <Image source={LogoExtenso} style={styles.mainlogo} />
      </View>

      <View style={styles.inputsarea}>
        <Input
          label="Email*"
          placeholder="Digite seu email"
          width="90%"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Input
          label="Senha*"
          placeholder="Digite sua senha"
          width="90%"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonarea}>
        <Button onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={typography.buttonText}>Continuar</Text>
          )}
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
