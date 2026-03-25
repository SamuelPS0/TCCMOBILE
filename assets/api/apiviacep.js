import axios from "axios";

export const buscarCep = async (cep) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (response.data.erro) {
      throw new Error("CEP não encontrado");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
