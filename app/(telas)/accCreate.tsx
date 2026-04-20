import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [telefoneUsuario, setTelefoneUsuario] = useState("");

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

  function debugAlert(title: string, details: Record<string, any>) {
    const formatValue = (value: any) => {
      if (value == null) return "null";
      if (typeof value === "string") return value;

      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    };

    const message = Object.entries(details)
      .map(([key, value]) => `${key}: ${formatValue(value)}`)
      .join("\n\n")
      .slice(0, 3500);

    Alert.alert(title, message || "Sem detalhes");
  }

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
    } catch (error: any) {
      const cepError = error?.message || "CEP_REDE_FALHOU";

      if (cepError === "CEP_NAO_ENCONTRADO") {
        setErroCep("CEP não encontrado");
      } else if (cepError === "CEP_TIMEOUT") {
        setErroCep("Tempo esgotado ao consultar CEP");
      } else if (cepError.startsWith("CEP_HTTP_")) {
        setErroCep(
          `Falha no serviço de CEP (${cepError.replace("CEP_HTTP_", "HTTP ")})`,
        );
      } else if (cepError === "CEP_REDE_FALHOU") {
        setErroCep("Falha de rede ao consultar CEP");
      } else {
        setErroCep("Erro ao buscar CEP");
      }

      debugAlert("DEBUG - Falha consulta CEP", {
        cepDigitado: cepLimpo,
        errorCode: cepError,
        hint: "Se aparecer HTTP 403/407 ou rede, pode ser firewall/proxy bloqueando viacep.com.br",
      });
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
    const contatosParaEnviar = [...contatos];

    // Se usuário digitou contato e não clicou em "Adicionar", inclui automaticamente no submit.
    if (tipoSelecionado && valorContato) {
      contatosParaEnviar.push({ tipo: tipoSelecionado, valor: valorContato });
    }

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
        try {
          await updateUsuarioFoto(Number(userId), normalizedProfilePhotoBase64);
        } catch (photoError: any) {
          console.log("WARN FOTO USUARIO:", photoError?.message || photoError);
          debugAlert("DEBUG - Falha ao enviar foto de perfil", {
            endpointTentado: "/Usuario/{id}/foto | /usuario/{id}/foto",
            userId: Number(userId),
            status: photoError?.response?.status ?? "sem status",
            url: photoError?.config?.url ?? "sem url",
            message: photoError?.message ?? "sem mensagem",
            responseData: photoError?.response?.data ?? "sem body",
          });
        }
      }

      const prestadorPayload = {
        usuario: { id: Number(userId) },
        nome,
        cpf: cpfFinal,
        dataNascimento: birthDate
          ? String(birthDate).includes("T")
            ? birthDate
            : `${birthDate}T00:00:00`
          : undefined,
        genero: gender || "Não informado",
        telefone: telefoneUsuario || contatos?.[0]?.valor || "",
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
        statusServico: "ATIVO",
        prestadorId,
        categoriaId: Number(categoria),
        foto: eventImage?.base64 || null,
      };

      console.log("SERVICO:", {
        ...servicoPayload,
        foto: servicoPayload.foto ? "[BASE64 OK]" : null,
      });

      await globalapi.post("servico", servicoPayload);

      if (contatosParaEnviar.length > 0) {
        await Promise.all(
          contatosParaEnviar.map(async (contato) => {
            const contatoPayload = {
              prestadorId,
              tipoContato: contato.tipo,
              link: contato.valor,
              statusContato: "ATIVO",
            };

            console.log("DEBUG CONTATO -> endpoint:", "contato");
            console.log("DEBUG CONTATO -> payload:", contatoPayload);

            try {
              await globalapi.post("contato", contatoPayload);
            } catch (errorContato: any) {
              // fallback para backend com endpoint capitalizado
              if (errorContato?.response?.status === 404) {
                console.log("DEBUG CONTATO -> fallback endpoint:", "Contato");
                await globalapi.post("Contato", contatoPayload);
              } else {
                throw errorContato;
              }
            }
          }),
        );
      }

      await clearPendingPrestadorProfile();

      console.log("=== SUCCESS ===");

      alert("Perfil criado com sucesso!");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("=== ERROR ===");
      console.log(error?.response?.data || error.message);

      debugAlert("DEBUG - Erro no cadastro de perfil", {
        status: error?.response?.status ?? "sem status",
        url: error?.config?.url ?? "sem url",
        message: error?.message ?? "sem mensagem",
        responseData: error?.response?.data ?? "sem body",
        prestador: {
          nome,
          cpf: cpfFinal,
          cidade: municipio,
          uf: estado,
          contato: contatos?.[0]?.valor || null,
        },
        servico: {
          nome,
          categoriaId: Number(categoria),
          temFotoEvento: !!eventImage?.base64,
        },
      });

      alert(error?.response?.data?.message || "Erro ao criar perfil");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD USER
  // =========================

  const paramUserId = params.userId;
  const paramCpf = params.cpf;

  useEffect(() => {
    async function load() {
      const pending = await getPendingPrestadorProfile();

      const resolvedUserId = String(
        paramUserId ?? pending?.userId ?? user?.id ?? "",
      );

      const resolvedCpf = String(paramCpf ?? pending?.cpf ?? user?.cpf ?? "");
      const resolvedBirthDate = String(
        params.birthDate ?? pending?.birthDate ?? "",
      );
      const resolvedGender = String(params.gender ?? pending?.gender ?? "");
      const resolvedTelefone = String(
        params.telefone ?? pending?.telefone ?? "",
      );
      setUserId(resolvedUserId);
      setCpf(resolvedCpf);
      setCpfPersistido(resolvedCpf);
      setBirthDate(resolvedBirthDate);
      setGender(resolvedGender);
      setTelefoneUsuario(resolvedTelefone);
    }

    load();
  }, [
    paramCpf,
    paramUserId,
    params.birthDate,
    params.gender,
    params.telefone,
    user?.cpf,
    user?.id,
  ]);

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
