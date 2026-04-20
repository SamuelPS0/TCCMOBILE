import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import React from "react";
import { globalapi } from "../../assets/api/globalapi";
import BottomNav from "../../assets/components/BottomNav";
import { Button } from "../../assets/components/Button";
import { DateInput } from "../../assets/components/DateInput";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";
import { useAuth } from "../../src/context/AuthContext";
import { getPrestadorByUsuario } from "../../src/services/prestadorService";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCPF(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function maskDDD(value: string) {
  return onlyDigits(value).slice(0, 2);
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 9);

  if (digits.length <= 4) return digits;

  if (digits.length <= 8) {
    return digits.replace(/(\d{4})(\d+)/, "$1-$2");
  }

  return digits.replace(/(\d{5})(\d+)/, "$1-$2");
}

function asDate(value: any) {
  if (!value) return new Date(2000, 0, 1);

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(2000, 0, 1);
  }
  return parsed;
}

function normalizeGender(value: any) {
  const clean = String(value || "").toLowerCase();
  if (["m", "masculino"].includes(clean)) return "m";
  if (["f", "feminino"].includes(clean)) return "f";
  if (["o", "outro"].includes(clean)) return "o";
  return "";
}

async function upsertUsuario(userId: number, payload: Record<string, any>) {
  const endpoints = [`Usuario/${userId}`, `usuario/${userId}`];

  for (const endpoint of endpoints) {
    try {
      const response = await globalapi.put(endpoint, payload);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error;
    }
  }

  throw new Error("ENDPOINT_USUARIO_UPDATE_NOT_FOUND");
}

async function upsertPrestador(
  prestadorId: number,
  payload: Record<string, any>,
) {
  const endpoints = [`prestador/${prestadorId}`, `Prestador/${prestadorId}`];

  for (const endpoint of endpoints) {
    try {
      const response = await globalapi.put(endpoint, payload);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error;
    }
  }

  throw new Error("ENDPOINT_PRESTADOR_UPDATE_NOT_FOUND");
}

