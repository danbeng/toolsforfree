import { t, type Locale } from './ui';
import { localizeError } from './errors';

export function useToolUi(locale: Locale) {
  const copy = t(locale);
  const tooLarge = copy.tooLarge;
  function err(error: string | null): string | null {
    if (!error) return null;
    return localizeError(locale, error);
  }
  return { copy, tooLarge, err };
}
