import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatApiError, globalapi } from "../../assets/api/globalapi";
import { Button } from "../../assets/components/Button";
import { CheckboxInput } from "../../assets/components/CheckboxInput";
import { DateInput } from "../../assets/components/DateInput";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";
import { useAuth } from "../../src/context/AuthContext";
import { savePendingPrestadorProfile } from "../../src/storage/onboardingStorage";

// ================== MÁSCARAS ==================
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



function getPasswordRequirements(value: string) {
  return [
    { label: "Mínimo de 6 caracteres", isValid: value.length >= 6 },
    { label: "Uma letra maiúscula", isValid: /[A-Z]/.test(value) },
    { label: "Uma letra minúscula", isValid: /[a-z]/.test(value) },
    { label: "Um número", isValid: /\d/.test(value) },
    { label: "Uma pontuação", isValid: /[!-/:-@[-`{-~]/.test(value) },
  ];
}

function isStrongPassword(value: string) {
  return getPasswordRequirements(value).every(
    (requirement) => requirement.isValid,
  );
}

export default function Cadastro() {
  const router = useRouter();
  const { login } = useAuth();

  const [nome, setNome] = useState("");
  const [telefoneDDD, setTelefoneDDD] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [estado, setEstado] = useState("");

  const [acceptTerms1, setAcceptTerms1] = useState(false);
  const [acceptTerms2, setAcceptTerms2] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordRequirements = getPasswordRequirements(senha);

  function formatDate(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`;
  }

  function isAtLeast18YearsOld(date: Date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    return age >= 18;
  }

  const handleSubmit = async () => {
    if (loading) return;

    const errors: Record<string, string> = {};

    const nomeTrim = nome.trim();
    const emailTrim = email.trim().toLowerCase();
    const cpfLimpo = onlyDigits(cpf);
    const dddLimpo = onlyDigits(telefoneDDD);
    const telefoneLimpo = onlyDigits(telefone);
    const telefoneCompleto = dddLimpo + telefoneLimpo;

    if (!nomeTrim) errors.nome = "Nome é obrigatório";

    if (!emailTrim) {
      errors.email = "Email é obrigatório";
    } else if (!emailTrim.includes("@")) {
      errors.email = "Email deve conter '@'";
    }

    if (!senha) {
      errors.senha = "Senha é obrigatória";
    } else if (senha.length < 6) {
      errors.senha = "Senha deve ter no mínimo 6 caracteres";
    } else if (!isStrongPassword(senha)) {
      errors.senha =
        "Senha deve conter letra maiúscula, letra minúscula, número e pontuação";
    }

    if (!cpfLimpo) {
      errors.cpf = "CPF é obrigatório";
    } else if (cpfLimpo.length !== 11) {
      errors.cpf = "CPF inválido";
    }

    if (dddLimpo.length !== 2) {
      errors.telefoneDDD = "DDD inválido";
    }

    if (telefoneLimpo.length < 8 || telefoneLimpo.length > 9) {
      errors.telefone = "Telefone inválido";
    }

    if (!birthDate) {
      errors.birthDate =
        "O campo data de nascimento deve ser preenchido obrigatoriamente";
    } else if (!isAtLeast18YearsOld(birthDate)) {
      errors.birthDate = "Você precisa ter 18 anos ou mais";
    }

    if (!gender)
      errors.gender = "O campo gênero deve ser preenchido obrigatoriamente";

    if (!estado)
      errors.estado = "O campo estado deve ser preenchido obrigatoriamente";

    if (!acceptTerms1) {
      errors.terms1 = "Você precisa aceitar os termos";
    }

    if (!acceptTerms2) {
      errors.terms2 = "Você precisa aceitar os termos";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const normalizedGender =
        gender === "m"
          ? "Masculino"
          : gender === "f"
            ? "Feminino"
            : gender === "o"
              ? "Outro"
              : "Não informado";

      const payload = {
        nome: nomeTrim,
        username: emailTrim,
        password: senha,
        nivelAcesso: "PRESTADOR",
      };

      const response = await globalapi.post("usuario/create", payload);
      const userId = response?.data?.id;

      if (!userId) {
        throw new Error("ID do usuário não retornado");
      }

      await savePendingPrestadorProfile({
        userId: String(userId),
        cpf: cpfLimpo,
        nome: nomeTrim,
        email: emailTrim,
        telefone: telefoneCompleto,
        birthDate: formatDate(birthDate!),
        gender: normalizedGender,
        estado,
      });

      const userData = {
        id: userId,
        nome: nomeTrim,
        username: emailTrim,
        email: emailTrim,
        cpf: cpfLimpo,
        nivelAcesso: "PRESTADOR",
        statusUsuario: response?.data?.statusUsuario ?? "ATIVO",
      };

      await login(userData);

      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.response?.status === 400) {
        Alert.alert("Erro", "Dados inválidos.");
      } else if (error.response?.status === 409) {
        Alert.alert("Erro", "Email já está em uso.");
      } else {
        Alert.alert("Erro ao finalizar cadastro", formatApiError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const estados = [
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
  ];

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Cadastro</Text>
      </Header>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <Input
            label="Nome*"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              setFieldErrors((prev) => ({ ...prev, nome: "" }));
            }}
            error={fieldErrors.nome}
          />

          <View style={styles.rowInputs}>
            <Input
              label="DDD*"
              value={telefoneDDD}
              onChangeText={(text) => {
                setTelefoneDDD(maskDDD(text));
                setFieldErrors((prev) => ({ ...prev, telefoneDDD: "" }));
              }}
              width="21%"
              keyboardType="numeric"
              error={fieldErrors.telefoneDDD}
            />
            <Input
              label="Telefone*"
              value={telefone}
              onChangeText={(text) => {
                setTelefone(maskPhone(text));
                setFieldErrors((prev) => ({ ...prev, telefone: "" }));
              }}
              width="75%"
              keyboardType="numeric"
              error={fieldErrors.telefone}
            />
          </View>

         

          <Input
            label="CPF*"
            value={cpf}
            onChangeText={(text) => {
              setCpf(maskCPF(text));
              setFieldErrors((prev) => ({ ...prev, cpf: "" }));
            }}
            keyboardType="numeric"
            error={fieldErrors.cpf}
          />

          <Input
            label="Email*"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            autoCapitalize="none"
            error={fieldErrors.email}
          />

          <View>
            <Input
              label="Senha*"
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                setFieldErrors((prev) => ({ ...prev, senha: "" }));
              }}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onPressRightIcon={() => setShowPassword((prev) => !prev)}
              error={fieldErrors.senha}
            />

            <View style={styles.rulesGrid}>
              {passwordRequirements.map((requirement) => {
                const valid = requirement.isValid;
                return (
                  <View 
                    key={requirement.label} 
                    style={[
                      styles.ruleBadge, 
                      { backgroundColor: valid ? '#e8f5e9' : '#fbe9e7' }
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
                        { color: valid ? '#2e7d32' : '#d32f2f' }
                      ]}
                    >
                      {requirement.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.rowInputs}>
            {Platform.OS === "web" ? (
              <View style={{ width: "48%" }}>
                <Text>Data de nascimento*</Text>
                <input
                  type="date"
                  min="1900-01-01"
                  placeholder="Selecione"
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    marginTop: 4,
                  }}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setBirthDate(null);
                      return;
                    }
                    const date = new Date(e.target.value);
                    setBirthDate(date);
                    setFieldErrors((prev) => ({ ...prev, birthDate: "" }));
                  }}
                />
                {fieldErrors.birthDate && (
                  <Text style={{ color: "red" }}>{fieldErrors.birthDate}</Text>
                )}
              </View>
            ) : (
              <DateInput
                label="Data de nascimento*"
                value={birthDate}
                onChange={(date: Date) => {
                  setBirthDate(date);
                  setFieldErrors((prev) => ({ ...prev, birthDate: "" }));
                }}
                width="48%"
                minimumDate={new Date(1900, 0, 1)}
                error={fieldErrors.birthDate}
              />
            )}

            <SelectInput
              label="Gênero*"
              selectedValue={gender}
              onValueChange={(value) => {
                setGender(value);
                setFieldErrors((prev) => ({ ...prev, gender: "" }));
              }}
              width="48%"
              error={fieldErrors.gender}
              options={[
                { label: "Selecione", value: "", enabled: false },
                { label: "Masculino", value: "m" },
                { label: "Feminino", value: "f" },
                { label: "Não-binario", value: "b" },
                { label: "Outro", value: "o" },
              ]}
            />
          </View>

          <SelectInput
            label="Estado*"
            selectedValue={estado}
            onValueChange={(value) => {
              setEstado(value);
              setFieldErrors((prev) => ({ ...prev, estado: "" }));
            }}
            options={estados}
            error={fieldErrors.estado}
          />

          <View style={styles.checkboxes}>
            <View>
              <CheckboxInput
                label={
                  <Text style={{ color: "#000" }}>
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
                  <Text style={{ color: "#000" }}>
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

          <View style={styles.buttonarea}>
            <Button onPress={handleSubmit}>
              <Text style={typography.buttonText}>
                {loading ? "Carregando..." : "Cadastrar"}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },

  ruleText: {
    fontSize: 12,
    fontWeight: "600",
  },

  checkboxes: {
    marginTop: 15,
    gap: 10,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },

  buttonarea: {
    marginTop: 20,
  },
});