/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_AI_SEARCH_HARD_LIMIT?: string;
  readonly VITE_IMAGE_MAX_BYTES?: string;
  readonly VITE_RECENT_ACTIVITY_CAP?: string;
  readonly VITE_RECENT_ACTIVITY_TTL_DAYS?: string;
  readonly VITE_RECENT_SECTIONS_MAX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
