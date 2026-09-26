let catalogPromise = null;

export async function getCatalog(fetch) {
  if (!catalogPromise) {
    catalogPromise = fetch("/api/catalog")
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to fetch full catalog");
          catalogPromise = null;
          return [];
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Network error fetching catalog:", error);
        catalogPromise = null;
        return [];
      });
  }

  return catalogPromise;
}
