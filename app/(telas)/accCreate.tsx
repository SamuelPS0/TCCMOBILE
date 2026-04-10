import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useAuth } from "../../src/context/AuthContext";
import { updateUsuarioFoto } from "../../src/services/prestadorService";
import {
  clearPendingPrestadorProfile,
  getPendingPrestadorProfile,
} from "../../src/storage/onboardingStorage";

export default function AccCreate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [cpf, setCpf] = useState("");
  const [cpfPersistido, setCpfPersistido] = useState("");
  const [userId, setUserId] = useState("");

  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [categoria, setCategoria] = useState("");

  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");

  const [contatos, setContatos] = useState<any[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [valorContato, setValorContato] = useState("");

  const [profileImage, setProfileImage] = useState<any>(null);
  const [eventImage, setEventImage] = useState<any>(null);

  const [categoriasApi, setCategoriasApi] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  // =========================
  // CEP
  // =========================
function formatCep(value: string) {
  const cep = value.replace(/\D/g, "");
  return cep.replace(/^(\d{5})(\d)/, "$1-$2");
}

async function handleCepChange(text: string) {
  const cepLimpo = text.replace(/\D/g, "");
  setCep(cepLimpo);

  if (cepLimpo.length !== 8) return;

  try {
    setLoadingCep(true);
    setErroCep("");

    const data = await buscarCep(cepLimpo);

    if (data.erro) {
      setErroCep("CEP inválido");
      return;
    }

    setEstado(data.uf || "");
    setMunicipio(data.localidade || "");
    setLogradouro(data.logradouro || "");
    setBairro(data.bairro || "");
  } catch (e) {
    setErroCep("Erro ao buscar CEP");
  } finally {
    setLoadingCep(false);
  }
}

  // =========================
  // CONTATOS
  // =========================
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

  // =========================
  // VALIDACAO
  // =========================
  function validar() {
    const uid = Number(userId);
    if (!uid) return "User inválido";
    if (!nome) return "Nome obrigatório";
    if (!categoria) return "Categoria obrigatória";

    return null;
  }

  // =========================
  // SUBMIT (BASE64 ONLY)
  // =========================
  const handleSubmit = async () => {
    const erro = validar();
    if (erro) return alert(erro);

    const cpfFinal = (cpf || cpfPersistido || "").replace(/\D/g, "");

    try {
      setLoading(true);

      console.log("=== SUBMIT START ===");
      const profilePhotoBase64 = profileImage?.base64 || null;
      const normalizedProfilePhotoBase64 =
        typeof profilePhotoBase64 === "string" &&
        profilePhotoBase64.startsWith("data:")
          ? profilePhotoBase64.split(",")[1] || profilePhotoBase64
          : profilePhotoBase64;

      if (normalizedProfilePhotoBase64) {
        await updateUsuarioFoto(
  Number(userId),
  normalizedProfilePhotoBase64
);
      }

      const prestadorPayload = {
        usuario: { id: Number(userId) },
        nome,
        cpf: cpfFinal,
        genero: "Não informado",
        telefone: contatos?.[0]?.valor || "",
        logradouro,
        numeroResidencial: numero,
        complemento,
        cep,
        bairro,
        cidade: municipio,
        uf: estado,
        statusPrestador: "ATIVO",
      };

      console.log("PRESTADOR:", prestadorPayload);

      const prestadorRes = await globalapi.post("prestador", prestadorPayload);
      const prestadorId = prestadorRes.data?.id;

      if (!prestadorId) throw new Error("Prestador não retornado");

      const servicoPayload = {
        nome,
        descricao,
        statusServico: true,
        prestadorId,
        categoriaId: Number(categoria),
        foto: eventImage?.base64 || null,
      };

      console.log("SERVICO:", {
        ...servicoPayload,
        foto: servicoPayload.foto ? "[BASE64 OK]" : null,
      });

      await globalapi.post("servico", servicoPayload);

      await clearPendingPrestadorProfile();

      console.log("=== SUCCESS ===");

      alert("Perfil criado com sucesso!");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("=== ERROR ===");
      console.log(error?.response?.data || error.message);

      alert(error?.response?.data?.message || "Erro ao criar perfil");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    async function load() {
      const pending = await getPendingPrestadorProfile();

      const resolvedUserId = String(
        params.userId ?? pending?.userId ?? user?.id ?? "",
      );

      const resolvedCpf = String(params.cpf ?? pending?.cpf ?? user?.cpf ?? "");

      setUserId(resolvedUserId);
      setCpf(resolvedCpf);
      setCpfPersistido(resolvedCpf);
    }

    load();
  }, []);

  // =========================
  // LOAD CATEGORIAS
  // =========================
  useEffect(() => {
    async function loadCategorias() {
      const res = await globalapi.get("categoria");

      const lista = res.data
        .filter((c: any) => c.statusCategoria)
        .map((c: any) => ({
          label: c.nome,
          value: c.id,
        }));

      setCategoriasApi(lista);
    }

    loadCategorias();
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

          <Input
  label="CEP"
  value={formatCep(cep)}
  onChangeText={handleCepChange}
/>

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
