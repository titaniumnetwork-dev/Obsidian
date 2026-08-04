export async function load({ url, params }) {
  let search = url.searchParams.get("search");
  let category = url.searchParams.get("category");
  let tags = url.searchParams.get("tags");

  return { search, category, tags };
}
