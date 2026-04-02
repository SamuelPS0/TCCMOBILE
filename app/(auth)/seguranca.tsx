import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { globalapi } from "../../assets/api/globalapi";
import { Button } from "../../assets/components/Button";
import { CheckboxInput } from "../../assets/components/CheckboxInput";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { typography } from "../../assets/globalstyles/fonts";
import { useAuth } from "../../src/context/AuthContext";
import { savePendingPrestadorProfile } from "../../src/storage/onboardingStorage";

export default function Seguranca() {
  const router = useRouter();
  const { login } = useAuth();
  const params = useLocalSearchParams();

  const [chave1, setChave1] = useState("");
  const [chave2, setChave2] = useState("");
  const [acceptTerms1, setAcceptTerms1] = useState(false);
  const [acceptTerms2, setAcceptTerms2] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loading) return;

    if (!chave1.trim() || !chave2.trim()) {
      Alert.alert("Atenção", "Preencha as perguntas de segurança.");
      return;
    }

    if (!acceptTerms1 || !acceptTerms2) {
      Alert.alert("Atenção", "Você precisa aceitar os termos para continuar.");
      return;
    }

    try {
      setLoading(true);

      // ===== DADOS VINDOS DO CADASTRO =====
      const nome = String(params.nome ?? "");
      const email = String(params.email ?? "");
      const senha = String(params.senha ?? "");
      const cpf = String(params.cpf ?? "");
      const telefone = String(params.telefone ?? "");
      const birthDate = String(params.birthDate ?? "");

      // ===== PAYLOAD COMPLETO =====
      const payload = {
        nome,
        email,
        senha,
        cpf,
        telefone,
        dataNascimento: birthDate,
        nivelAcesso: "PRESTADOR",
        statusUsuario: true,
        ps_01: chave1,
        ps_02: chave2,
      };

      console.log("Payload enviado:", payload);

      const response = await globalapi.post("Usuario", payload);

      const userId = response?.data?.id;

      if (!userId) {
        throw new Error("ID do usuário não retornado");
      }

      // ===== SALVA LOCAL =====
      await savePendingPrestadorProfile({
        userId: String(userId),
        cpf,
        nome,
        email,
      });

      // ===== LOGIN =====
      const userData = {
        id: userId,
        nome,
        email,
        cpf,
        nivelAcesso: "PRESTADOR",
        statusUsuario: true,
      };

      await login(userData);

      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("Erro completo:", error);
      console.log("Response:", error?.response);
      console.log("Data:", error?.response?.data);

      if (error.response?.status === 400) {
        Alert.alert("Erro", "Dados inválidos.");
      } else if (error.response?.status === 409) {
        Alert.alert("Erro", "Email já está em uso.");
      } else {
        Alert.alert("Erro", "Erro ao finalizar cadastro.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Cadastro</Text>
      </Header>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>

      <View style={styles.boxtop}>
        <Text style={[typography.title, { fontSize: 28 }]}>
          Perguntas de segurança
        </Text>
      </View>

      <View style={styles.inputarea}>
        <Input
          label="Qual o nome completo da sua mãe?*"
          placeholder="Digite aqui..."
          width="90%"
          value={chave1}
          onChangeText={setChave1}
        />

        <Input
          label="Qual nome do seu melhor amigo(a) de infância?*"
          placeholder="Digite aqui..."
          width="90%"
          value={chave2}
          onChangeText={setChave2}
        />
      </View>

      <View style={styles.checkboxes}>
        <CheckboxInput
          label={
            <Text>
              Li e aceito os Termos de Uso e a{" "}
              <Text style={{ color: "#007AFF", fontWeight: "500" }}>
                Política de Privacidade
              </Text>
            </Text>
          }
          value={acceptTerms1}
          onChange={setAcceptTerms1}
        />

        <CheckboxInput
          label={
            <Text>
              O{" "}
              <Text
                style={{
                  color: "#F05221",
                  fontStyle: "italic",
                  fontWeight: "900",
                }}
              >
                DivulgAí
              </Text>{" "}
              nunca compartilhará seus dados com terceiros.
            </Text>
          }
          value={acceptTerms2}
          onChange={setAcceptTerms2}
        />
      </View>

      <View style={styles.boxbottom}>
        <Button onPress={handleContinue}>
          <Text style={typography.buttonText}>
            {loading ? "Carregando..." : "Continuar"}
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

  backButton: {
    position: "absolute",
    left: 25,
    top: 68,
  },
  boxtop: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  inputarea: {
    flex: 1,
    gap: 50,
    justifyContent: "center",
  },
  checkboxes: {
    flex: 1,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  boxbottom: {
    flex: 0.5,
    justifyContent: "center",
    width: "90%",
    alignSelf: "center",
  },
});
