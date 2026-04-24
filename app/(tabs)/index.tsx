import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Header } from "../../assets/components/Header";
import { typography } from "../../assets/globalstyles/fonts";
import Bg from "../../assets/images/backgroundimage.png";
import { useAuth } from "../../src/context/AuthContext";
import { getFeedbacksFiltrados } from "../../src/services/feedbackService";
import {
  getPrestadorByUsuario,
  getServicosByPrestador,
  getUsuarioById,
  normalizeImageUri,
} from "../../src/services/prestadorService";
import { getPendingPrestadorProfile } from "../../src/storage/onboardingStorage";
import { breakLineEveryNChars } from "../../src/utils/formatFeedbackText";

export default function Landing() {
  const router = useRouter();
  const { user } = useAuth();

  const [loadingCard, setLoadingCard] = useState(true);
  const [prestador, setPrestador] = useState<any>(null);
  const [servico, setServico] = useState<any>(null);
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  const hasServico = !!servico?.id;

  function sanitizeDeep(value: any, keyName = ""): any {
    if (value == null) return value;

    if (typeof value === "string") {
      const lowerKey = keyName.toLowerCase();

      if (lowerKey === "senha") {
        return "[oculta]";
      }

      const pareceBase64 =
        value.length > 200 &&
        !value.startsWith("http") &&
        /^[A-Za-z0-9+/=]+$/.test(value.slice(0, 200));

      if (lowerKey === "foto" && pareceBase64) {
        return `[base64 ${value.length} chars]`;
      }

      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeDeep(item));
    }

    if (typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, sanitizeDeep(v, k)]),
      );
    }

    return value;
  }

  function sanitizeError(error: any) {
    return {
      message: error?.message ?? "sem mensagem",
      status: error?.response?.status ?? "sem status",
      data: sanitizeDeep(error?.response?.data ?? null),
      url: error?.config?.url ?? "sem url",
      method: error?.config?.method ?? "sem método",
    };
  }

  const loadHomeCard = useCallback(async () => {
    if (!user?.id) {
      console.log("[HOME] user.id ausente");
      setPrestador(null);
      setServico(null);
      setFotoUsuario(null);
      setLoadingCard(false);
      return;
    }

    try {
      setLoadingCard(true);

      console.log("[HOME] ===== INICIO loadHomeCard =====");
      console.log("[HOME] user logado:", sanitizeDeep(user));

      const [prestadorData, usuarioData] = await Promise.all([
        getPrestadorByUsuario(user.id),
        getUsuarioById(user.id),
      ]);

      console.log("[HOME] prestadorData:", sanitizeDeep(prestadorData));
      console.log("[HOME] usuarioData:", sanitizeDeep(usuarioData));

      setPrestador(prestadorData || null);
      setFotoUsuario(normalizeImageUri(usuarioData?.foto));

      if (!prestadorData?.id) {
        console.log(
          "[HOME] Nenhum prestador encontrado para user.id =",
          user.id,
        );
        setServico(null);
        return;
      }

      const servicos = await getServicosByPrestador(prestadorData.id);

      console.log(
        "[HOME] servicos retornados:",
        Array.isArray(servicos)
          ? servicos.map((s: any) => sanitizeDeep(s))
          : sanitizeDeep(servicos),
      );
      console.log("[HOME] prestadorData.id usado na busca:", prestadorData.id);

      const servicoAtivo = Array.isArray(servicos)
        ? servicos.find((item: any) => {
            const statusOriginal = item?.statusServico;
            const statusNormalizado = String(
              statusOriginal || "",
            ).toUpperCase();

            console.log(
              "[HOME] analisando serviço:",
              sanitizeDeep({
                id: item?.id,
                nome: item?.nome,
                statusOriginal,
                statusNormalizado,
                prestadorId:
                  item?.prestadorId ??
                  item?.prestador?.id ??
                  "sem prestadorId no objeto",
              }),
            );

            return statusNormalizado === "ATIVO" || statusOriginal === true;
          })
        : null;

      console.log(
        "[HOME] servicoAtivo encontrado:",
        sanitizeDeep(servicoAtivo),
      );

      setServico(servicoAtivo || null);
    } catch (error: any) {
      console.log(
        "[HOME] Erro ao carregar card da home:",
        sanitizeError(error),
      );
      console.log("[HOME] error.response?.status:", error?.response?.status);
      console.log(
        "[HOME] error.response?.data:",
        sanitizeDeep(error?.response?.data),
      );

      setPrestador(null);
      setServico(null);
      setFotoUsuario(null);
    } finally {
      // Em vez de fechar direto, vamos sinalizar o sucesso
      setTimeout(() => {
        setLoadingCard(false);
      }, 1500); // 1.5 segundos para o usuário ver a carinha de sucesso
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadHomeCard();
    }, [loadHomeCard]),
  );

  async function handleCreateProfile() {
    if (!user) {
      console.log("Usuário não autenticado");
      return;
    }

    const pendingProfile = await getPendingPrestadorProfile();
    const cpf =
      user.cpf ||
      (pendingProfile?.userId === String(user.id) ? pendingProfile?.cpf : "");

    router.push({
      pathname: "/(telas)/accCreate",
      params: {
        userId: String(user.id),
        cpf: cpf || "",
      },
    });
  }

  async function openFeedbackModal(tipo: "FEEDBACK" | "DENUNCIA") {
    if (!prestador?.id) return;

    try {
      setFeedbackLoading(true);
      setFeedbackModalVisible(true);
      setFeedbackModalTitle(
        tipo === "FEEDBACK" ? "Meus feedbacks" : "Minhas ocorrências",
      );

      const lista = await getFeedbacksFiltrados(prestador.id, tipo);
      setFeedbacks(lista);
    } catch (error: any) {
      console.log("Erro ao carregar feedbacks:", sanitizeError(error));
      setFeedbacks([]);
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
  <ScrollView
  style={styles.container}
  contentContainerStyle={styles.scrollContent}
>
      <ImageBackground
  source={Bg}
  style={styles.background}
  imageStyle={{ resizeMode: "cover" }}
>
        <Header>
          <Text style={typography.title}>Home</Text>
        </Header>

        {loadingCard ? (
          <ScrollView style={styles.loaderBox}>
            <ActivityIndicator
              size="large"
              color="#FFFFFF" // Mudamos para branco para combinar com o texto
              style={{ transform: [{ scale: 2 }] }} // Dobra o tamanho do ícone
            />
            <Text style={styles.loaderText}>Carregando usuário...</Text>
          </View>
        ) : !hasServico ? (
          <Pressable onPress={handleCreateProfile}>
            <View style={styles.createCard}>
              <Ionicons name="add-outline" size={48} color="#000000" />
              <Text style={typography.alata}>Criar card</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>
              {servico?.nome || prestador?.nome}
            </Text>

            <View style={styles.divider} />

            <Image
              source={{
                uri:
                  fotoUsuario ||
                  "https://via.placeholder.com/150x150.png?text=Perfil",
              }}
              style={styles.avatar}
            />

            <Text style={styles.sectionTitle}>DESCRIÇÃO</Text>
            <Text style={styles.descriptionText}>
              {breakLineEveryNChars(
                servico?.descricao || "Sem descrição cadastrada.",
                70,
              )}
            </Text>

            <Text style={styles.sectionTitle}>FOTOGRAFIA</Text>
            <Image
              source={{
                uri:
                  normalizeImageUri(servico?.foto) ||
                  "https://via.placeholder.com/500x260.png?text=Servi%C3%A7o",
              }}
              style={styles.serviceImage}
            />

            <View style={styles.feedbackButtonsRow}>
              <Pressable
                style={styles.feedbackButton}
                onPress={() => openFeedbackModal("FEEDBACK")}
              >
                <Text style={styles.feedbackButtonTextFeedback}>
                  Meus feedbacks
                </Text>
              </Pressable>

              <Pressable
                style={styles.feedbackButton}
                onPress={() => openFeedbackModal("DENUNCIA")}
              >
                <Text style={styles.feedbackButtonTextDenuncia}>
                  Minhas ocorrências
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ImageBackground>

      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{feedbackModalTitle}</Text>

            {feedbackLoading ? (
              <ActivityIndicator size="small" color="#F05221" />
            ) : feedbacks.length === 0 ? (
              <Text style={styles.emptyFeedbackText}>
                Nenhum item ativo encontrado.
              </Text>
            ) : (
              <FlatList
                data={feedbacks}
                keyExtractor={(item) => String(item?.id)}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item }) => (
                  <View style={styles.feedbackItem}>
                    <Text style={styles.feedbackItemTitle}>{item?.titulo}</Text>
                    <Text style={styles.feedbackItemDesc}>
                      {breakLineEveryNChars(item?.descricao || "", 70)}
                    </Text>
                  </View>
                )}
              />
            )}

            <Pressable
              style={styles.closeButton}
              onPress={() => setFeedbackModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContent: {
  flexGrow: 1,
  paddingBottom: 40,
},

  headerarea: {
    boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)",
  },
  background: {
    minHeight: "100%",
  },
  loaderBox: {
    // Isso garante que ele ocupe a tela toda e centralize o conteúdo
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 25, // Aumentei o espaço entre o ícone e o texto
  },
  loaderText: {
    color: "#FFFFFF", // Texto branco
    fontSize: 22, // Fonte grande
    fontFamily: "Poppins_700Bold", // Usando Poppins (certifique-se de que está carregada)
    textAlign: "center",
  },
  createCard: {
    width: 260,
    height: 130,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    flexDirection: "row",
    marginTop: 120,
  },

  serviceCard: {
    width: "80%",
    alignSelf: "center",
    marginTop: 36,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  serviceTitle: {
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 30,
    color: "#F05221",
    textAlign: "center",
  },
  divider: {
    marginTop: 8,
    width: "100%",
    borderBottomColor: "#c7c7c7",
    borderBottomWidth: 2,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 100,
    marginTop: 18,
    backgroundColor: "#ddd",
  },
  sectionTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Poppins_700Bold",
    color: "#111",
  },
  descriptionText: {
    width: "95%",
    textAlign: "justify",
    color: "#555",
    lineHeight: 19,
    flexShrink: 1,
    minHeight: 60,
  },
  serviceImage: {
    width: "95%",
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#ddd",
  },
  feedbackButtonsRow: {
    marginTop: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 10,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackButtonTextFeedback: {
    color: "#2f9f4f",
    fontWeight: "600",
    fontSize: 13,
  },
  feedbackButtonTextDenuncia: {
    color: "#e03535",
    fontWeight: "600",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  modalContent: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  emptyFeedbackText: {
    color: "#666",
    textAlign: "center",
    marginVertical: 16,
  },
  feedbackItem: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  feedbackItemTitle: {
    fontWeight: "700",
    color: "#222",
  },
  feedbackItemDesc: {
    color: "#555",
    lineHeight: 19,
    flexShrink: 1,
  },
  closeButton: {
    marginTop: 6,
    alignSelf: "flex-end",
    backgroundColor: "#F05221",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
