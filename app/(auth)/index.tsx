import { useRouter } from "expo-router";
import { CheckCircle2, Frown, RefreshCw, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { globalapi } from "../../assets/api/globalapi";
import { Button } from "../../assets/components/Button";
import { Header } from "../../assets/components/Header";
import { typography } from "../../assets/globalstyles/fonts";
import Logo1 from "../../assets/images/LogoCircle.png";
import UniqueLogo from "../../assets/images/UniqueLogo.png";

export default function HomeScreen() {
  const router = useRouter();

  // Estados do teste de conexão: 'testing' | 'success' | 'error'
  const [status, setStatus] = useState("testing");

  // Estados para o Secret Menu / Debug
  const [clickCount, setClickCount] = useState(0);
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  // Animações
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Registrar interceptadores de log do Axios
  useEffect(() => {
    const reqInterceptor = globalapi.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: new Date().getTime() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInterceptor = globalapi.interceptors.response.use(
      (response) => {
        const duration =
          new Date().getTime() - (response.config.metadata?.startTime || 0);
        addLog({
          id: String(Math.random()),
          url: response.config.url || "/",
          fullUrl: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
          method: (response.config.method || "GET").toUpperCase(),
          status: response.status,
          success: true,
          timestamp: new Date().toLocaleTimeString(),
          duration: `${duration}ms`,
        });
        return response;
      },
      (error) => {
        const duration = error.config?.metadata?.startTime
          ? `${new Date().getTime() - error.config.metadata.startTime}ms`
          : "N/A";
        addLog({
          id: String(Math.random()),
          url: error.config?.url || "/",
          fullUrl: `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`,
          method: (error.config?.method || "GET").toUpperCase(),
          status: error.response?.status || "ERR/TIMEOUT",
          success: false,
          errorMessage: error.message,
          timestamp: new Date().toLocaleTimeString(),
          duration,
        });
        return Promise.reject(error);
      }
    );

    return () => {
      globalapi.interceptors.request.eject(reqInterceptor);
      globalapi.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const addLog = (newLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

 const checkHealth = async () => {
  setStatus("testing");
  fadeAnim.setValue(1);
  scaleAnim.setValue(0.8);

  try {
    // Requisita a lista de categorias mapeada em /api/v1/categoria
    await globalapi.get("categoria", { timeout: 4000 });
    setStatus("success");

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1500);
  } catch (error) {
    setStatus("error");
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }
};

  useEffect(() => {
    checkHealth();
  }, []);

  // Lógica de 10 toques para abrir o Debug
  const handleLogoPress = () => {
    const newCount = clickCount + 1;
    if (newCount >= 10) {
      setIsDebugVisible(true);
      setClickCount(0);
    } else {
      setClickCount(newCount);
    }
  };

  return (
    <View style={styles.container}>
      <Header>
        <TouchableOpacity activeOpacity={0.7} onPress={handleLogoPress}>
          <Image source={UniqueLogo} />
        </TouchableOpacity>
      </Header>

      <View style={styles.boxtop}>
        <View style={styles.logoWrapper}>
          <Image source={Logo1} style={styles.logocircle} />

          {/* Indicador de Status com Animação */}
          {status !== "testing" && (
            <Animated.View
              style={[
                styles.statusBadge,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {status === "success" ? (
                <CheckCircle2 size={36} color="#10B981" />
              ) : (
                <Frown size={36} color="#EF4444" />
              )}
            </Animated.View>
          )}
        </View>

        <Text
          style={[typography.title, { textAlign: "center", paddingTop: 20 }]}
        >
          Se prepare para uma nova{" "}
          <Text style={{ color: "#F05221" }}>experiência</Text>
        </Text>
      </View>

      <View style={styles.boxmid}>
        <Text
          style={[typography.title, { color: "#8D8D8D", textAlign: "center" }]}
        >
          Você está a poucos passos de criar o seu perfil e apresentar ao mundo!
        </Text>
      </View>

      <View style={styles.boxbottom}>
        <Button width="90%" onPress={() => router.push("/(auth)/cadastro")}>
          <Text style={typography.buttonText}>Cadastro</Text>
        </Button>

        <Button
          width="90%"
          variant="secondary"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={[typography.buttonText, { color: "#F05221" }]}>
            Login
          </Text>
        </Button>
      </View>

      {/* MODAL DE DEBUG DAS REQUISIÇÕES */}
      <Modal visible={isDebugVisible} animationType="slide" transparent={false}>
        <View style={styles.debugContainer}>
          <View style={styles.debugHeader}>
            <Text style={styles.debugTitle}>Network & API Debugger</Text>
            <TouchableOpacity onPress={() => setIsDebugVisible(false)}>
              <X size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.debugInfoCard}>
            <Text style={styles.debugInfoText}>
              <Text style={{ fontWeight: "bold" }}>BaseURL Configurada: </Text>
              {globalapi.defaults.baseURL || "Não definida"}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => checkHealth()}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Testar Ping Agora</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.historyTitle}>Histórico de Requisições:</Text>

          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.logCard,
                  { borderLeftColor: item.success ? "#10B981" : "#EF4444" },
                ]}
              >
                <View style={styles.logHeader}>
                  <Text style={styles.logMethod}>{item.method}</Text>
                  <Text
                    style={[
                      styles.logStatus,
                      { color: item.success ? "#10B981" : "#EF4444" },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <Text style={styles.logUrl}>{item.fullUrl}</Text>

                {item.errorMessage && (
                  <Text style={styles.logError}>
                    Erro: {item.errorMessage}
                  </Text>
                )}

                <View style={styles.logFooter}>
                  <Text style={styles.logTime}>{item.timestamp}</Text>
                  <Text style={styles.logTime}>{item.duration}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhuma requisição efetuada ainda.
              </Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  boxtop: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  boxmid: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 30,
    width: "100%",
  },

  boxbottom: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    width: "100%",
  },

  logoWrapper: {
    width: 192,
    height: 192,
    borderRadius: 96,
    position: "relative",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    elevation: 12,
    backgroundColor: "#fff",
  },

  logocircle: {
    width: "100%",
    height: "100%",
    borderRadius: 96,
  },

  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  /* Modal Debug Styles */
  debugContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
    paddingTop: 50,
  },
  debugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  debugTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  debugInfoCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    gap: 10,
  },
  debugInfoText: {
    fontSize: 13,
    color: "#374151",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F05221",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  logCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 5,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  logMethod: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1F2937",
  },
  logStatus: {
    fontWeight: "bold",
    fontSize: 14,
  },
  logUrl: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 4,
  },
  logError: {
    fontSize: 12,
    color: "#EF4444",
    marginVertical: 2,
  },
  logFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  logTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 30,
  },
});