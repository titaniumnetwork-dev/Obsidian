import { json } from "@sveltejs/kit";

export async function GET({ setHeaders }) {
  setHeaders({
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "Content-Type": "application/json",
  });

  return json({
    title: "Obsidian",
    icon: "data:image/svg+xml,%3csvg%20version='1.1'%20viewBox='0.0%200.0%20700.0%20700.0'%20fill='none'%20stroke='none'%20stroke-linecap='square'%20stroke-miterlimit='10'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20xmlns='http://www.w3.org/2000/svg'%3e%3cclipPath%20id='p.0'%3e%3cpath%20d='m0%200l700.0%200l0%20700.0l-700.0%200l0%20-700.0z'%20clip-rule='nonzero'%3e%3c/path%3e%3c/clipPath%3e%3cg%20clip-path='url(%23p.0)'%3e%3cpath%20fill='%23000000'%20fill-opacity='0.0'%20d='m0%200l700.0%200l0%20700.0l-700.0%200z'%20fill-rule='evenodd'%3e%3c/path%3e%3cpath%20fill='%23fff'%20d='m0%20379.38766l129.16399%20159.9166l474.9931%20-9.569153l95.831665%20-170.84985l-129.164%20-162.65158l-145.83182%20-35.53813z'%20fill-rule='evenodd'%3e%3c/path%3e%3c/g%3e%3c/svg%3e",
    description: "Your new favorite place on the internet!",
    version: "1",
  });
}
