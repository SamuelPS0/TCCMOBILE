import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
import {
  clearPendingPrestadorProfile,
  getPendingPrestadorProfile,
} from "../../src/storage/onboardingStorage";

export default function AccCreate() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [cpfPersistido, setCpfPersistido] = useState("");

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

  // CONTATOS DINÂMICOS
  const [contatos, setContatos] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [valorContato, setValorContato] = useState("");

  async function handleCepChange(text) {
    const cepLimpo = text.replace(/\D/g, "");
    setCep(cepLimpo);

    if (cepLimpo.length !== 8) return;

    try {
      setLoadingCep(true);
      setErroCep("");

      const data = await buscarCep(cepLimpo);

      setEstado(data.uf || "");
      setMunicipio(data.localidade || "");
      setLogradouro(data.logradouro || "");
      setBairro(data.bairro || "");
    } catch (error) {
      setErroCep("CEP inválido ou não encontrado");
    } finally {
      setLoadingCep(false);
    }
  }

  function adicionarContato() {
    if (!tipoSelecionado || !valorContato) return;
    if (contatos.length >= 5) return;

    const novoContato = {
      tipo: tipoSelecionado,
      valor: valorContato,
    };

    setContatos((prev) => [...prev, novoContato]);

    setTipoSelecionado("");
    setValorContato("");
  }

  function removerContato(index) {
    const novaLista = contatos.filter((_, i) => i !== index);
    setContatos(novaLista);
  }

  function validarFormulario() {
    if (!userId) return "Usuário não autenticado";
    if (!cpf) return "CPF não informado";
    const cpfFinal = String(cpf || cpfPersistido || "").replace(/\D/g, "");
    if (!cpfFinal) return "CPF não informado";
    if (!nome) return "Nome obrigatório";
    if (!categoria) return "Categoria obrigatória";
    return null;
  }

  async function handleSubmit() {
    const erro = validarFormulario();
    if (erro) return;
    if (erro) {
      alert(erro);
      return;
    }

    const cpfFinal = String(cpf || cpfPersistido || "").replace(/\D/g, "");

    const formData = new FormData();

    formData.append("usuarioId", String(userId));
    formData.append("cpf", cpf);
    formData.append("cpf", cpfFinal);

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

      await clearPendingPrestadorProfile();
      router.push("/(tabs)");
    } catch (error) {
      console.log(error?.response?.data || error);
      alert("Não foi possível criar o perfil de prestador.");
    }
  }

  const redesocial = [
    { label: "Whatsapp", value: "Whatsapp" },
    { label: "Instagram", value: "Instagram" },
    { label: "Facebook", value: "Facebook" },
  ];

  const estados = [
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PR", nome: "Paraná" },
  ];

  const [categoriasApi, setCategoriasApi] = useState([]);

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

  useEffect(() => {
    async function carregarCpfPendente() {
      if (cpf) return;

      const pendingProfile = await getPendingPrestadorProfile();
      const sameUser = pendingProfile?.userId === String(userId);

      if (sameUser && pendingProfile?.cpf) {
        setCpfPersistido(String(pendingProfile.cpf));
      }
    }

    carregarCpfPendente();
  }, [cpf, userId]);

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
            <ProfilePhoto size={120} />
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

          {/* CEP */}
          <Input
            label="CEP"
            icon="location-outline"
            placeholder="Digite o CEP..."
            value={cep}
            onChangeText={handleCepChange}
          />

          {loadingCep && <Text>Buscando CEP...</Text>}
          {erroCep && <Text style={{ color: "red" }}>{erroCep}</Text>}

          {/* Estado + Município */}
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

          {/* CONTATOS DINÂMICOS */}
          <View style={styles.categoriaContainer}>
            {contatos.length < 5 && (
              <>
                <SelectInput
                  label="Adicionar contato"
                  icon="call-outline"
                  selectedValue={tipoSelecionado}
                  onValueChange={setTipoSelecionado}
                  options={redesocial}
                />

                {tipoSelecionado !== "" && (
                  <View style={{ marginTop: 10 }}>
                    <Input
                      placeholder="Digite o contato..."
                      value={valorContato}
                      onChangeText={setValorContato}
                    />

                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={adicionarContato}
                    >
                      <Text style={styles.addButtonText}>Adicionar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {contatos.length > 0 && (
              <View style={{ marginTop: 15 }}>
                {contatos.map((item, index) => (
                  <View key={index} style={styles.contatoItem}>
                    <View>
                      <Text style={styles.contatoTipo}>{item.tipo}</Text>
                      <Text style={styles.contatoValor}>{item.valor}</Text>
                    </View>

                    <TouchableOpacity onPress={() => removerContato(index)}>
                      <Text style={styles.remover}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {contatos.length >= 5 && (
              <Text style={styles.limiteTexto}>
                Limite de 5 contatos atingido
              </Text>
            )}
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
          />

          <View style={styles.buttonContainer}>
            <Button onPress={() => router.push("/(tabs)")}>
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

  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  municipioContainer: {
    width: "65%",
  },

  categoriaContainer: {
    width: "100%",
  },

  addButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

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

  contatoTipo: {
    fontWeight: "bold",
  },

  contatoValor: {
    color: "#555",
  },

  remover: {
    color: "red",
  },

  limiteTexto: {
    marginTop: 10,
    color: "red",
  },

  buttonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
});
