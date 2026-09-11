export const ZH_ERRORS: Record<string, string> = {
  'Enter a count of at least 1': '请输入至少为 1 的数量',
};

export function localizeError(locale: 'en' | 'zh', error: string | null): string | null {
  if (!error) return error;
  if (locale !== 'zh') return error;
  return ZH_ERRORS[error] ?? error;
}
