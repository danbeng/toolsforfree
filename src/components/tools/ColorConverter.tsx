import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { parseHex, parseHsl, parseRgb, type ColorResult } from '../../lib/color';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

function formatColor(r: Extract<ColorResult, { ok: true }>): string {
  const { hex, rgb, hsl } = r.value;
  return `${hex}\nrgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nhsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export default function ColorConverter() {
  const [hex, setHex] = useState('');
  const [r, setR] = useState('');
  const [g, setG] = useState('');
  const [b, setB] = useState('');
  const [h, setH] = useState('');
  const [s, setS] = useState('');
  const [l, setL] = useState('');
  const [source, setSource] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  const result = useMemo(() => {
    const fields = [hex, r, g, b, h, s, l];
    if (fields.some(isTooLarge)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    let parsed: ColorResult;
    if (source === 'hex') parsed = parseHex(hex);
    else if (source === 'rgb') parsed = parseRgb(r, g, b);
    else parsed = parseHsl(h, s, l);
    if (!parsed.ok) {
      return { error: parsed.error || null, output: '' };
    }
    return { error: null, output: formatColor(parsed) };
  }, [hex, r, g, b, h, s, l, source]);

  function apply(parsed: ColorResult) {
    if (!parsed.ok) return;
    const { hex: hx, rgb, hsl } = parsed.value;
    setHex(hx);
    setR(String(rgb.r));
    setG(String(rgb.g));
    setB(String(rgb.b));
    setH(String(hsl.h));
    setS(String(hsl.s));
    setL(String(hsl.l));
  }

  function onHex(value: string) {
    setSource('hex');
    setHex(value);
    apply(parseHex(value));
  }

  function onRgb(nextR: string, nextG: string, nextB: string) {
    setSource('rgb');
    setR(nextR);
    setG(nextG);
    setB(nextB);
    apply(parseRgb(nextR, nextG, nextB));
  }

  function onHsl(nextH: string, nextS: string, nextL: string) {
    setSource('hsl');
    setH(nextH);
    setS(nextS);
    setL(nextL);
    apply(parseHsl(nextH, nextS, nextL));
  }

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        Hex
        <input
          type="text"
          value={hex}
          onInput={(e) => onHex((e.target as HTMLInputElement).value)}
          spellcheck={false}
          placeholder="#ff0000"
        />
      </label>
      <fieldset>
        <legend>RGB</legend>
        <label>
          R
          <input
            type="text"
            inputMode="numeric"
            value={r}
            onInput={(e) => onRgb((e.target as HTMLInputElement).value, g, b)}
            spellcheck={false}
          />
        </label>
        <label>
          G
          <input
            type="text"
            inputMode="numeric"
            value={g}
            onInput={(e) => onRgb(r, (e.target as HTMLInputElement).value, b)}
            spellcheck={false}
          />
        </label>
        <label>
          B
          <input
            type="text"
            inputMode="numeric"
            value={b}
            onInput={(e) => onRgb(r, g, (e.target as HTMLInputElement).value)}
            spellcheck={false}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>HSL</legend>
        <label>
          H
          <input
            type="text"
            inputMode="numeric"
            value={h}
            onInput={(e) => onHsl((e.target as HTMLInputElement).value, s, l)}
            spellcheck={false}
          />
        </label>
        <label>
          S
          <input
            type="text"
            inputMode="numeric"
            value={s}
            onInput={(e) => onHsl(h, (e.target as HTMLInputElement).value, l)}
            spellcheck={false}
          />
        </label>
        <label>
          L
          <input
            type="text"
            inputMode="numeric"
            value={l}
            onInput={(e) => onHsl(h, s, (e.target as HTMLInputElement).value)}
            spellcheck={false}
          />
        </label>
      </fieldset>
    </ToolShell>
  );
}
