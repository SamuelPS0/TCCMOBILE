import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import React from "react";
import { buscarCep } from "../../assets/api/apiviacep";
import { globalapi, sanitizeForLog } from "../../assets/api/globalapi";
import BottomNav from "../../assets/components/BottomNav";
import { Button } from "../../assets/components/Button";
import { Header } from "../../assets/components/Header";
import { ImageUpload } from "../../assets/components/ImageUpload";
import { Input } from "../../assets/components/Input";
import { ProfilePhoto } from "../../assets/components/ProfilePhoto";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";
import { useAuth } from "../../src/context/AuthContext";
import {
  getPrestadorByUsuario,
  getServicosByPrestador,
  normalizeImageUri,
  updateUsuarioFoto,
} from "../../src/services/prestadorService";

type ContatoItem = {
  id?: number;
  tipo: string;
  valor: string;
};

function parseTipoContato(value: any) {
  const clean = String(value || "").toLowerCase();

  if (clean.includes("insta")) return "Instagram";
  if (clean.includes("face")) return "Facebook";
  if (
    clean.includes("what") ||
    clean.includes("zap") ||
    clean.includes("wpp")
  ) {
    return "Whatsapp";
  }

  return value || "Whatsapp";
}

async function saveWithFallback(options: {
  method: "put" | "post";
  endpoints: string[];
  payload: Record<string, any>;
}) {
  const { method, endpoints, payload } = options;

  for (const endpoint of endpoints) {
    try {
      if (method === "put") {
        const response = await globalapi.put(endpoint, payload);
        return response.data;
      }

      const response = await globalapi.post(endpoint, payload);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error;
    }
  }

  throw new Error(`ENDPOINT_NOT_FOUND:${endpoints.join("|")}`);
}

