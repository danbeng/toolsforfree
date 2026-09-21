import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { encodeQr, decodeQr, type QrEcc } from '../../lib/qr';
import {
  INPUT_TOO_LARGE_MSG,
  IMAGE_TOO_LARGE_MSG,
  IMAGE_MAX_BYTES,
  isTooLarge,
} from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

const ECC_OPTIONS: QrEcc[] = ['L', 'M', 'Q', 'H'];
const NOT_AN_IMAGE_MSG = 'Could not read this file as an image.';
const CANVAS_SIZE = 256;
const QUIET_ZONE = 16;

function paintQr(canvas: HTMLCanvasElement, matrix: boolean[][]) {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const n = matrix.length;
  const modulePx = Math.floor((CANVAS_SIZE - QUIET_ZONE * 2) / n);
  const leftover = CANVAS_SIZE - QUIET_ZONE * 2 - modulePx * n;
  const pad = QUIET_ZONE + Math.floor(leftover / 2);
  ctx.fillStyle = '#000000';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (matrix[y][x]) {
        ctx.fillRect(pad + x * modulePx, pad + y * modulePx, modulePx, modulePx);
      }
    }
  }
}

export default function QrCode({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const [ecc, setEcc] = useState<QrEcc>('M');
  const [payload, setPayload] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copy = t(locale);
  const labels = copy.tools['qr-code'];

  const generate = useMemo(() => {
    if (isTooLarge(input)) {
      return {
        error: localizeError(locale, INPUT_TOO_LARGE_MSG),
        matrix: null as boolean[][] | null,
      };
    }
    const r = encodeQr(input, ecc);
    if (!r.ok) {
      return {
        error: r.error ? localizeError(locale, r.error) : null,
        matrix: null as boolean[][] | null,
      };
    }
    return { error: null as string | null, matrix: r.matrix };
  }, [input, ecc, locale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !generate.matrix) return;
    paintQr(canvas, generate.matrix);
  }, [generate.matrix]);

  function onDownload() {
    const canvas = canvasRef.current;
    if (!canvas || !generate.matrix) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.png';
    a.click();
  }

  async function onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > IMAGE_MAX_BYTES) {
      setDecodeError(localizeError(locale, IMAGE_TOO_LARGE_MSG));
      setPayload('');
      return;
    }
    setDecoding(true);
    try {
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        setDecodeError(localizeError(locale, NOT_AN_IMAGE_MSG));
        setPayload('');
        return;
      }
      if (bitmap.width > 4096 || bitmap.height > 4096) {
        bitmap.close();
        setDecodeError(localizeError(locale, IMAGE_TOO_LARGE_MSG));
        setPayload('');
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        bitmap.close();
        setDecodeError(localizeError(locale, NOT_AN_IMAGE_MSG));
        setPayload('');
        return;
      }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const r = decodeQr(imageData);
      if (!r.ok) {
        setDecodeError(localizeError(locale, r.error));
        setPayload('');
        return;
      }
      setDecodeError(null);
      setPayload(r.payload);
    } finally {
      setDecoding(false);
    }
  }

  return (
    <ToolShell error={decodeError ?? generate.error} output={payload} locale={locale}>
      <h2>{labels.generateSection}</h2>
      <div class="tool-grid split">
        <div>
          <label>
            {labels.text}
            <textarea
              rows={8}
              value={input}
              onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
              spellcheck={false}
            />
          </label>
          <label>
            {labels.ecc}
            <select
              value={ecc}
              onChange={(e) =>
                setEcc((e.target as HTMLSelectElement).value as QrEcc)
              }
            >
              {ECC_OPTIONS.map((opt) => (
                <option value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label id="qr-preview-label">{labels.preview}</label>
          <div
            class="qr-preview"
            aria-labelledby="qr-preview-label"
            aria-hidden={generate.matrix ? undefined : true}
          >
            {generate.matrix ? (
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={labels.preview}
              />
            ) : null}
          </div>
          <button type="button" onClick={onDownload} disabled={!generate.matrix}>
            {labels.downloadPng}
          </button>
        </div>
      </div>
      <h2>{labels.decodeSection}</h2>
      <label>
        {labels.image}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onFile}
          disabled={decoding}
        />
      </label>
    </ToolShell>
  );
}
