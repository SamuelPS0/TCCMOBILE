import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../../assets/components/Button";
import { DateInput } from "../../assets/components/DateInput";
import { Header } from "../../assets/components/Header";
import { Input } from "../../assets/components/Input";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";

export default function Cadastro() {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [nome, setNome] = useState("");
  const [telefoneDDD, setTelefoneDDD] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [estado, setEstado] = useState("");

  const router = useRouter();

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
      <View style={styles.inputContainer}>
        {/* Nome */}
        <Input
          label="Nome*"
          placeholder="Digite seu nome"
          value={nome}
          onChangeText={setNome}
        />

        {/* Telefone (DDD + Número) */}
        <View style={styles.rowInputs}>
          <Input
            label="Telefone*"
            placeholder="55"
            value={telefoneDDD}
            onChangeText={setTelefoneDDD}
            width="21%"
          />
          <Input
            label=" "
            placeholder="Digite seu telefone"
            value={telefone}
            onChangeText={setTelefone}
            width="75%"
          />
        </View>

        {/* CPF */}
        <Input
          label="CPF*"
          placeholder="Digite seu CPF"
          value={cpf}
          onChangeText={setCpf}
        />

        {/* Email */}
        <Input
          label="Email*"
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
        />

        {/* Senha */}
        <Input
          label="Senha*"
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
        />

        {/* Data de Nascimento + Gênero */}
        <View style={styles.rowInputs}>
          <DateInput
            label="Data de nascimento*"
            value={birthDate}
            onChange={setBirthDate}
            width="48%"
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

        {/* Estado */}
        <SelectInput
          label="Estado"
          selectedValue={estado}
          onValueChange={setEstado}
          options={estados}
        />

        <View style={styles.buttonarea}>
          <Button onPress={() => router.push("/auth/seguranca")}>
            <Text style={typography.buttonText}>Continuar</Text>
          </Button>
        </View>
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

  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 2,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonarea: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 10,
  },
});
