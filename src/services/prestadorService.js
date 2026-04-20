import { globalapi } from "../../assets/api/globalapi";

export const getUsuarioById = async (userId) => {
  const response = await globalapi.get(`Usuario/${userId}`);
  return response.data;
};

export const getPrestadorByUsuario = async (usuarioId) => {
  try {
    const response = await globalapi.get("prestador");
    const lista = Array.isArray(response.data) ? response.data : [];

    const prestador = lista.find((item) => {
      const idFromNested = item?.usuario?.id;
      const idFromFlat = item?.usuarioId ?? item?.usuario_id;
      return Number(idFromNested ?? idFromFlat) === Number(usuarioId);
    });

    if (prestador) return prestador;
  } catch (listError) {
    console.log("WARN getPrestadorByUsuario list fallback:", listError);
  }

  // fallback para backends que possuem endpoint dedicado
  try {
    const response = await globalapi.get(`prestador/usuario/${usuarioId}`);
    return response.data;
  } catch (directError) {
    if (directError?.response?.status === 404) {
      return null;
    }
    throw directError;
  }
};

export const createServico = async (payload) => {
  const response = await globalapi.post("servico", payload);
  return response.data;
};

export const getServicosByPrestador = async (prestadorId) => {
  try {
    const response = await globalapi.get(`servico/prestador/${prestadorId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallback = await globalapi.get("servico");
      const lista = Array.isArray(fallback.data) ? fallback.data : [];

      return lista.filter(
        (item) =>
          Number(
            item?.prestadorId ?? item?.prestador_id ?? item?.prestador?.id,
          ) === Number(prestadorId),
      );
    }
    throw error;
  }
};

export const updateUsuarioFoto = async (userId, fotoBase64) => {
  const fotoNormalizada =
    typeof fotoBase64 === "string" && fotoBase64.startsWith("data:")
      ? fotoBase64.split(",")[1] || fotoBase64
      : fotoBase64;

  const payload = { foto: fotoNormalizada };
  const endpoints = [`Usuario/${userId}/foto`, `usuario/${userId}/foto`];

  for (const endpoint of endpoints) {
    try {
      const response = await globalapi.put(endpoint, payload);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status !== 404) {
        throw error;
      }
    }
  }

  throw new Error("ENDPOINT_USUARIO_FOTO_NOT_FOUND");
};

export function normalizeImageUri(value) {
  if (!value) return null;

  const trimmed = String(value).trim();

  if (!trimmed) return null;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }

  return `data:image/jpeg;base64,${trimmed}`;
}
