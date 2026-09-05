import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  normalizeImageUri,
  updateUsuarioFoto,
} from "../../src/services/prestadorService";
import { normalizeContactLink } from "../../src/utils/contactLinks";

// ================== MÁSCARAS & FORMATADORES ==================
function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

function maskDDD(value: string) {
  return onlyDigits(value).slice(0, 2);
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) {
    return digits.replace(/(\d{2})(\d+)/, "($1) $2");
  }
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
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
  const [prestadorOriginal, setPrestadorOriginal] = useState<any>(null);

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

  const handleBlurContato = useCallback(() => {
    if (tipoSelecionado !== "Whatsapp") {
      setValorContato((prev) => normalizeSocialHandle(prev));
    }
  }, [tipoSelecionado]);

  const adicionarContato = useCallback(() => {
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
  }, [tipoSelecionado, valorContato, contatos.length]);

  const removerContato = useCallback((index: number) => {
    setContatos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    async function loadAllData() {
      if (!user?.id) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);

        const [categoriasRes, usuarioRes] = await Promise.allSettled([
          globalapi.get("categoria"),
          globalapi.get(`usuario/${user.id}`),
        ]);

        if (categoriasRes.status === "fulfilled") {
          const lista = categoriasRes.value.data
            .filter((c: any) => c.statusCategoria)
            .map((c: any) => ({
              label: c.nome,
              value: String(c.id),
            }));
          setCategoriasApi(lista);
        }

        let rawFoto = user?.foto || null;
        if (usuarioRes.status === "fulfilled" && usuarioRes.value?.data?.foto) {
          rawFoto = usuarioRes.value.data.foto;
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
          setProfileImage({ uri: uriFinal, base64: null });
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

        setPrestadorOriginal(prestador);
        setPrestadorId(prestador.id);
        setStatusPrestador(
          prestador?.statusPrestador ??
            prestador?.status_prestador ??
            "EM_ANALISE",
        );

        const [servicosRes, contatoRes] = await Promise.allSettled([
          globalapi.get("servico"),
          globalapi.get("contato"),
        ]);

        let todosServicos =
          servicosRes.status === "fulfilled" && Array.isArray(servicosRes.value?.data)
            ? servicosRes.value.data
            : [];
            
        let contatosTodos =
          contatoRes.status === "fulfilled" && Array.isArray(contatoRes.value?.data)
            ? contatoRes.value.data
            : [];

        const servicosDoPrestador = todosServicos.filter(
          (item: any) => Number(item?.prestador?.id ?? item?.prestadorId) === Number(prestador.id)
        );

        const servicoAtivo =
          servicosDoPrestador.find(
            (item: any) => item?.statusServico === true || item?.statusServico === "ATIVO"
          ) || servicosDoPrestador?.[0];

        const contatosFiltrados = contatosTodos
          .filter(
            (item: any) =>
              Number(item?.prestadorId ?? item?.prestador?.id) ===
                Number(prestador.id) && item?.statusContato !== "INATIVO",
          )
          .map((item: any) => {
            let valorFormatado = item?.link || "";
            if (parseTipoContato(item?.tipoContato) === "Whatsapp") {
              const digitos = onlyDigits(item?.link || "");
              const numeroPuro = digitos.startsWith("55") ? digitos.slice(2) : digitos;
              valorFormatado = maskPhone(numeroPuro);
            } else {
              valorFormatado = normalizeSocialHandle(item?.link || "");
            }

            return {
              id: item.id,
              tipo: parseTipoContato(item?.tipoContato),
              valor: valorFormatado,
            };
          });

        setNome(servicoAtivo?.nome || prestador?.nome || "");
        setDescricao(servicoAtivo?.descricao || "");

        const telDigitos = onlyDigits(prestador?.telefone || "");
        // Limpa código do país '55' se vier salvo com 13 dígitos
        const telLimpo = telDigitos.startsWith("55") && telDigitos.length === 13 ? telDigitos.slice(2) : telDigitos;

        if (telLimpo.length >= 10) {
          setTelefoneDDD(telLimpo.slice(0, 2));
          setTelefoneUsuario(maskPhone(telLimpo.slice(2, 11)));
        } else {
          setTelefoneUsuario(maskPhone(telLimpo.slice(0, 11)));
        }

        setEstado(prestador?.uf || "");
        setMunicipio(prestador?.cidade || "");
        
        const catId = 
          servicoAtivo?.categoriaId ?? 
          servicoAtivo?.categoria_id ?? 
          servicoAtivo?.categoria?.id ?? 
          "";
        setCategoria(catId ? String(catId) : "");

        setCep(prestador?.cep || "");
        setLogradouro(prestador?.logradouro || "");
        setNumero(prestador?.numeroResidencial || "");
        setComplemento(prestador?.complemento || "");
        setBairro(prestador?.bairro || "");
        setContatos(contatosFiltrados);

        setServicoId(servicoAtivo?.id || null);

        if (servicoAtivo?.foto && servicoAtivo.foto !== "[imagem64]") {
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

    loadAllData();
  }, [router, user?.id]);

  const handleSubmit = useCallback(async () => {
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

      // Monta os dígitos do telefone e aplica o corte estrito para 11 caracteres (VARCHAR(11))
      const telefoneBruto = onlyDigits(telefoneDDD) + onlyDigits(telefoneUsuario);
      const telefoneTratado = telefoneBruto.startsWith("55") && telefoneBruto.length === 13 
        ? telefoneBruto.slice(2) 
        : telefoneBruto.slice(0, 11);

      const prestadorPayload = {
        id: prestadorId,
        usuario: { id: Number(user.id) },
        nome,
        telefone: telefoneTratado || onlyDigits(prestadorOriginal?.telefone || "").slice(0, 11) || onlyDigits(contatosParaEnviar?.[0]?.valor || "").slice(0, 11),
        logradouro: logradouro || prestadorOriginal?.logradouro || "",
        numeroResidencial: onlyDigits(numero) || prestadorOriginal?.numeroResidencial || "",
        complemento: complemento ?? prestadorOriginal?.complemento ?? "",
        cep: onlyDigits(cep) || prestadorOriginal?.cep || "",
        bairro: bairro || prestadorOriginal?.bairro || "",
        cidade: municipio || prestadorOriginal?.cidade || "",
        uf: estado || prestadorOriginal?.uf || "",
        statusPrestador: statusPrestador || prestadorOriginal?.statusPrestador || "EM_ANALISE",
        cpf: prestadorOriginal?.cpf || "",
        dataNascimento: prestadorOriginal?.dataNascimento || null,
        genero: prestadorOriginal?.genero || "",
      };

      await saveWithFallback({
        method: "put",
        endpoints: [`prestador/${prestadorId}`],
        payload: prestadorPayload,
      });

      const servicoPayload = {
        nome,
        descricao,
        statusServico: true,
        prestador: { id: prestadorId },
        categoria: { id: Number(categoria) },
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
  }, [
    prestadorId,
    user?.id,
    nome,
    categoria,
    contatos,
    tipoSelecionado,
    valorContato,
    profileImage?.base64,
    telefoneDDD,
    telefoneUsuario,
    logradouro,
    numero,
    complemento,
    cep,
    bairro,
    municipio,
    estado,
    statusPrestador,
    prestadorOriginal,
    descricao,
    eventImage?.base64,
    servicoId,
    router,
  ]);

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

            <View style={styles.rowInputs}>
              <Input
                label="DDD"
                value={telefoneDDD}
                onChangeText={(text) => setTelefoneDDD(maskDDD(text))}
                width="21%"
                keyboardType="numeric"
                maxLength={2}
              />
              <Input
                label="Telefone"
                value={telefoneUsuario}
                onChangeText={(text) => setTelefoneUsuario(maskPhone(text))}
                width="75%"
                keyboardType="numeric"
                maxLength={15}
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
                            ? "Ex: (11) 99999-9999"
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
              maxLength={9}
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
                onChangeText={(text) => setNumero(onlyDigits(text))}
                keyboardType="numeric"
                width={"30%"}
              />
              <Input
                label="Complemento"
                value={complemento}
                onChangeText={setComplemento}
                width={"65%"}
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