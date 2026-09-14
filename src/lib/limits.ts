export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';

export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}

export const IMAGE_MAX_BYTES = 5_242_880;
export const IMAGE_TOO_LARGE_MSG =
  'Image is too large to process in the browser.';

