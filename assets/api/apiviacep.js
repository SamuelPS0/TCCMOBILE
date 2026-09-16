import axios from "axios";

// Mapeamento de mensagens amigáveis orientadas ao usuário
const ERROS_CEP = {
  CEP_FORMATO_INVALIDO: "Por favor, digite um CEP válido com 8 dígitos.",
  CEP_NAO_ENCONTRADO: "Não encontramos este CEP. Confira se os números estão certos.",
  CEP_TIMEOUT: "A busca demorou muito. Verifique sua conexão e tente novamente.",
  CEP_ERRO_CONEXAO: "Não foi possível conectar ao serviço de CEP. Tente mais tarde.",
  CEP_ERRO_SERVIDOR: "Serviço de CEP temporariamente indisponível. Tente novamente em alguns instantes.",
};

export const buscarCep = async (cep) => {
  const cepLimpo = String(cep || "").replace(/\D/g, "");

  // Validation prévia de formato
  if (cepLimpo.length !== 8) {
    const error = new Error(ERROS_CEP.CEP_FORMATO_INVALIDO);
    error.code = "CEP_FORMATO_INVALIDO";
    throw error;
  }

  try {
    const response = await axios.get(
      `https://viacep.com.br/ws/${cepLimpo}/json/`,
      { timeout: 8000 }
    );

    // O ViaCEP retorna { erro: "true" } ou { erro: true } quando o CEP não existe no banco deles
    if (response.data && response.data.erro) {
      const notFoundError = new Error(ERROS_CEP.CEP_NAO_ENCONTRADO);
      notFoundError.code = "CEP_NAO_ENCONTRADO";
      throw notFoundError;
    }

    return response.data;
  } catch (error) {
    // Se o erro já foi tratado por nós acima (ex: CEP não encontrado/formato)
    if (error.code && ERROS_CEP[error.code]) {
      throw error;
    }

    // Identificação de falhas de rede/HTTP
    let code = "CEP_ERRO_CONEXAO";
    let message = ERROS_CEP.CEP_ERRO_CONEXAO;

    if (error.code === "ECONNABORTED") {
      code = "CEP_TIMEOUT";
      message = ERROS_CEP.CEP_TIMEOUT;
    } else if (error.response?.status >= 500) {
      code = "CEP_ERRO_SERVIDOR";
      message = ERROS_CEP.CEP_ERRO_SERVIDOR;
    } else if (error.response?.status === 400) {
      code = "CEP_FORMATO_INVALIDO";
      message = ERROS_CEP.CEP_FORMATO_INVALIDO;
    }

    const wrappedError = new Error(message);
    wrappedError.code = code;
    wrappedError.status = error.response?.status;
    wrappedError.originalError = error;

    throw wrappedError;
  }
};