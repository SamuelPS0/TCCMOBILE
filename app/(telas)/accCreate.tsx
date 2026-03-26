import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { buscarCep } from "../../assets/api/apiviacep";
import { globalapi } from "../../assets/api/globalapi";
import BottomNav from "../../assets/components/BottomNav";
import { Button } from "../../assets/components/Button";
import { Header } from "../../assets/components/Header";
import { ImageUpload } from "../../assets/components/ImageUpload";
import { Input } from "../../assets/components/Input";
import { ProfilePhoto } from "../../assets/components/ProfilePhoto";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";

// ⚠️ ajuste o caminho conforme seu projeto

export default function AccCreate() {
  const router = useRouter();

  const { userId, cpf } = useLocalSearchParams();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");

  const [categoria, setCategoria] = useState("");

  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");

  const [loadingCep, setLoadingCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const debounceRef = useRef<any>(null);

  const [contatos, setContatos] = useState<any[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [valorContato, setValorContato] = useState("");

  const [categoriasApi, setCategoriasApi] = useState([]);

  const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
  ];

  function maskCEP(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d{0,3})/, "$1-$2");
  }

  function handleCepChange(text: string) {
    const cepNumerico = text.replace(/\D/g, "").slice(0, 8);
    const cepFormatado = maskCEP(text);

    setCep(cepFormatado);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (cepNumerico.length !== 8) return;

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingCep(true);
        setErroCep("");

        const data = await buscarCep(cepNumerico);

        setEstado(data.uf || "");
        setMunicipio(data.localidade || "");
        setLogradouro(data.logradouro || "");
        setBairro(data.bairro || "");
      } catch (error) {
        setErroCep("CEP inválido ou não encontrado");
      } finally {
        setLoadingCep(false);
      }
    }, 500);
  }

  function adicionarContato() {
    if (!tipoSelecionado || !valorContato) return;
    if (contatos.length >= 5) return;

    setContatos((prev) => [
      ...prev,
      { tipo: tipoSelecionado, valor: valorContato },
    ]);

    setTipoSelecionado("");
    setValorContato("");
  }

  function removerContato(index: number) {
    setContatos((prev) => prev.filter((_, i) => i !== index));
  }

  function validarFormulario() {
    if (!userId) return "Usuário não autenticado";
    if (!cpf) return "CPF não informado";
    if (!nome) return "Nome obrigatório";
    if (!categoria) return "Categoria obrigatória";
    return null;
  }

  async function handleSubmit() {
    const erro = validarFormulario();
    if (erro) return;

    const formData = new FormData();

    formData.append("usuarioId", String(userId));
    formData.append("cpf", cpf);

    formData.append("nome", nome);
    formData.append("descricao", descricao);

    formData.append("categoria", categoria);

    formData.append("cep", cep.replace(/\D/g, ""));
    formData.append("cidade", municipio);
    formData.append("uf", estado);

    formData.append("logradouro", logradouro);
    formData.append("bairro", bairro);
    formData.append("numero", numero);
    formData.append("complemento", complemento);

    formData.append("contatos", JSON.stringify(contatos));

    if (profileImage) {
      formData.append("profileImage", {
        uri: profileImage,
        type: "image/jpeg",
        name: "profile.jpg",
      });
    }

    if (eventImage) {
      formData.append("eventImage", {
        uri: eventImage,
        type: "image/jpeg",
        name: "event.jpg",
      });
    }

    try {
      await globalapi.post("prestador", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/(tabs)");
    } catch (error) {
      console.log(error?.response?.data || error);
    }
  }

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const response = await globalapi.get("categoria");

        const lista = response.data
          .filter((c) => c.statusCategoria)
          .map((c) => ({
            label: c.nome,
            value: c.id,
          }));

        setCategoriasApi(lista);
      } catch (error) {
        console.log(error);
      }
    }

    carregarCategorias();
  }, []);

  return (
    <View style={styles.screen}>
      <Header>
        <Text style={typography.title}>Criação de perfil</Text>
      </Header>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View>
          <View style={styles.photoContainer}>
            <ProfilePhoto
              size={120}
              imageUri={profileImage}
              onChangeImage={(data) => setProfileImage(data.uri)}
            />
          </View>

          <Input
            label="Nome"
            icon="person-outline"
            placeholder="Digite aqui o nome..."
            value={nome}
            onChangeText={setNome}
          />

          <Input
            label="Descrição"
            icon="document-text-outline"
            placeholder="Digite aqui a descrição..."
            multiline
            value={descricao}
            onChangeText={setDescricao}
          />

          <Input
            label="CEP"
            icon="location-outline"
            placeholder="Digite o CEP..."
            value={cep}
            onChangeText={handleCepChange}
            keyboardType="numeric"
          />

          {loadingCep && <Text>Buscando CEP...</Text>}
          {erroCep && <Text style={{ color: "red" }}>{erroCep}</Text>}

          <View style={styles.rowInputs}>
            <SelectInput
              label="Estado"
              icon="location-outline"
              selectedValue={estado}
              onValueChange={setEstado}
              options={estados.map((e) => ({
                label: `${e.sigla} - ${e.nome}`,
                value: e.sigla,
              }))}
              width={"31%"}
            />

            <View style={styles.municipioContainer}>
              <Input
                label=" "
                placeholder="Município"
                value={municipio}
                onChangeText={setMunicipio}
              />
            </View>
          </View>

          <Input
            label="Logradouro"
            icon="home-outline"
            placeholder="Rua, avenida..."
            value={logradouro}
            onChangeText={setLogradouro}
          />

          <Input
            label="Bairro"
            icon="map-outline"
            placeholder="Digite o bairro..."
            value={bairro}
            onChangeText={setBairro}
          />

          <View style={styles.rowInputs}>
            <Input
              label="Número"
              placeholder="Nº"
              value={numero}
              onChangeText={setNumero}
              width={"30%"}
            />

            <Input
              label="Complemento"
              placeholder="Apto, casa..."
              value={complemento}
              onChangeText={setComplemento}
              width={"65%"}
            />
          </View>

          <SelectInput
            label="Categoria"
            icon="restaurant-outline"
            selectedValue={categoria}
            onValueChange={setCategoria}
            options={categoriasApi}
          />

          <ImageUpload
            label="Foto do evento"
            icon="camera-outline"
            height={200}
            imageUri={eventImage}
            onChangeImage={(data) => setEventImage(data.uri)}
          />

          <View style={styles.buttonContainer}>
            <Button onPress={handleSubmit}>
              <Text style={typography.buttonText}>Concluir</Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  content: { padding: 20, gap: 20 },
  photoContainer: { alignItems: "center", marginBottom: 20, marginTop: 10 },
  rowInputs: { flexDirection: "row", justifyContent: "space-between" },
  municipioContainer: { width: "65%" },
  categoriaContainer: { width: "100%" },
  addButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  contatoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
  },
  contatoTipo: { fontWeight: "bold" },
  contatoValor: { color: "#555" },
  remover: { color: "red" },
  limiteTexto: { marginTop: 10, color: "red" },
  buttonContainer: { marginTop: 30, alignItems: "center" },
});
