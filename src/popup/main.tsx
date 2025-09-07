import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [status, setStatus] = useState('');

  const openNext = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_NEXT' }, (res) => {
      if (!res || res.count === 0) setStatus('Fila vazia.');
      else setStatus(`Restantes na fila: ${res.count}`);
    });
  };

  return (
    <div style={{ width: 260, font: '14px system-ui' }}>
      <div style={{ fontWeight: 700 }}>Apply Helper</div>
      <button style={{ width: '100%', marginTop: 8 }} onClick={openNext}>
        Abrir próxima da fila
      </button>
      <div style={{ marginTop: 8, opacity: 0.8 }}>{status}</div>
    </div>
  );
};

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
