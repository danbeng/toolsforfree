export const ZH_ERRORS: Record<string, string> = {
  'Enter a count of at least 1': '请输入至少为 1 的数量',
  'Count exceeds the maximum': '数量超过上限',
  'Select at least one character set': '请至少选择一种字符集',
  'Length must be between 8 and 128': '长度必须在 8 到 128 之间',
  'Invalid SQL': '无效的 SQL',
  'Input too large to process in the browser.': '输入过长，无法在浏览器中处理。',
  'Image is too large to process in the browser.': '图片过大，无法在浏览器中处理。',
  'No QR code found in this image.': '图片中未找到二维码。',
  'Could not read this file as an image.': '无法将此文件作为图片读取。',
  'Cannot encode this text as a QR code.': '无法将这段文本编码为二维码。',
};

export function localizeError(locale: 'en' | 'zh', error: string | null): string | null {
  if (!error) return error;
  if (locale !== 'zh') return error;
  return ZH_ERRORS[error] ?? error;
}
