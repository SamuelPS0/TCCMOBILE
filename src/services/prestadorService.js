import { globalapi } from "../../assets/api/globalapi";

export const getUsuarioById = async (userId) => {
  const response = await globalapi.get(`/Usuario/${userId}`);
  return response.data;
};

export const getPrestadorByUsuario = async (usuarioId) => {
  try {
    const response = await globalapi.get(`/prestador/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createServico = async (payload) => {
  const response = await globalapi.post("/servico", payload);
  return response.data;
};

export const getServicosByPrestador = async (prestadorId) => {
  const response = await globalapi.get(`/servico/prestador/${prestadorId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const updateUsuarioFoto = async (userId, fotoBase64) => {
  const response = await globalapi.put(`/Usuario/${userId}`, {
    foto: fotoBase64,
  });

  return response.data;
};

export const normalizeImageUri = (value) => {
  if (!value) return null;

  if (
    typeof value === "string" &&
    (value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("file://") ||
      value.startsWith("data:"))
  ) {
    return value;
  }

  return `data:image/jpeg;base64,${value}`;
};
