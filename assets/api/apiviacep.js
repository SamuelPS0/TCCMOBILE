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
            const notFoundError = new Error("CEP_NAO_ENCONTRADO");
      notFoundError.code = "CEP_NAO_ENCONTRADO";
      throw notFoundError;
    }

    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.erro ||
      error?.message ||
      "Erro desconhecido ao consultar ViaCEP";

     const normalizedCode =
      error?.code === "ECONNABORTED"
        ? "CEP_TIMEOUT"
        : status
          ? `CEP_HTTP_${status}`
          : error?.code || "CEP_REDE_FALHOU";

    const wrappedError = new Error(`${normalizedCode}: ${apiMessage}`);
    wrappedError.code = normalizedCode;
    wrappedError.status = status;
    wrappedError.originalError = error;

     throw wrappedError;
  }
};