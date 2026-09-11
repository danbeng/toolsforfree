export const ZH_ERRORS: Record<string, string> = {
  'Enter a count of at least 1': '请输入至少为 1 的数量',
  'Select at least one character set': '请至少选择一种字符集',
  'Length must be between 8 and 128': '长度必须在 8 到 128 之间',
};

export function localizeError(locale: 'en' | 'zh', error: string | null): string | null {
  if (!error) return error;
  if (locale !== 'zh') return error;
  return ZH_ERRORS[error] ?? error;
}
