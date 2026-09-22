import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

const LOCAL_API_ORIGIN = "http://127.0.0.1:3333";
const LOCAL_API_TOKEN = import.meta.env.VITE_HYPEREDIT_LOCAL_TOKEN as string;
const nativeFetch = window.fetch.bind(window);

window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const requestUrl = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  let requestOrigin: string | null = null;
  try {
    requestOrigin = new URL(requestUrl, window.location.href).origin;
  } catch {
    requestOrigin = null;
  }

  if (requestOrigin === LOCAL_API_ORIGIN && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    headers.set("X-HyperEdit-Token", LOCAL_API_TOKEN);

    if (input instanceof Request) {
      return nativeFetch(new Request(input, { ...init, headers }));
    }
    return nativeFetch(input, { ...init, headers });
  }

  return nativeFetch(input, init);
};

createRoot(document.getElementById("root")!).render(
  <App />
);