export default function Personalinfo() {
  const router = useRouter();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [telefoneDDD, setTelefoneDDD] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1));
  const [estado, setEstado] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [prestadorId, setPrestadorId] = useState<number | null>(null);

  const estados = useMemo(
    () => [
      { label: "Selecione...", value: "" },
      { label: "Acre", value: "AC" },
      { label: "Alagoas", value: "AL" },
      { label: "Amapá", value: "AP" },
      { label: "Amazonas", value: "AM" },
      { label: "Bahia", value: "BA" },
      { label: "Ceará", value: "CE" },
      { label: "Distrito Federal", value: "DF" },
      { label: "Espírito Santo", value: "ES" },
      { label: "Goiás", value: "GO" },
      { label: "Maranhão", value: "MA" },
      { label: "Mato Grosso", value: "MT" },
      { label: "Mato Grosso do Sul", value: "MS" },
      { label: "Minas Gerais", value: "MG" },
      { label: "Pará", value: "PA" },
      { label: "Paraíba", value: "PB" },
      { label: "Paraná", value: "PR" },
      { label: "Pernambuco", value: "PE" },
      { label: "Piauí", value: "PI" },
      { label: "Rio de Janeiro", value: "RJ" },
      { label: "Rio Grande do Norte", value: "RN" },
      { label: "Rio Grande do Sul", value: "RS" },
      { label: "Rondônia", value: "RO" },
      { label: "Roraima", value: "RR" },
      { label: "Santa Catarina", value: "SC" },
      { label: "São Paulo", value: "SP" },
      { label: "Sergipe", value: "SE" },
      { label: "Tocantins", value: "TO" },
    ],
    [],
  );

  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setLoadingData(false);
        return;
      }

      try {
        const [usuarioRes, prestador] = await Promise.all([
          globalapi.get(`Usuario/${user.id}`),
          getPrestadorByUsuario(user.id),
        ]);

        const usuario = usuarioRes.data || {};

        const telefoneBruto = onlyDigits(
          prestador?.telefone || usuario?.telefone || "",
        );

        setNome(usuario?.nome || "");
        setEmail(usuario?.email || "");
        setCpf(maskCPF(prestador?.cpf || usuario?.cpf || ""));
        setTelefoneDDD(telefoneBruto.slice(0, 2));
        setTelefone(maskPhone(telefoneBruto.slice(2)));
        setGender(normalizeGender(prestador?.genero || usuario?.genero));
        setBirthDate(
          asDate(prestador?.dataNascimento || usuario?.dataNascimento),
        );
        setEstado(prestador?.uf || usuario?.estado || "");
        setPrestadorId(prestador?.id || null);
      } catch (error: any) {
        Alert.alert(
          "Erro",
          error?.response?.data?.message ||
            "Não foi possível carregar seus dados pessoais.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    const errors: string[] = [];
    const nomeTrim = nome.trim();
    const emailTrim = email.trim().toLowerCase();
    const cpfLimpo = onlyDigits(cpf);
    const dddLimpo = onlyDigits(telefoneDDD);
    const telefoneLimpo = onlyDigits(telefone);
    const telefoneCompleto = dddLimpo + telefoneLimpo;

    if (!nomeTrim) errors.push("Nome é obrigatório");
    if (!emailTrim || !emailTrim.includes("@")) errors.push("Email inválido");
    if (cpfLimpo.length !== 11) errors.push("CPF inválido");
    if (dddLimpo.length !== 2) errors.push("DDD inválido");
    if (telefoneLimpo.length < 8 || telefoneLimpo.length > 9) {
      errors.push("Telefone inválido");
    }
    if (!gender) errors.push("Gênero é obrigatório");
    if (!estado) errors.push("Estado é obrigatório");

    if (errors.length > 0) {
      Alert.alert("Validação", errors.join("\n"));
      return;
    }

    try {
      setLoading(true);

      const usuarioPayload: Record<string, any> = {
        nome: nomeTrim,
        email: emailTrim,
      };

      if (senha.trim().length >= 6) {
        usuarioPayload.senha = senha.trim();
      }

      await upsertUsuario(Number(user.id), usuarioPayload);

      if (prestadorId) {
        const prestadorPayload = {
          nome: nomeTrim,
          cpf: cpfLimpo,
          telefone: telefoneCompleto,
          genero:
            gender === "m"
              ? "Masculino"
              : gender === "f"
                ? "Feminino"
                : "Outro",
          dataNascimento: birthDate.toISOString(),
          uf: estado,
        };

        await upsertPrestador(prestadorId, prestadorPayload);
      }

      Alert.alert("Sucesso", "Informações pessoais atualizadas.");
      router.push("/(telas)/workinfo");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message || "Não foi possível salvar os dados.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Informações pessoais</Text>
      </Header>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          {loadingData ? (
            <Text style={styles.loadingText}>Carregando dados...</Text>
          ) : (
            <>
              <Input label="Nome*" value={nome} onChangeText={setNome} />

              <View style={styles.rowInputs}>
                <Input
                  label="DDD*"
                  value={telefoneDDD}
                  onChangeText={(text) => setTelefoneDDD(maskDDD(text))}
                  width="21%"
                  keyboardType="numeric"
                />
                <Input
                  label="Telefone*"
                  value={telefone}
                  onChangeText={(text) => setTelefone(maskPhone(text))}
                  width="75%"
                  keyboardType="numeric"
                />
              </View>

              <Input
                label="CPF*"
                value={cpf}
                onChangeText={(text) => setCpf(maskCPF(text))}
                keyboardType="numeric"
              />

              <Input
                label="Email*"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />

              <Input
                label="Nova senha (opcional)"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />

              <View style={styles.rowInputs}>
                <DateInput
                  label="Data de nascimento*"
                  value={birthDate}
                  onChange={setBirthDate}
                  width="48%"
                />

                <SelectInput
                  label="Gênero*"
                  selectedValue={gender}
                  onValueChange={setGender}
                  width="48%"
                  options={[
                    { label: "Selecione...", value: "" },
                    { label: "Masculino", value: "m" },
                    { label: "Feminino", value: "f" },
                    { label: "Outro", value: "o" },
                  ]}
                />
              </View>

              <SelectInput
                label="Estado*"
                selectedValue={estado}
                onValueChange={setEstado}
                options={estados}
              />

              <View style={styles.buttonArea}>
                <Button onPress={handleSubmit} disabled={loading}>
                  <Text style={typography.buttonText}>
                    {loading ? "Salvando..." : "Concluir"}
                  </Text>
                </Button>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  backButton: {
    position: "absolute",
    left: 25,
    top: 68,
    zIndex: 1,
  },

  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },

  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  buttonArea: {
    marginTop: 20,
    marginBottom: 12,
  },

  loadingText: {
    marginTop: 18,
    textAlign: "center",
    color: "#666",
  },
});
