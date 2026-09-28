export async function load({ params }) {
  return { core: params.core, rom: params.rom };
}
