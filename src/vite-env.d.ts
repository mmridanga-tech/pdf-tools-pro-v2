/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_TRACKING_ID?: string;
  readonly VITE_CLARITY_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
