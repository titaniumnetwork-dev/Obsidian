export async function load({ url, params }) {
  let search = url.searchParams.get("search");
  let company = url.searchParams.get("company");

  return { search, company };
}
