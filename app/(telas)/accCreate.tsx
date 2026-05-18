import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { normalizeContactLink } from "../../src/utils/contactLinks";
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
import { updateUsuarioFoto } from "../../src/services/prestadorService";
import {
  clearPendingPrestadorProfile,
  getPendingPrestadorProfile,
} from "../../src/storage/onboardingStorage";

const STATUS_PRESTADOR_EM_ANALISE = "EM_ANALISE";

async function forcePrestadorEmAnalise(
  prestadorId: number,
  payloadBase: Record<string, any>,
) {
  const payload = {
    ...payloadBase,
    statusPrestador: STATUS_PRESTADOR_EM_ANALISE,
    status_prestador: STATUS_PRESTADOR_EM_ANALISE,
  };

  try {
    return await globalapi.put(`prestador/${prestadorId}`, payload);
  } catch (error: any) {
    if (error?.response?.status !== 404) {
      throw error;
    }

    return globalapi.put(`Prestador/${prestadorId}`, payload);
  }
}

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});



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
      const errorCode = error?.code || "CEP_REDE_FALHOU";
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Erro desconhecido ao consultar ViaCEP";

      setErroCep(errorMessage);
      console.error("[ViaCEP] Falha na consulta de CEP", {
        cepDigitado:cepLimpo,
        code: errorCode,
        message: errorMessage,
        status: error?.status || error?.response?.status,
        responseData: error?.response?.data,
        originalError: error?.originalError || error,
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
     const errors: Record<string, string> = {};
    const uid = Number(userId);
    if (!uid) return "User inválido";
     if (!nome.trim()) {
      errors.nome = "O campo nome deve ser preenchido obrigatoriamente";
    }
    if (!descricao.trim()) {
      errors.descricao = "O campo descrição deve ser preenchido obrigatoriamente";
    }
    if (!cep || cep.length !== 8) {
      errors.cep = "O campo CEP deve ser preenchido obrigatoriamente";
    }
    if (!estado) {
      errors.estado = "O campo estado deve ser preenchido obrigatoriamente";
    }
    if (!municipio) {
      errors.municipio =
        "O campo município deve ser preenchido obrigatoriamente";
    }
    if (!categoria) {
      errors.categoria =
        "O campo categoria deve ser preenchido obrigatoriamente";
    }
    const contatosParaValidar = [...contatos];
    if (tipoSelecionado && valorContato) {
      contatosParaValidar.push({ tipo: tipoSelecionado, valor: valorContato });
    }
    if (contatosParaValidar.length === 0) {
      errors.contato = "O campo contato deve ser preenchido obrigatoriamente";
    }

     setFieldErrors(errors);
    return Object.keys(errors).length > 0
      ? "Preencha os campos obrigatórios."
      : null;
  }

  // =========================
  // SUBMIT (BASE64 ONLY)
  // =========================
  const handleSubmit = async () => {
    const erro = validar();
if (erro) return;

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
        }catch (photoError: any) {
  console.log("WARN FOTO USUARIO:", photoError?.message || photoError);

  console.error("[accCreate] Erro ao enviar foto do usuário", {
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
        statusPrestador: STATUS_PRESTADOR_EM_ANALISE,
        status_prestador: STATUS_PRESTADOR_EM_ANALISE,
      };

      console.log("PRESTADOR:", prestadorPayload);

      const prestadorRes = await globalapi.post("prestador", prestadorPayload);
      const prestadorId = prestadorRes.data?.id;

      if (!prestadorId) throw new Error("Prestador não retornado");

      const statusRetornado = String(
        prestadorRes.data?.statusPrestador ??
          prestadorRes.data?.status_prestador ??
          "",
      )
        .trim()
        .toUpperCase()
        .replace(/ /g, "_");

      if (statusRetornado !== STATUS_PRESTADOR_EM_ANALISE) {
        await forcePrestadorEmAnalise(Number(prestadorId), prestadorPayload);
      }

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
        const contatosComResultado = await Promise.allSettled(
          contatosParaEnviar.map(async (contato, index) => {
       const contatoPayload = {
  prestadorId,
  tipoContato: contato.tipo,
  link: normalizeContactLink(contato.tipo, contato.valor),
  statusContato: "ATIVO",
};

            const endpointPrimario = "contato";
            const endpointFallback = "Contato";
            let endpointFinal = endpointPrimario;

            console.log(
              `[CONTATO ${index + 1}] endpoint inicial:`,
              endpointPrimario,
            );
            console.log(
              `[CONTATO ${index + 1}] payload final:`,
              sanitizeForLog(contatoPayload),
            );

            try {
              const response = await globalapi.post(
                endpointPrimario,
                contatoPayload,
              );
              console.log(
                `[CONTATO ${index + 1}] resposta sucesso (${endpointFinal}):`,
                sanitizeForLog(response.data),
              );
              return { endpointFinal, response: response.data };
            } catch (errorContato: any) {
              if (errorContato?.response?.status === 404) {
                endpointFinal = endpointFallback;
                console.log(
                  `[CONTATO ${index + 1}] fallback endpoint:`,
                  endpointFallback,
                );
                const fallbackResponse = await globalapi.post(
                  endpointFallback,
                  contatoPayload,
                );
                console.log(
                  `[CONTATO ${index + 1}] resposta sucesso (${endpointFinal}):`,
                  sanitizeForLog(fallbackResponse.data),
                );
                return { endpointFinal, response: fallbackResponse.data };
              }
              console.log(`[CONTATO ${index + 1}] falha:`, {
                endpointFinal,
                status: errorContato?.response?.status ?? "sem status",
                message: errorContato?.message ?? "sem mensagem",
                responseData: sanitizeForLog(
                  errorContato?.response?.data ?? null,
                ),
              });
              throw errorContato;
            }
          }),
        );

        const falhasContato = contatosComResultado
          .map((result, index) => ({ result, index }))
          .filter((item) => item.result.status === "rejected");

        if (falhasContato.length > 0) {
          console.warn("[accCreate] Alguns contatos não foram salvos", {
            totalContatos: contatosParaEnviar.length,
            contatosComFalha: falhasContato.length,
            detalhes: falhasContato.map(({ result, index }) => ({
              contatoIndex: index + 1,
              motivo:
                result.status === "rejected"
                  ? (result.reason?.response?.data?.message ??
                    result.reason?.message ??
                    "Falha desconhecida")
                  : "",
            })),
          });
        }
      }

      await clearPendingPrestadorProfile();

      console.log("=== SUCCESS ===");

      router.replace({
        pathname: "/(tabs)",
        params: { perfilEnviadoAnalise: "1" },
      });
    } catch (error: any) {
      console.log("=== ERROR ===");
      console.log(error?.response?.data || error.message);

       console.error("[accCreate] DEBUG - Erro no cadastro de perfil", {
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

<Input
  label="Nome*"
  value={nome}
  onChangeText={(text) => {
    setNome(text);
    setFieldErrors((prev) => ({ ...prev, nome: "" }));
  }}
  error={fieldErrors.nome}
/>

<Input
  label="Descrição*"
  multiline
  value={descricao}
  onChangeText={(text) => {
    setDescricao(text);
    setFieldErrors((prev) => ({ ...prev, descricao: "" }));
  }}
  error={fieldErrors.descricao}
/>


<Input
  label="CEP*"
  value={formatCep(cep)}
  onChangeText={(text) => {
    handleCepChange(text);
    setFieldErrors((prev) => ({ ...prev, cep: "" }));
  }}
  error={fieldErrors.cep}
/>

          {loadingCep && <Text>Buscando CEP...</Text>}
          {erroCep && <Text style={{ color: "red" }}>{erroCep}</Text>}

          <View style={styles.rowInputs}>
<SelectInput
  label="Estado*"
  selectedValue={estado}
  onValueChange={() => {}}
   options={[
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
  ]}
  width={"31%"}
  enabled={false}
  error={fieldErrors.estado}
/>

            <View style={styles.municipioContainer}>
<Input
  label="Município*"
  value={municipio}
  onChangeText={() => {}}
  editable={false}
  error={fieldErrors.municipio}
/>
            </View>
          </View>

          <Input
            label="Logradouro*"
            value={logradouro}
            onChangeText={setLogradouro}
          />
          <Input label="Bairro*" value={bairro} onChangeText={setBairro} />

          <View style={styles.rowInputs}>
            <Input
              label="Número*"
              value={numero}
              onChangeText={setNumero}
              width={"30%"}
            />
            <Input
              label="Complemento*"
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
                  label="Adicionar contato*"
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
             {!!fieldErrors.contato && (
              <Text style={styles.errorText}>{fieldErrors.contato}</Text>
            )}
          </View>

<SelectInput
  label="Categoria*"
  selectedValue={categoria}
  onValueChange={(value) => {
    setCategoria(value);
    setFieldErrors((prev) => ({ ...prev, categoria: "" }));
  }}
  options={categoriasApi}
  error={fieldErrors.categoria}
/>


          <ImageUpload
            label="Exemplo de serviço*"
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

   errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -2,
    marginBottom: 4,
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
