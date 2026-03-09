import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { typography } from "../globalstyles/fonts";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [telefoneDDD, setTelefoneDDD] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nasc, setNasc] = useState("");
  const [gender, setGender] = useState("");
  const [estado, setEstado] = useState("");

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Cadastro</Text>
      </Header>

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
            width="20%"
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
          <Input
            label="Data de Nascimento*"
            placeholder="DD/MM/AAAA"
            value={nasc}
            onChangeText={setNasc}
            width="48%"
          />
          <Input
            label="Gênero*"
            placeholder="Digite seu gênero"
            value={gender}
            onChangeText={setGender}
            width="48%"
          />
        </View>

        {/* Estado */}
        <Input
          label="Estado*"
          placeholder="Digite seu estado"
          value={estado}
          onChangeText={setEstado}
        />
        <View>
          <Button onPress={() => router.push("/cadastro")}>
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
  inputContainer: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
});
