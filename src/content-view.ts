const APPLY_TEXTS = [
  'Candidatura simplificada',
  'Candidatar-se',
  'Easy Apply',
  'Aplicar',
  'Apply'
];

function findApplyButton(): HTMLElement | null {
  const ariaBtn = Array.from(
    document.querySelectorAll<HTMLElement>('button[aria-label], a[aria-label]')
  ).find((el) =>
    APPLY_TEXTS.some((t) => (el.getAttribute('aria-label') || '').toLowerCase().includes(t.toLowerCase()))
  );
  if (ariaBtn) return ariaBtn;

  const textBtn = Array.from(document.querySelectorAll<HTMLElement>('button, a')).find((el) =>
    APPLY_TEXTS.some((t) => (el.textContent || '').trim().toLowerCase().includes(t.toLowerCase()))
  );
  return textBtn || null;
}

function injectMiniBar() {
  const bar = document.createElement('div');
  bar.style.position = 'fixed';
  bar.style.bottom = '16px';
  bar.style.right = '16px';
  bar.style.zIndex = '2147483647';
  bar.style.padding = '10px 12px';
  bar.style.borderRadius = '10px';
  bar.style.background = 'rgba(17,17,17,.9)';
  bar.style.color = '#fff';
  bar.style.font = '13px system-ui';

  bar.innerHTML = `
    <div style="display:flex; gap:8px; align-items:center">
      <span>Apply Helper</span>
      <button id="open-apply" style="padding:6px 10px; border-radius:8px; border:0; cursor:pointer">Abrir Easy Apply</button>
    </div>
    <div style="margin-top:6px; opacity:.8">Abrirá o modal e **você revisa** antes de enviar.</div>
  `;

  document.body.appendChild(bar);

  bar.querySelector<HTMLButtonElement>('#open-apply')!.addEventListener('click', () => {
    const btn = findApplyButton();
    if (!btn) {
      alert('Botão de candidatura não encontrado nesta vaga.');
      return;
    }
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => btn.click(), 300);
  });
}

injectMiniBar();
