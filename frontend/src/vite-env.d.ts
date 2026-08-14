/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Express API. Defaults to "/api" — the frontend and
   *  backend share one ALB, so a relative path works in every environment. */
  readonly VITE_API_URL?: string;
  /** Set to build a static, file-system-openable preview (hash routing). */
  readonly VITE_STATIC_PREVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
