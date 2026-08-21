import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { globalapi } from "../../assets/api/globalapi";
import BottomNav from "../../assets/components/BottomNav";
import { DateInput } from "../../assets/components/DateInput";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";
import { useAuth } from "../../src/context/AuthContext";
import { getPrestadorByUsuario } from "../../src/services/prestadorService";

function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
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

function getPasswordRequirements(value: string) {
  return [
    { label: "Mínimo de 6 caracteres", isValid: value.length >= 6 },
    { label: "Uma letra maiúscula", isValid: /[A-Z]/.test(value) },
    { label: "Uma letra minúscula", isValid: /[a-z]/.test(value) },
    { label: "Um número", isValid: /\d/.test(value) },
    { label: "Uma pontuação/especial", isValid: /[!@#$%^&*(),.?":{}|<>\-_=+\\[\]/\\;']/.test(value) },
  ];
}

function isStrongPassword(value: string) {
  return getPasswordRequirements(value).every((req) => req.isValid);
}

async function upsertUsuario(userId: number, payload: Record<string, any>) {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    formData.append("usuario", jsonBlob);
  } else {
    formData.append("usuario", JSON.stringify(payload) as any);
  }

  const response = await globalapi.put(`usuario/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

async function upsertPrestador(
  prestadorId: number,
  payload: Record<string, any>,
) {
  const response = await globalapi.put(`prestador/${prestadorId}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
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
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1));
  const [estado, setEstado] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [prestadorId, setPrestadorId] = useState<number | null>(null);

  const passwordRequirements = useMemo(() => getPasswordRequirements(senha), [senha]);

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
          globalapi.get(`usuario/${user.id}`),
          getPrestadorByUsuario(user.id),
        ]);

        const usuario = usuarioRes.data || {};
        const telefoneBruto = onlyDigits(
          prestador?.telefone || usuario?.telefone || "",
        );

        const emailCarregado =
          usuario?.email ||
          usuario?.username ||
          prestador?.email ||
          user?.email ||
          user?.username ||
          "";

        setNome(usuario?.nome || user?.nome || "");
        setEmail(emailCarregado);
        setCpf(maskCPF(prestador?.cpf || usuario?.cpf || user?.cpf || ""));
        setTelefoneDDD(telefoneBruto.slice(0, 2));
        setTelefone(maskPhone(telefoneBruto.slice(2)));
        setGender(normalizeGender(prestador?.genero || usuario?.genero));
        setBirthDate(
          asDate(prestador?.dataNascimento || usuario?.dataNascimento),
        );
        setEstado(prestador?.uf || usuario?.estado || "");
        setPrestadorId(prestador?.id || null);
      } catch (error: any) {
        showAlert(
          "Erro",
          error?.response?.data?.message ||
            "Não foi possível carregar seus dados pessoais.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [user]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!user?.id) {
      showAlert("Erro", "Usuário não identificado.");
      return;
    }

    const errors: string[] = [];
    const nomeTrim = String(nome || "").trim();
    const emailTrim = String(email || "")
      .trim()
      .toLowerCase();
    const cpfLimpo = onlyDigits(cpf);
    const dddLimpo = onlyDigits(telefoneDDD);
    const telefoneLimpo = onlyDigits(telefone);
    const telefoneCompleto = dddLimpo + telefoneLimpo;

    if (!nomeTrim) errors.push("Nome é obrigatório.");
    if (!emailTrim || !emailTrim.includes("@")) errors.push("Email inválido.");
    if (cpfLimpo.length !== 11)
      errors.push("CPF inválido (deve conter 11 dígitos).");
    if (dddLimpo.length !== 2)
      errors.push("DDD inválido (deve conter 2 dígitos).");
    if (telefoneLimpo.length < 8 || telefoneLimpo.length > 9) {
      errors.push("Telefone inválido (deve conter 8 ou 9 dígitos).");
    }
    if (!gender) errors.push("Gênero é obrigatório.");
    if (!estado) errors.push("Estado é obrigatório.");

    // Validação de Obrigatoriedade da Nova Senha (se preenchida)
    if (senha.trim().length > 0 && !isStrongPassword(senha)) {
      errors.push("A nova senha precisa cumprir todos os requisitos de segurança.");
    }

    if (errors.length > 0) {
      showAlert("Campos pendentes", errors.join("\n"));
      return;
    }

    try {
      setLoading(true);

      const usuarioPayload: Record<string, any> = {
        nome: nomeTrim,
        username: emailTrim,
        email: emailTrim,
      };

      if (senha.trim().length > 0) {
        usuarioPayload.senha = senha.trim();
      }

      await upsertUsuario(Number(user.id), usuarioPayload);

      if (prestadorId) {
        const parsedDate =
          birthDate instanceof Date && !isNaN(birthDate.getTime())
            ? birthDate
            : new Date(2000, 0, 1);

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
          dataNascimento: parsedDate.toISOString(),
          uf: estado,
        };

        await upsertPrestador(prestadorId, prestadorPayload);
      }

      showAlert("Sucesso", "Informações pessoais atualizadas com sucesso!");
      setSenha("");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      showAlert(
        "Erro ao salvar",
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar os dados.",
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

      <Pressable style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          {loadingData ? (
            <Text style={styles.loadingText}>Carregando dados...</Text>
          ) : (
            <>
              <Input
                label="Nome*"
                value={nome}
                onChangeText={setNome}
                editable={isEditing}
              />

              <View style={styles.rowInputs}>
                <Input
                  label="DDD*"
                  value={telefoneDDD}
                  onChangeText={(text) => setTelefoneDDD(maskDDD(text))}
                  width="21%"
                  keyboardType="numeric"
                  editable={isEditing}
                />
                <Input
                  label="Telefone*"
                  value={telefone}
                  onChangeText={(text) => setTelefone(maskPhone(text))}
                  width="75%"
                  keyboardType="numeric"
                  editable={isEditing}
                />
              </View>

              <Input
                label="CPF*"
                value={cpf}
                onChangeText={(text) => setCpf(maskCPF(text))}
                keyboardType="numeric"
                editable={false}
              />

              <Input
                label="Email*"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                editable={false}
              />

              {isEditing && (
                <View>
                  <Input
                    label="Nova senha (opcional)"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!showPassword}
                    rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                    onPressRightIcon={() => setShowPassword((prev) => !prev)}
                    editable={isEditing}
                  />

                  {senha.length > 0 && (
                    <View style={styles.rulesGrid}>
                      {passwordRequirements.map((requirement) => {
                        const valid = requirement.isValid;
                        return (
                          <View
                            key={requirement.label}
                            style={[
                              styles.ruleBadge,
                              { backgroundColor: valid ? "#e8f5e9" : "#fbe9e7" },
                            ]}
                          >
                            <Ionicons
                              name={valid ? "checkmark-circle" : "close-circle"}
                              size={16}
                              color={valid ? "#2e7d32" : "#d32f2f"}
                            />
                            <Text
                              style={[
                                styles.ruleText,
                                { color: valid ? "#2e7d32" : "#d32f2f" },
                              ]}
                            >
                              {requirement.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.rowInputs}>
                <DateInput
                  label="Data de nascimento*"
                  value={birthDate}
                  onChange={setBirthDate}
                  width="48%"
                  disabled={!isEditing}
                />

                <SelectInput
                  label="Gênero*"
                  selectedValue={gender}
                  onValueChange={setGender}
                  width="48%"
                  disabled={!isEditing}
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
                disabled={!isEditing}
              />

              <View style={styles.buttonArea}>
                {!isEditing ? (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.actionButtonText}>
                      Editar informações
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.actionButton, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.actionButtonText}>
                      {loading ? "Salvando..." : "Salvar alterações"}
                    </Text>
                  </Pressable>
                )}
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

  rulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },

  ruleBadge: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },

  ruleText: {
    fontSize: 12,
    fontWeight: "600",
  },

  buttonArea: {
    marginTop: 20,
    marginBottom: 12,
  },

  actionButton: {
    backgroundColor: "#F05221",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  loadingText: {
    marginTop: 18,
    textAlign: "center",
    color: "#666",
  },
});