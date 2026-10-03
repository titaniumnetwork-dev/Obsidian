import { goto } from "$app/navigation";
import { page } from "$app/state";

export function setURLParam(param, value) {
  const url = new URL(page.url.href);
  url.searchParams.set(param, value);
  goto(url, { reset: false });
}

export function removeURLParam(param) {
  const url = new URL(page.url.href);
  url.searchParams.delete(param);
  goto(url, { reset: false });
}

export function randomLetter(not) {
  const random = String.fromCharCode(
    (!Math.round(Math.random()) ? 65 : 97) + Math.floor(Math.random() * 26),
  );

  if (random !== not) {
    return random;
  } else {
    return randomLetter(not);
  }
}

export const hiddenClass = randomLetter();
