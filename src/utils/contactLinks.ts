const ensureTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;

const stripProtocol = (value: string) =>
  value.replace(/^https?:\/\//i, "").replace(/^www\./i, "");

const normalizeSocialHandle = (value: string, domains: string[]) => {
  let normalized = stripProtocol(value.trim()).replace(/\s+/g, "");

  for (const domain of domains) {
    const domainPattern = new RegExp(
      `^${domain.replace(/\./g, "\\.")}\\/?`,
      "i",
    );
    normalized = normalized.replace(domainPattern, "");
  }

  return normalized.replace(/^@+/, "").replace(/^\/+/, "");
};

export function normalizeContactLink(tipo: string, valor: string) {
  const contactType = String(tipo || "").toLowerCase();
  const contactValue = String(valor || "").trim();

  if (!contactValue) return "";

  if (contactType.includes("insta")) {
    const handle = normalizeSocialHandle(contactValue, ["instagram.com"]);
    return handle
      ? ensureTrailingSlash(`https://www.instagram.com/${handle}`)
      : "";
  }

  if (contactType.includes("face")) {
    const handle = normalizeSocialHandle(contactValue, [
      "facebook.com",
      "fb.com",
    ]);
    return handle
      ? ensureTrailingSlash(`https://www.facebook.com/${handle}`)
      : "";
  }

  if (
    contactType.includes("what") ||
    contactType.includes("zap") ||
    contactType.includes("wpp")
  ) {
    const phone = contactValue.replace(/\D/g, "");
    return phone ? `https://wa.me/${phone}` : contactValue;
  }

  return contactValue;
}