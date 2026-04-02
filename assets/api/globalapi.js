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

// =========================
// LOG DE REQUEST
// =========================
globalapi.interceptors.request.use(
  (config) => {
    console.log("==== REQUEST ====");
    console.log("URL:", config.baseURL + config.url);
    console.log("METHOD:", config.method);
    console.log("DATA:", config.data);
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
    console.log("DATA:", response.data);
    return response;
  },
  (error) => {
    console.log("==== RESPONSE ERROR ====");
    console.log("URL:", error?.config?.url);
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", error?.response?.data);
    console.log("FULL ERROR:", error);

    return Promise.reject(error);
  },
);

export { globalapi };