export default function Workinfo() {
  const router = useRouter();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cpf, setCpf] = useState("");
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

  const [contatos, setContatos] = useState<ContatoItem[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [valorContato, setValorContato] = useState("");

  const [profileImage, setProfileImage] = useState<any>(null);
  const [eventImage, setEventImage] = useState<any>(null);

  const [categoriasApi, setCategoriasApi] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingCep, setLoadingCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  const [prestadorId, setPrestadorId] = useState<number | null>(null);
  const [servicoId, setServicoId] = useState<number | null>(null);

  const genderOptions = useMemo(
    () => [
      { label: "Selecione...", value: "" },
      { label: "Masculino", value: "Masculino" },
      { label: "Feminino", value: "Feminino" },
      { label: "Outro", value: "Outro" },
    ],
    [],
  );

  const formatCep = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/^(\d{5})(\d)/, "$1-$2");
  }, []);

  const handleCepChange = useCallback(async (text: string) => {
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
      } else {
        setErroCep("Erro ao buscar CEP");
      }
    } finally {
      setLoadingCep(false);
    }
  }, []);

  function adicionarContato() {
    if (!tipoSelecionado || !valorContato) return;
    if (contatos.length >= 5) return;

    setContatos((prev) => [
      ...prev,
      {
        tipo: tipoSelecionado,
        valor: valorContato,
      },
    ]);

    setTipoSelecionado("");
    setValorContato("");
  }

  function removerContato(index: number) {
    setContatos((prev) => prev.filter((_, i) => i !== index));
  }

  useEffect(() => {
    async function loadCategorias() {
      const res = await globalapi.get("categoria");

      const lista = res.data
        .filter((c: any) => c.statusCategoria)
        .map((c: any) => ({
          label: c.nome,
          value: String(c.id),
        }));

      setCategoriasApi(lista);
    }

    loadCategorias();
  }, []);

  useEffect(() => {
    async function loadInfo() {
      if (!user?.id) {
        setLoadingData(false);
        return;
      }

      try {
        const prestador = await getPrestadorByUsuario(user.id);
        if (!prestador?.id) {
          Alert.alert(
            "Perfil incompleto",
            "Você ainda não possui perfil profissional. Complete em Criar card.",
          );
          router.replace("/(telas)/accCreate");
          return;
        }

        setPrestadorId(prestador.id);

        const [servicos, contatoRes] = await Promise.all([
          getServicosByPrestador(prestador.id),
          globalapi.get("contato").catch(async (error: any) => {
            if (error?.response?.status === 404) {
              return globalapi.get("Contato");
            }
            throw error;
          }),
        ]);

        const servicoAtivo =
          (Array.isArray(servicos) ? servicos : []).find(
            (item: any) => item?.statusServico === "ATIVO",
          ) || servicos?.[0];

        const contatosTodos = Array.isArray(contatoRes?.data)
          ? contatoRes.data
          : [];
        const contatosFiltrados = contatosTodos
          .filter(
            (item: any) =>
              Number(item?.prestadorId ?? item?.prestador?.id) ===
                Number(prestador.id) && item?.statusContato !== "INATIVO",
          )
          .map((item: any) => ({
            id: item.id,
            tipo: parseTipoContato(item?.tipoContato),
            valor: item?.link || "",
          }));

        setNome(servicoAtivo?.nome || prestador?.nome || "");
        setDescricao(servicoAtivo?.descricao || "");
        setCpf(prestador?.cpf || "");
        setBirthDate(prestador?.dataNascimento || "");
        setGender(prestador?.genero || "");
        setTelefoneUsuario(prestador?.telefone || "");
        setEstado(prestador?.uf || "");
        setMunicipio(prestador?.cidade || "");
        setCategoria(
          servicoAtivo?.categoriaId ? String(servicoAtivo.categoriaId) : "",
        );
        setCep(prestador?.cep || "");
        setLogradouro(prestador?.logradouro || "");
        setNumero(prestador?.numeroResidencial || "");
        setComplemento(prestador?.complemento || "");
        setBairro(prestador?.bairro || "");
        setContatos(contatosFiltrados);

        setServicoId(servicoAtivo?.id || null);

        if (servicoAtivo?.foto) {
          setEventImage({ uri: normalizeImageUri(servicoAtivo.foto) });
        }
        if (user?.foto) {
          setProfileImage({ uri: normalizeImageUri(user.foto) });
        }
      } catch (error: any) {
        Alert.alert(
          "Erro",
          error?.response?.data?.message ||
            "Não foi possível carregar suas informações profissionais.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadInfo();
  }, [router, user?.foto, user?.id]);

  async function handleSubmit() {
    if (!prestadorId || !user?.id) {
      Alert.alert("Erro", "Prestador não encontrado para edição.");
      return;
    }

    if (!nome.trim()) {
      Alert.alert("Validação", "Nome é obrigatório.");
      return;
    }

    if (!categoria) {
      Alert.alert("Validação", "Categoria é obrigatória.");
      return;
    }

    const contatosParaEnviar = [...contatos];
    if (tipoSelecionado && valorContato) {
      contatosParaEnviar.push({ tipo: tipoSelecionado, valor: valorContato });
    }

    try {
      setLoading(true);

      const profilePhotoBase64 = profileImage?.base64 || null;
      if (profilePhotoBase64) {
        await updateUsuarioFoto(Number(user.id), profilePhotoBase64);
      }

      const prestadorPayload = {
        nome,
        cpf: String(cpf || "").replace(/\D/g, ""),
        dataNascimento: birthDate
          ? String(birthDate).includes("T")
            ? birthDate
            : `${birthDate}T00:00:00`
          : undefined,
        genero: gender || "Não informado",
        telefone: telefoneUsuario || contatosParaEnviar?.[0]?.valor || "",
        logradouro,
        numeroResidencial: numero,
        complemento,
        cep,
        bairro,
        cidade: municipio,
        uf: estado,
        statusPrestador: "ATIVO",
      };

      await saveWithFallback({
        method: "put",
        endpoints: [`prestador/${prestadorId}`, `Prestador/${prestadorId}`],
        payload: prestadorPayload,
      });

      const servicoPayload = {
        nome,
        descricao,
        statusServico: "ATIVO",
        prestadorId,
        categoriaId: Number(categoria),
        foto: eventImage?.base64 || null,
      };

      if (servicoId) {
        await saveWithFallback({
          method: "put",
          endpoints: [`servico/${servicoId}`, `Servico/${servicoId}`],
          payload: servicoPayload,
        });
      } else {
        const novoServico = await saveWithFallback({
          method: "post",
          endpoints: ["servico", "Servico"],
          payload: servicoPayload,
        });

        if (novoServico?.id) {
          setServicoId(novoServico.id);
        }
      }

      if (contatosParaEnviar.length > 0) {
        const contatosComResultado = await Promise.allSettled(
          contatosParaEnviar.map(async (contato, index) => {
            const contatoPayload = {
              prestadorId,
              tipoContato: contato.tipo,
              link: contato.valor,
              statusContato: "ATIVO",
            };

            console.log(
              `[WORKINFO CONTATO ${index + 1}] payload:`,
              sanitizeForLog(contatoPayload),
            );

            if (contato.id) {
              const response = await saveWithFallback({
                method: "put",
                endpoints: [`contato/${contato.id}`, `Contato/${contato.id}`],
                payload: contatoPayload,
              });
              return response;
            }

            const response = await saveWithFallback({
              method: "post",
              endpoints: ["contato", "Contato"],
              payload: contatoPayload,
            });
            return response;
          }),
        );

        const falhas = contatosComResultado.filter(
          (item) => item.status === "rejected",
        );

        if (falhas.length > 0) {
          Alert.alert(
            "Atenção",
            `${falhas.length} contato(s) não foram salvos. Os demais foram atualizados.`,
          );
        }
      }

      Alert.alert("Sucesso", "Informações profissionais atualizadas.");
      router.replace("/(tabs)/perfil");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível atualizar o perfil profissional.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Header>
        <Text style={typography.title}>Informações de prestador</Text>
      </Header>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {loadingData ? (
          <Text style={styles.loadingText}>Carregando informações...</Text>
        ) : (
          <View>
            <View style={styles.photoContainer}>
              <ProfilePhoto
                size={120}
                imageUri={profileImage?.uri || null}
                onChangeImage={setProfileImage}
              />
            </View>

            <Input
              label="Nome"
              value={nome}
              onChangeText={setNome}
              icon="person-circle-outline"
            />

            <Input
              label="Descrição"
              multiline
              value={descricao}
              onChangeText={setDescricao}
              icon="document-text-outline"
            />

            <View style={styles.categoriaContainer}>
              {contatos.length < 5 && (
                <>
                  <SelectInput
                    label="Contato"
                    icon="at-outline"
                    selectedValue={tipoSelecionado}
                    onValueChange={setTipoSelecionado}
                    options={[
                      { label: "Selecione...", value: "" },
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
                <View
                  key={`${item.id || "new"}-${index}`}
                  style={styles.contatoItem}
                >
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

            <Input
              label="CEP"
              value={formatCep(cep)}
              onChangeText={handleCepChange}
              icon="location-outline"
            />

            {loadingCep && <Text>Buscando CEP...</Text>}
            {erroCep && <Text style={styles.errorCep}>{erroCep}</Text>}

            <View style={styles.rowInputs}>
              <SelectInput
                label="Estado"
                selectedValue={estado}
                onValueChange={setEstado}
                options={[
                  { label: "Selecione...", value: "" },
                  { label: "SP - São Paulo", value: "SP" },
                  { label: "RJ - Rio de Janeiro", value: "RJ" },
                  { label: "MG - Minas Gerais", value: "MG" },
                  { label: "PR - Paraná", value: "PR" },
                ]}
                width={"31%"}
              />

              <View style={styles.municipioContainer}>
                <Input
                  label="Cidade"
                  value={municipio}
                  onChangeText={setMunicipio}
                />
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

            <View style={styles.rowInputs}>
              <Input
                label="Data de nascimento"
                value={birthDate ? String(birthDate).split("T")[0] : ""}
                onChangeText={setBirthDate}
                width={"48%"}
              />
              <SelectInput
                label="Gênero"
                selectedValue={gender}
                onValueChange={setGender}
                options={genderOptions}
                width={"48%"}
              />
            </View>

            <Input
              label="Telefone"
              value={telefoneUsuario}
              onChangeText={setTelefoneUsuario}
            />

            <SelectInput
              label="Categoria"
              selectedValue={categoria}
              onValueChange={setCategoria}
              options={categoriasApi}
              icon="pricetag-outline"
            />

            <ImageUpload
              label="Arquivo"
              height={200}
              imageUri={eventImage?.uri || null}
              onChangeImage={setEventImage}
            />

            <View style={styles.buttonContainer}>
              <Button onPress={handleSubmit} disabled={loading}>
                <Text style={typography.buttonText}>
                  {loading ? "Salvando..." : "Concluir"}
                </Text>
              </Button>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  content: { padding: 20, gap: 20 },
  backButton: {
    position: "absolute",
    left: 25,
    top: 68,
    zIndex: 1,
  },
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
  buttonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 16,
    color: "#666",
  },
  errorCep: {
    color: "red",
  },
});
