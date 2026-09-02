import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT = "8080";
const DEFAULT_TIMEOUT_MS = 20000;

const API_ENDPOINTS = {
  passwordReset: {
    change: "usuario/recuperar-senha/alterar-senha",
    sendCode: "usuario/recuperar-senha/enviar-codigo",
    validateCode: "usuario/recuperar-senha/validar-codigo",
  },
};

function normalizeApiUrl(url) {
  const normalizedUrl = String(url).trim();

  if (!/^https?:\/\//i.test(normalizedUrl)) {
    return null;
  }

  return normalizedUrl.endsWith("/") ? normalizedUrl : `${normalizedUrl}/`;
}

function resolveApiBaseURL() {
  const configuredUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    Constants.manifest?.extra?.apiUrl;

  if (configuredUrl) {
    return normalizeApiUrl(configuredUrl);
  }

  if (Platform.OS === "android" && !Constants.isDevice) {
    return `http://10.0.2.2:${DEFAULT_API_PORT}/api/v1/`;
  }

  if (Platform.OS === "ios" && !Constants.isDevice) {
    return `http://localhost:${DEFAULT_API_PORT}/api/v1/`;
  }

  return null;
}

function getApiConfigurationError() {
  if (resolveApiBaseURL()) return null;

  return (
    "API não configurada para dispositivo físico. Defina EXPO_PUBLIC_API_URL com uma URL " +
    "HTTPS pública da API e reinicie o Expo."
  );
}

const globalapi = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: DEFAULT_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function sanitizeForLog(value) {
  if (value == null) return value;

  if (typeof value === "string") {
    const isBase64Like =
      value.startsWith("data:image/") ||
      value.startsWith("/9j/") ||
      value.startsWith("iVBOR") ||
      value.length > 30;

    return isBase64Like ? "[imagem64]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        const sensitiveKeys = ["password", "senha", "authorization", "cookie"];
        if (sensitiveKeys.includes(String(key).toLowerCase())) {
          return [key, "[redacted]"];
        }
        return [key, sanitizeForLog(item)];
      }),
    );
  }

  return value;
}

function getNetworkDiagnostic(error) {
  if (error?.code === "API_CONFIGURATION_MISSING") return error.message;
  if (error?.response) return null;

  const baseURL = error?.config?.baseURL || globalapi.defaults.baseURL;
  if (baseURL?.includes("10.0.2.2")) {
    return (
      "A API usa 10.0.2.2, endereço que funciona somente no emulador Android. " +
      "No celular físico, defina EXPO_PUBLIC_API_URL com o IP LAN do computador " +
      "(por exemplo, http://192.168.0.10:8080/api/v1/)."
    );
  }

  return (
    "A requisição não chegou a receber resposta. Verifique se a API está em execução, " +
    "se o celular e o computador estão na mesma rede e se a porta 8080 está liberada no firewall."
  );
}

function formatApiError(error) {
  const status = error?.response?.status;
  const responseMessage = error?.response?.data?.message;

  if (status) return responseMessage || `A API respondeu com o erro ${status}.`;
  return getNetworkDiagnostic(error) || error?.message || "Erro inesperado ao comunicar com a API.";
}

globalapi.interceptors.request.use(
  (config) => {
    const configurationError = getApiConfigurationError();
    if (configurationError) {
      const error = new Error(configurationError);
      error.code = "API_CONFIGURATION_MISSING";
      return Promise.reject(error);
    }

    console.log("==== REQUEST ====");
    console.log("URL:", `${config.baseURL ?? ""}${config.url ?? ""}`);
    console.log("METHOD:", config.method);
    console.log("DATA:", sanitizeForLog(config.data));
    return config;
  },
  (error) => {
    console.log("REQUEST ERROR:", sanitizeForLog(error));
    return Promise.reject(error);
  },
);

globalapi.interceptors.response.use(
  (response) => {
    console.log("==== RESPONSE ====");
    console.log("URL:", response.config.url);
    console.log("STATUS:", response.status);
    console.log("DATA:", sanitizeForLog(response.data));
    return response;
  },
  (error) => {
    console.log("==== RESPONSE ERROR ====");
    console.log("URL:", error?.config?.url);
    console.log("BASE URL:", error?.config?.baseURL);
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", sanitizeForLog(error?.response?.data));
    console.log("MESSAGE:", error?.message);
    const diagnostic = getNetworkDiagnostic(error);
    if (diagnostic) console.log("DIAGNOSTIC:", diagnostic);

    return Promise.reject(error);
  },
);

export {
  API_ENDPOINTS,
  formatApiError,
  getApiConfigurationError,
  globalapi,
  resolveApiBaseURL,
  sanitizeForLog,
};
