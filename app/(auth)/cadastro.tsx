import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import React from "react";
import { Platform } from "react-native";
import { Button } from "../../assets/components/Button";
import { DateInput } from "../../assets/components/DateInput";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";

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

export default function Cadastro() {
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const router = useRouter();

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

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age >= 18;
  }


  const handleSubmit = async () => {
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

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    router.push({
      pathname: "/(auth)/seguranca",
      params: {
        nome: nomeTrim,
        email: emailTrim,
        senha,
        cpf: cpfLimpo,
        telefone: telefoneCompleto,
        gender,
        estado,
        birthDate: formatDate(birthDate!),
      },
    });
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
              onChangeText={(text) => setTelefoneDDD(maskDDD(text))}
              width="21%"
              keyboardType="numeric"
               error={fieldErrors.telefoneDDD}
            />
            <Input
              label="Telefone*"
              value={telefone}
              onChangeText={(text) => setTelefone(maskPhone(text))}
              width="75%"
              keyboardType="numeric"
               error={fieldErrors.telefone}
            />
          </View>

          <Input
            label="CPF*"
            value={cpf}
            onChangeText={(text) => setCpf(maskCPF(text))}
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

          <View style={styles.rowInputs}>
            {Platform.OS === "web" ? (
  <View style={{ width: "48%" }}>
    <Text>Data de nascimento*</Text>
    <input
      type="date"
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
                 { label: "Selecione", value: "" },
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



          <View style={styles.buttonarea}>
            <Button onPress={handleSubmit}>
              <Text style={typography.buttonText}>Continuar</Text>
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
   privacyLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
    marginTop: 8,
    textAlign: "center",
  },

  buttonarea: {
    marginTop: 20,
  },
});

//          <Pressable onPress={() => router.push("/(auth)/politica-privacidade")}>
//            <Text style={styles.privacyLink}>Ler Política de Privacidade</Text>
//          </Pressable>