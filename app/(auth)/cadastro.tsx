import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [estado, setEstado] = useState("");

  const router = useRouter();

  function formatDate(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`;
  }

  const handleSubmit = async () => {
    const errors: string[] = [];

    const nomeTrim = nome.trim();
    const emailTrim = email.trim().toLowerCase();
    const cpfLimpo = onlyDigits(cpf);
    const dddLimpo = onlyDigits(telefoneDDD);
    const telefoneLimpo = onlyDigits(telefone);
    const telefoneCompleto = dddLimpo + telefoneLimpo;

    if (!nomeTrim) errors.push("Nome é obrigatório");

    if (!emailTrim) {
      errors.push("Email é obrigatório");
    } else if (!emailTrim.includes("@")) {
      errors.push("Email deve conter '@'");
    }

    if (!senha) {
      errors.push("Senha é obrigatória");
    } else if (senha.length < 6) {
      errors.push("Senha deve ter no mínimo 6 caracteres");
    }

    if (!cpfLimpo) {
      errors.push("CPF é obrigatório");
    } else if (cpfLimpo.length !== 11) {
      errors.push("CPF inválido");
    }

    if (dddLimpo.length !== 2) {
      errors.push("DDD inválido");
    }

    if (telefoneLimpo.length < 8 || telefoneLimpo.length > 9) {
      errors.push("Telefone inválido");
    }

    if (!birthDate) errors.push("Data de nascimento obrigatória");
    if (!gender) errors.push("Gênero é obrigatório");
    if (!estado) errors.push("Estado é obrigatório");

    if (errors.length > 0) {
      console.log("Erros:", errors);
      alert(errors.join("\n"));
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
            label="Senha*"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <View style={styles.rowInputs}>
            <DateInput
              label="Data de nascimento*"
              value={birthDate || new Date()}
              onChange={(date: Date) => setBirthDate(date)}
              width="48%"
            />

            <SelectInput
              label="Gênero*"
              selectedValue={gender}
              onValueChange={setGender}
              width="48%"
              options={[
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

  buttonarea: {
    marginTop: 20,
  },
});
