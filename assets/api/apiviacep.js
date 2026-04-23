import axios from "axios";

export const buscarCep = async (cep) => {
  const cepLimpo = String(cep || "").replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    throw new Error("CEP_FORMATO_INVALIDO");
  }

  try {
    const { data } = await axios.post(
      `https://viacep.com.br/ws/${cepLimpo}/json/`,
      { timeout: 8000 }
    );

    if (data.erro) {
      throw new Error("CEP_NAO_ENCONTRADO");
    }

    return {
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("CEP_TIMEOUT");
    }

    if (error.response) {
      throw new Error(`CEP_HTTP_${error.response.status}`);
    }

    throw new Error("CEP_REDE_FALHOU");
  }
};