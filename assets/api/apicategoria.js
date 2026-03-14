import axios from "axios";

const apicategoria = axios.create({
  baseURL: "http://192.168.3.7:8080/api/v1/categoria",
});

export { apicategoria };

