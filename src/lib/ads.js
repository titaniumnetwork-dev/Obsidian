export function isAdDomain() {
  if (typeof window === "undefined") return false;

  const rawDomains = import.meta.env.PUBLIC_AD_DOMAINS?.trim();
  if (!rawDomains) return false;
  if (rawDomains === "*") return true;

  const currentHost = window.location.hostname.toLowerCase();

  const allowedDomains = rawDomains
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return allowedDomains.some(
    (domain) => currentHost === domain || currentHost === `www.${domain}`,
  );
}

export function shouldShowAds(adsSetting = true) {
  return isAdDomain() && adsSetting !== false;
}
