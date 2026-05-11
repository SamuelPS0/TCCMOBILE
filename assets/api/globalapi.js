import axios from "axios";
//Links
//"http://10.0.2.2:8080/api/v1/"
//"http://10.0.2.15:8080/api/v1/"
//"http://localhost:8080/api/v1/"
//"http://192.168.3.7:8080/api/v1/"

const globalapi = axios.create({
  baseURL: "http://10.0.2.2:8080/api/v1/",
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
      Object.entries(value).map(([key, item]) => [key, sanitizeForLog(item)]),
    );
  }

  return value;
}

// =========================
// LOG DE REQUEST
// =========================
globalapi.interceptors.request.use(
  (config) => {
    console.log("==== REQUEST ====");
    console.log("URL:", config.baseURL + config.url);
    console.log("METHOD:", config.method);
    console.log("DATA:", sanitizeForLog(config.data));
    console.log("HEADERS:", config.headers);
    return config;
  },
  (error) => {
    console.log("REQUEST ERROR:", error);
    return Promise.reject(error);
  },
);

// =========================
// LOG DE RESPONSE
// =========================
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
    console.log("FULL ERROR:", error);

    return Promise.reject(error);
  },
);

export { globalapi, sanitizeForLog };

