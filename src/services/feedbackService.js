import { globalapi } from "../../assets/api/globalapi";

export async function getFeedbacksByPrestador(prestadorId) {
  const response = await globalapi.get("feedback");
  const lista = Array.isArray(response.data) ? response.data : [];

  return lista.filter(
    (item) => Number(item?.prestadorId) === Number(prestadorId),
  );
}

export async function getFeedbacksFiltrados(prestadorId, tipoFeedback) {
  const lista = await getFeedbacksByPrestador(prestadorId);

  return lista.filter(
    (item) =>
      String(item?.tipoFeedback || "").toUpperCase() ===
        String(tipoFeedback || "").toUpperCase() &&
      String(item?.statusFeedback || "").toUpperCase() === "ATIVO",
  );
}
