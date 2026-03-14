import axios from "axios";

const ibgeapi = axios.create({
  baseURL: "https://servicodados.ibge.gov.br/api/v1/localidades",
});

export { ibgeapi };

