let cachedCatalog = null;

export async function getCatalog(fetch) {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const response = await fetch("/api/catalog");

  if (!response.ok) {
    console.error("Failed to fetch full catalog");
    return [];
  }

  cachedCatalog = await response.json();

  return cachedCatalog;
}
