import { useEffect } from 'react';
import { APP_NAME } from '../lib/constants';

export function usePageMeta(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}
