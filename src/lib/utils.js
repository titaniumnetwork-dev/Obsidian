import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { get } from "svelte/store";

export function setURLParam(param, value) {
  const url = new URL(get(page).url);
  url.searchParams.set(param, value);
  goto(url, { replaceState: true, keepFocus: true });
}

export function removeURLParam(param) {
  const url = new URL(get(page).url);
  url.searchParams.delete(param);
  goto(url, { replaceState: true, keepFocus: true });
}
