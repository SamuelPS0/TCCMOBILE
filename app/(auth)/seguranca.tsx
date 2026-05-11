import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const normalizeSecurityAnswer = (value = "") =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\s/g, "");

  const handleContinue = async () => {
    if (loading) return;

    const errors: Record<string, string> = {};

    if (!chave1.trim()) {
      errors.chave1 = "Campo obrigatório";
    }

    if (!chave2.trim()) {
      errors.chave2 = "Campo obrigatório";
    }

    if (!acceptTerms1) {
      errors.terms1 = "Você precisa aceitar os termos";
    }

    if (!acceptTerms2) {
      errors.terms2 = "Você precisa aceitar os termos";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);

      const nome = String(params.nome ?? "");
      const email = String(params.email ?? "");
      const senha = String(params.senha ?? "");
      const cpf = String(params.cpf ?? "");
      const telefone = String(params.telefone ?? "");
      const birthDate = String(params.birthDate ?? "");
      const rawGender = String(params.gender ?? "").toLowerCase();
      const estado = String(params.estado ?? "");

      const normalizedGender =
        rawGender === "m"
          ? "Masculino"
          : rawGender === "f"
          ? "Feminino"
          : rawGender === "o"
          ? "Outro"
          : "Não informado";

const chave1Normalizada = normalizeSecurityAnswer(chave1);
const chave2Normalizada = normalizeSecurityAnswer(chave2);


const payload = {
  nome,
  email,
  senha,
  nivelAcesso: "PRESTADOR",
  statusUsuario: true,
  ps_01: chave1Normalizada,
  ps_02: chave2Normalizada,
};

      const response = await globalapi.post("Usuario", payload);

      const userId = response?.data?.id;

      if (!userId) {
        throw new Error("ID do usuário não retornado");
      }

      await savePendingPrestadorProfile({
        userId: String(userId),
        cpf,
        nome,
        email,
        telefone,
        birthDate,
        gender: normalizedGender,
        estado,
      });

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
          onChangeText={(text) => {
            setChave1(text);
            setFieldErrors((prev) => ({ ...prev, chave1: "" }));
          }}
          error={fieldErrors.chave1}
        />

        <Input
          label="Qual nome do seu melhor amigo(a) de infância?*"
          placeholder="Digite aqui..."
          width="90%"
          value={chave2}
          onChangeText={(text) => {
            setChave2(text);
            setFieldErrors((prev) => ({ ...prev, chave2: "" }));
          }}
          error={fieldErrors.chave2}
        />
      </View>

      <View style={styles.checkboxes}>
        <View>
          <CheckboxInput
            label={
              <Text>
                Li e aceito os Termos de Uso e a{" "}
                <Text
                  style={{ color: "#007AFF", fontWeight: "500" }}
                  onPress={() =>
                    router.push("/(auth)/politica-privacidade")
                  }
                >
                  Política de Privacidade
                </Text>
              </Text>
            }
            value={acceptTerms1}
            onChange={(value) => {
              setAcceptTerms1(value);
              setFieldErrors((prev) => ({ ...prev, terms1: "" }));
            }}
          />
          {!!fieldErrors.terms1 && (
            <Text style={styles.errorText}>{fieldErrors.terms1}</Text>
          )}
        </View>

        <View>
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
            onChange={(value) => {
              setAcceptTerms2(value);
              setFieldErrors((prev) => ({ ...prev, terms2: "" }));
            }}
          />
          {!!fieldErrors.terms2 && (
            <Text style={styles.errorText}>{fieldErrors.terms2}</Text>
          )}
        </View>
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
    gap: 10,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },

  boxbottom: {
    flex: 0.5,
    justifyContent: "center",
    width: "90%",
    alignSelf: "center",
  },
});