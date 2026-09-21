import { useEffect, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import type { Locale } from '../../i18n/locales';
import { t } from '../../i18n/ui';

export default function UuidGenerator({ locale }: { locale: Locale }) {
  const [output, setOutput] = useState('');
  const labels = t(locale).tools['uuid-generator'];

  useEffect(() => {
    setOutput(crypto.randomUUID());
  }, []);

  return (
    <ToolShell error={null} output={output} locale={locale}>
      <button type="button" onClick={() => setOutput(crypto.randomUUID())}>
        {labels.generate}
      </button>
    </ToolShell>
  );
}
