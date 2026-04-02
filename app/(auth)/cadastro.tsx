import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { globalapi } from "../../assets/api/globalapi";

import { Button } from "../../assets/components/Button";
import { DateInput } from "../../assets/components/DateInput";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";
import { savePendingPrestadorProfile } from "../../src/storage/onboardingStorage";

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
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function formatDate(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`;
  }

  function maskDDD(value: string) {
    return value.replace(/\D/g, "").slice(0, 2);
  }

  function maskTelefone(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    return numbers
      .replace(/^(\d{2})(\d)/, "($1)$2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  function maskCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  const handleSubmit = async () => {
    if (loading) return;

    const telefoneNumerico = telefone.replace(/\D/g, "");

    if (!nome.trim() || !email.trim() || !senha || !cpf.trim()) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    if (!birthDate) {
      alert("Informe a data de nascimento");
      return;
    }

    if (senha.length < 6) {
      alert("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (!email.includes("@")) {
      alert("Email inválido");
      return;
    }

    if (telefoneDDD.length !== 2 || telefoneNumerico.length < 8) {
      alert("Telefone inválido");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha,
        nivelAcesso: "PRESTADOR",
        dataCadastro: formatDate(new Date()),
        statusUsuario: true,
        telefone: `${telefoneDDD}${telefoneNumerico}`,
        cpf: cpf.replace(/\D/g, ""),
        dataNascimento: formatDate(birthDate),
      };

      const response = await globalapi.post("Usuario", payload);

      const userId = response?.data?.id;
            const cpfLimpo = cpf.replace(/\D/g, "");

      await savePendingPrestadorProfile({
        userId: String(userId),
        cpf: cpfLimpo,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
      })
      

      router.push({
<<<<<<< HEAD
                pathname: "/(auth)/seguranca",
        params: {
          userId: String(userId),
          cpf: cpfLimpo,
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
=======
        pathname: "/(auth)/seguranca",
        params: {
          userId: String(userId),
          cpf: cpf.replace(/\D/g, ""),
        },
>>>>>>> e539872adacedee792487ceba141c530361d4f77
      });
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 400) {
        alert("Dados inválidos ou email já cadastrado");
      } else if (error.response?.status === 409) {
        alert("Email já está em uso");
      } else {
        alert("Erro ao criar conta. Tente novamente.");
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

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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
              onChangeText={(text) => setTelefone(maskTelefone(text))}
              width="75%"
              keyboardType="numeric"
            />
          </View>

          <Input
            label="CPF*"
            value={cpf}
            onChangeText={(text) => setCpf(maskCPF(text))}
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
              value={birthDate}
              onChange={(date: Date) => setBirthDate(date)}
              width="48%"
              placeholder="Selecione a data"
            />

            <SelectInput
              label="Gênero"
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
            label="Estado"
            selectedValue={estado}
            onValueChange={setEstado}
            options={estados}
          />

          <View style={styles.buttonarea}>
            <Button onPress={handleSubmit}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={typography.buttonText}>Continuar</Text>
              )}
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
