import axios from "axios";

export const buscarCep = async (cep) => {
  const cepLimpo = String(cep || "").replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    throw new Error("CEP_FORMATO_INVALIDO");
  }

  try {
    const response = await axios.get(
      `https://viacep.com.br/ws/${cepLimpo}/json/`,
      {
        timeout: 8000,
      },
    );

    if (response.data.erro) {
      throw new Error("CEP_NAO_ENCONTRADO");
    }

    return response.data;
  } catch (error) {
    if (error?.code === "ECONNABORTED") {
      throw new Error("CEP_TIMEOUT");
    }

    if (error?.response?.status) {
      throw new Error(`CEP_HTTP_${error.response.status}`);
    }

    throw new Error("CEP_REDE_FALHOU");
  }
};