import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT = "8080";

function getDebuggerHost() {
  return (
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost ||
    ""
  );
}

function resolveApiBaseURL() {
  const configuredUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    Constants.manifest?.extra?.apiUrl;

  if (configuredUrl) {
    return configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_API_PORT}/api/v1/`;
  }

  const debuggerHost = getDebuggerHost().split(":")[0];
  const host = debuggerHost || "localhost";

  return `http://${host}:${DEFAULT_API_PORT}/api/v1/`;
}

const globalapi = axios.create({
  baseURL: resolveApiBaseURL(),
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

globalapi.interceptors.request.use(
  (config) => {
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
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", sanitizeForLog(error?.response?.data));
    console.log("MESSAGE:", error?.message);

    return Promise.reject(error);
  },
);

export { globalapi, sanitizeForLog };
