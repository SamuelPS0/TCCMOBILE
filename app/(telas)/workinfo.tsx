import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  getPrestadorByUsuario,
  getServicosByPrestador,
  normalizeImageUri,
  updateUsuarioFoto,
} from "../../src/services/prestadorService";
import { normalizeContactLink } from "../../src/utils/contactLinks";

// ================== MÁSCARAS & FORMATADORES ==================
function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "");
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

function normalizeSocialHandle(value: string) {
  if (!value) return "";
  let clean = value.trim();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?[^\/]+\//, "");
  clean = clean.replace(/\/$/, "").replace(/^@+/, "");
  return clean;
}

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

  const [telefoneDDD, setTelefoneDDD] = useState("");
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
  const [statusPrestador, setStatusPrestador] = useState("EM_ANALISE");

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
    const cleaned = onlyDigits(value);
    return cleaned.replace(/^(\d{5})(\d)/, "$1-$2");
  }, []);

  const handleCepChange = useCallback(async (text: string) => {
    const cepLimpo = onlyDigits(text);
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
      setErroCep("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  }, []);

  function handleBlurContato() {
    if (tipoSelecionado !== "Whatsapp") {
      setValorContato(normalizeSocialHandle(valorContato));
    }
  }

  function adicionarContato() {
    if (!tipoSelecionado || !valorContato) return;
    if (contatos.length >= 5) return;

    const valorTratado =
      tipoSelecionado === "Whatsapp"
        ? maskPhone(valorContato)
        : normalizeSocialHandle(valorContato);

    setContatos((prev) => [
      ...prev,
      {
        tipo: tipoSelecionado,
        valor: valorTratado,
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
      try {
        const res = await globalapi.get("categoria");
        const lista = res.data
          .filter((c: any) => c.statusCategoria)
          .map((c: any) => ({
            label: c.nome,
            value: String(c.id),
          }));

        setCategoriasApi(lista);
      } catch (error) {
        console.warn("Erro ao carregar categorias:", error);
      }
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
        let rawFoto = user?.foto || null;
        try {
          const usuarioRes = await globalapi.get(`usuario/${user.id}`);
          if (usuarioRes?.data?.foto) {
            rawFoto = usuarioRes.data.foto;
          }
        } catch (uErr) {
          console.warn("Erro ao buscar usuário para foto:", uErr);
        }

        if (rawFoto) {
          let uriFinal = rawFoto;
          if (
            !rawFoto.startsWith("http") &&
            !rawFoto.startsWith("data:") &&
            !rawFoto.startsWith("file:")
          ) {
            uriFinal = `data:image/jpeg;base64,${rawFoto}`;
          }
          setProfileImage({ uri: uriFinal, base64: rawFoto });
        }

        const prestador = await getPrestadorByUsuario(user.id);
        if (!prestador?.id) {
          Alert.alert(
            "Perfil incompleto",
            "Você ainda não possui perfil profissional.",
          );
          router.replace("/(tabs)");
          return;
        }

        setPrestadorId(prestador.id);
        setStatusPrestador(
          prestador?.statusPrestador ??
            prestador?.status_prestador ??
            "EM_ANALISE",
        );

        let servicos = [];
        try {
          servicos = await getServicosByPrestador(prestador.id);
        } catch (servicoErr: any) {
          if (servicoErr?.response?.status !== 404) {
            console.warn("Erro ao buscar serviços:", servicoErr);
          }
        }

        let contatosTodos = [];
        try {
          const contatoRes = await globalapi.get("contato");
          contatosTodos = Array.isArray(contatoRes?.data)
            ? contatoRes.data
            : [];
        } catch (contatoErr: any) {
          console.warn("Erro ao buscar contatos:", contatoErr);
        }

        const servicoAtivo =
          (Array.isArray(servicos) ? servicos : []).find(
            (item: any) => item?.statusServico === "ATIVO",
          ) || servicos?.[0];

        const contatosFiltrados = contatosTodos
          .filter(
            (item: any) =>
              Number(item?.prestadorId ?? item?.prestador?.id) ===
                Number(prestador.id) && item?.statusContato !== "INATIVO",
          )
          .map((item: any) => ({
            id: item.id,
            tipo: parseTipoContato(item?.tipoContato),
            valor: normalizeSocialHandle(item?.link || ""),
          }));

        setNome(servicoAtivo?.nome || prestador?.nome || "");
        setDescricao(servicoAtivo?.descricao || "");
        setCpf(maskCPF(prestador?.cpf || ""));
        setBirthDate(prestador?.dataNascimento || "");
        setGender(prestador?.genero || "");

        const telDigitos = onlyDigits(prestador?.telefone || "");
        if (telDigitos.length >= 10) {
          setTelefoneDDD(telDigitos.slice(0, 2));
          setTelefoneUsuario(maskPhone(telDigitos.slice(2)));
        } else {
          setTelefoneUsuario(maskPhone(telDigitos));
        }

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
  }, [router, user?.id]);

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
      const valorFinal =
        tipoSelecionado === "Whatsapp"
          ? valorContato
          : normalizeSocialHandle(valorContato);

      contatosParaEnviar.push({ tipo: tipoSelecionado, valor: valorFinal });
    }

    try {
      setLoading(true);

      const profilePhotoBase64 = profileImage?.base64 || null;
      const normalizedProfilePhotoBase64 =
        typeof profilePhotoBase64 === "string" &&
        profilePhotoBase64.startsWith("data:")
          ? profilePhotoBase64.split(",")[1] || profilePhotoBase64
          : profilePhotoBase64;

      if (normalizedProfilePhotoBase64) {
        await updateUsuarioFoto(
          Number(user.id),
          normalizedProfilePhotoBase64,
        );
      }

      const telefoneCompleto =
        onlyDigits(telefoneDDD) + onlyDigits(telefoneUsuario);

      const prestadorPayload = {
        usuario: { id: Number(user.id) },
        nome,
        cpf: onlyDigits(cpf),
        dataNascimento: birthDate
          ? String(birthDate).includes("T")
            ? birthDate
            : `${birthDate}T00:00:00`
          : undefined,
        genero: gender || "Não informado",
        telefone: telefoneCompleto || onlyDigits(contatosParaEnviar?.[0]?.valor || ""),
        logradouro,
        numeroResidencial: numero,
        complemento,
        cep: onlyDigits(cep),
        bairro,
        cidade: municipio,
        uf: estado,
        statusPrestador,
        status_prestador: statusPrestador,
      };

      await saveWithFallback({
        method: "put",
        endpoints: [`prestador/${prestadorId}`],
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
          endpoints: [`servico/${servicoId}`],
          payload: servicoPayload,
        });
      } else {
        const novoServico = await saveWithFallback({
          method: "post",
          endpoints: ["servico"],
          payload: servicoPayload,
        });

        if (novoServico?.id) {
          setServicoId(novoServico.id);
        }
      }

      if (contatosParaEnviar.length > 0) {
        await Promise.allSettled(
          contatosParaEnviar.map(async (contato) => {
            const contatoPayload = {
              prestadorId,
              tipoContato: contato.tipo,
              link: normalizeContactLink(contato.tipo, contato.valor),
              statusContato: "ATIVO",
            };

            if (contato.id) {
              return await saveWithFallback({
                method: "put",
                endpoints: [`contato/${contato.id}`],
                payload: contatoPayload,
              });
            }

            return await saveWithFallback({
              method: "post",
              endpoints: ["contato"],
              payload: contatoPayload,
            });
          }),
        );
      }

      Alert.alert(
        "Sucesso",
        "Informações profissionais atualizadas com sucesso!",
      );
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
          <View style={styles.formGroup}>
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

            <Input
              label="CPF"
              value={cpf}
              editable={false}
              icon="card-outline"
            />

            <View style={styles.rowInputs}>
              <Input
                label="DDD"
                value={telefoneDDD}
                onChangeText={(text) => setTelefoneDDD(maskDDD(text))}
                width="21%"
                keyboardType="numeric"
              />
              <Input
                label="Telefone"
                value={telefoneUsuario}
                onChangeText={(text) => setTelefoneUsuario(maskPhone(text))}
                width="75%"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.categoriaContainer}>
              {contatos.length < 5 && (
                <>
                  <SelectInput
                    label="Contato"
                    icon="at-outline"
                    selectedValue={tipoSelecionado}
                    onValueChange={(val) => {
                      setTipoSelecionado(val);
                      setValorContato("");
                    }}
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
                        placeholder={
                          tipoSelecionado === "Whatsapp"
                            ? "Ex: 99999-9999"
                            : "Digite o usuário (ex: seu.usuario)"
                        }
                        value={valorContato}
                        onChangeText={(text) => {
                          if (tipoSelecionado === "Whatsapp") {
                            setValorContato(maskPhone(text));
                          } else {
                            setValorContato(text);
                          }
                        }}
                        onBlur={handleBlurContato}
                        keyboardType={
                          tipoSelecionado === "Whatsapp" ? "numeric" : "default"
                        }
                        autoCapitalize="none"
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
                    <Text style={styles.contatoValor}>
                      {item.tipo !== "Whatsapp" ? `@${item.valor}` : item.valor}
                    </Text>
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
              keyboardType="numeric"
            />

            {loadingCep && <Text>Buscando CEP...</Text>}
            {erroCep && <Text style={styles.errorCep}>{erroCep}</Text>}

            <View style={styles.rowInputs}>
              <View style={styles.estadoContainer}>
                <Input
                  label="Estado"
                  value={estado}
                  editable={false}
                />
              </View>

              <View style={styles.municipioContainer}>
                <Input
                  label="Cidade"
                  value={municipio}
                  editable={false}
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
                editable={false}
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
  formGroup: { gap: 12 },
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
  estadoContainer: {
    width: "31%",
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