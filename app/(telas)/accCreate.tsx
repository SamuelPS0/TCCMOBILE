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
  const [cpf, setCpf] = useState("");
  const [userId, setUserId] = useState("");

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

  const [loading, setLoading] = useState(false);

  const [contatos, setContatos] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [valorContato, setValorContato] = useState("");

  const [profileImage, setProfileImage] = useState<{
    uri: string;
    base64: string | null;
  } | null>(null);
  const [eventImage, setEventImage] = useState<{
    uri: string;
    base64: string | null;
  } | null>(null);

  const [categoriasApi, setCategoriasApi] = useState([]);

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
    } catch {
      setErroCep("CEP inválido ou não encontrado");
    } finally {
      setLoadingCep(false);
    }
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

  function removerContato(index) {
    setContatos((prev) => prev.filter((_, i) => i !== index));
  }

  function validarFormulario() {
    if (!userId) return "Usuário não autenticado";

    const cpfFinal = String(cpf || cpfPersistido || "").replace(/\D/g, "");
    if (!cpfFinal) return "CPF não informado";

    if (!nome) return "Nome obrigatório";
    if (!categoria) return "Categoria obrigatória";

    return null;
  }

  const handleSubmit = async () => {
    const erro = validarFormulario();

    if (erro) {
      alert(erro);
      return;
    }

    const cpfFinal = String(cpf || cpfPersistido || "").replace(/\D/g, "");

    try {
      setLoading(true);

      // =========================
      // 1. CRIAR PRESTADOR
      // =========================
      const prestadorPayload = {
        usuario_id: Number(userId),
        nome,
        cpf: cpfFinal,
        genero: "Não informado", // ou usar seu state
        telefone: contatos[0]?.valor || "",

        logradouro,
        numeroResidencial: numero,
        complemento,

        cep,
        bairro,
        cidade: municipio,
        uf: estado,

        statusPrestador: "ATIVO",
      };

      console.log("PRESTADOR PAYLOAD:", prestadorPayload);

      const prestadorRes = await globalapi.post("prestador", prestadorPayload);

      const prestadorId = prestadorRes?.data?.id;

      if (!prestadorId) {
        throw new Error("PrestadorId não retornado");
      }

      // =========================
      // 2. CRIAR SERVIÇO
      // =========================
      const servicoPayload = {
        nome: nome, // ou outro campo
        descricao,

        statusServico: true,

        prestador_id: prestadorId,
        categoria_id: Number(categoria),

        foto: eventImage?.base64 || null,
      };

      console.log("SERVICO PAYLOAD:", servicoPayload);

      await globalapi.post("servico", servicoPayload);

      await clearPendingPrestadorProfile();

      alert("Perfil criado com sucesso!");
      router.replace("/(tabs)");
    } catch (error) {
      console.log("ERRO COMPLETO:", error);
      console.log("RESPONSE:", error?.response);
      console.log("DATA:", error?.response?.data);

      alert(
        error?.response?.data?.message ||
          JSON.stringify(error?.response?.data) ||
          "Erro ao criar perfil",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function carregarDados() {
      const pending = await getPendingPrestadorProfile();

      if (pending) {
        setUserId(pending.userId || "");
        setCpf(pending.cpf || "");
        setCpfPersistido(pending.cpf || "");
      }
    }

    carregarDados();
  }, []);

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
              imageUri={profileImage?.uri || null}
              onChangeImage={setProfileImage}
            />
          </View>

          <Input label="Nome" value={nome} onChangeText={setNome} />

          <Input
            label="Descrição"
            multiline
            value={descricao}
            onChangeText={setDescricao}
          />

          <Input label="CEP" value={cep} onChangeText={handleCepChange} />

          {loadingCep && <Text>Buscando CEP...</Text>}
          {erroCep && <Text style={{ color: "red" }}>{erroCep}</Text>}

          <View style={styles.rowInputs}>
            <SelectInput
              label="Estado"
              selectedValue={estado}
              onValueChange={setEstado}
              options={[
                { label: "SP - São Paulo", value: "SP" },
                { label: "RJ - Rio de Janeiro", value: "RJ" },
                { label: "MG - Minas Gerais", value: "MG" },
                { label: "PR - Paraná", value: "PR" },
              ]}
              width={"31%"}
            />

            <View style={styles.municipioContainer}>
              <Input label=" " value={municipio} onChangeText={setMunicipio} />
            </View>
          </View>

          <Input
            label="Logradouro"
            value={logradouro}
            onChangeText={setLogradouro}
          />
          <Input label="Bairro" value={bairro} onChangeText={setBairro} />

          <View style={styles.rowInputs}>
            <Input
              label="Número"
              value={numero}
              onChangeText={setNumero}
              width={"30%"}
            />
            <Input
              label="Complemento"
              value={complemento}
              onChangeText={setComplemento}
              width={"65%"}
            />
          </View>

          {/* CONTATOS */}
          <View style={styles.categoriaContainer}>
            {contatos.length < 5 && (
              <>
                <SelectInput
                  label="Adicionar contato"
                  selectedValue={tipoSelecionado}
                  onValueChange={setTipoSelecionado}
                  options={[
                    { label: "Whatsapp", value: "Whatsapp" },
                    { label: "Instagram", value: "Instagram" },
                    { label: "Facebook", value: "Facebook" },
                  ]}
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

          <SelectInput
            label="Categoria"
            selectedValue={categoria}
            onValueChange={setCategoria}
            options={categoriasApi}
          />

          <ImageUpload
            label="Foto do evento"
            height={200}
            imageUri={eventImage?.uri || null}
            onChangeImage={setEventImage}
          />

          <View style={styles.buttonContainer}>
            <Button onPress={handleSubmit} disabled={loading}>
              <Text style={typography.buttonText}>
                {loading ? "Enviando..." : "Concluir"}
              </Text>
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
