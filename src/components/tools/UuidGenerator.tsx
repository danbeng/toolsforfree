import { useEffect, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';

export default function UuidGenerator() {
  const [output, setOutput] = useState('');

  useEffect(() => {
    setOutput(crypto.randomUUID());
  }, []);

  return (
    <ToolShell error={null} output={output}>
      <button type="button" onClick={() => setOutput(crypto.randomUUID())}>
        Generate
      </button>
    </ToolShell>
  );
}
