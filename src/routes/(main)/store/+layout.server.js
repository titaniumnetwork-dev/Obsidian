export async function load({ url, params }) {
  let search = url.searchParams.get("search");

  return { search };
}
