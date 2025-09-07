// Minimal resilient selectors for LinkedIn Jobs list
const JOB_CARD_SEL = '[data-job-id]';
const TITLE_LINK_SEL = '.job-card-list__title--link';
const COMPANY_SEL = '.artdeco-entity-lockup__subtitle';
const FOOTER_SEL = '.job-card-container__footer-wrapper';
const EASY_APPLY_TEXT = 'Candidatura simplificada';

interface Job {
  jobId: string;
  title: string;
  company: string;
  href: string;
  easyApply: boolean;
}

function parseJobCard(card: Element): Job {
  const jobId = card.getAttribute('data-job-id') ?? '';
  const titleA = card.querySelector<HTMLAnchorElement>(TITLE_LINK_SEL);
  const companyEl = card.querySelector<HTMLElement>(COMPANY_SEL);
  const footer = card.querySelector<HTMLElement>(FOOTER_SEL);

  const title = titleA?.textContent?.trim() || '';
  const href = titleA?.getAttribute('href') || '';
  const company = companyEl?.textContent?.trim() || '';
  const easyApply = footer?.textContent?.includes(EASY_APPLY_TEXT) || false;

  return {
    jobId,
    title,
    company,
    href: new URL(href, location.origin).toString(),
    easyApply,
  };
}

function getVisibleJobs(): Job[] {
  return Array.from(document.querySelectorAll(JOB_CARD_SEL))
    .map((c) => (c.querySelector('.job-card-container') || c) as Element)
    .filter(Boolean)
    .map(parseJobCard)
    .filter((j) => j.jobId && j.title);
}

let root: HTMLElement | null;
let overlay: HTMLDivElement | null;
function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '16px';
  overlay.style.right = '16px';
  overlay.style.zIndex = '2147483647';
  overlay.style.width = '360px';
  overlay.style.maxHeight = '80vh';
  overlay.style.overflow = 'auto';
  overlay.style.boxShadow = '0 8px 24px rgba(0,0,0,.25)';
  overlay.style.borderRadius = '12px';
  overlay.style.background = 'var(--color-background-canvas, #111)';
  overlay.style.color = '#fff';
  overlay.style.font = '14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';

  const shadow = overlay.attachShadow({ mode: 'open' });
  root = document.createElement('div');
  shadow.appendChild(root);
  document.body.appendChild(overlay);
  return overlay;
}

function renderOverlay(jobs: Job[]) {
  ensureOverlay();
  const selAllId = `selall-${Date.now()}`;
  if (!root) return;
  root.innerHTML = `
    <style>
      .box { padding:12px; }
      .row { display:flex; gap:8px; align-items:center; }
      .job { padding:8px; border:1px solid #333; border-radius:8px; margin-top:8px; }
      .title { font-weight:600; }
      .tag { font-size:12px; opacity:.8; }
      .btn { margin-top:10px; width:100%; padding:10px; border-radius:8px; border:0; cursor:pointer; }
    </style>
    <div class="box">
      <div class="row" style="justify-content:space-between">
        <div>
          <div style="font-weight:700">Apply Helper</div>
          <div style="opacity:.8">Selecione vagas para fila</div>
        </div>
        <div class="row">
          <input id="${selAllId}" type="checkbox" />
          <label for="${selAllId}">Selecionar tudo</label>
        </div>
      </div>

      <div id="jobs"></div>
      <button id="queue" class="btn">Adicionar selecionadas à fila</button>
    </div>
  `;

  const jobsEl = root.querySelector<HTMLDivElement>('#jobs')!;
  jobsEl.innerHTML = jobs
    .map(
      (j) => `
    <div class="job">
      <label class="row" style="justify-content:space-between">
        <div>
          <div class="title">${escapeHtml(j.title)}</div>
          <div>${escapeHtml(j.company)}</div>
          <div class="tag">${j.easyApply ? 'Easy Apply' : ''}</div>
        </div>
        <input type="checkbox" data-jobid="${j.jobId}" />
      </label>
    </div>
  `
    )
    .join('');

  root.querySelector<HTMLInputElement>('#' + selAllId)!.addEventListener('change', (e) => {
    jobsEl
      .querySelectorAll<HTMLInputElement>('input[type=checkbox]')
      .forEach((cb) => (cb.checked = (e.target as HTMLInputElement).checked));
  });

  root.querySelector<HTMLButtonElement>('#queue')!.addEventListener('click', () => {
    const selectedIds = Array.from(
      jobsEl.querySelectorAll<HTMLInputElement>('input[type=checkbox]:checked')
    ).map((cb) => cb.getAttribute('data-jobid')!);
    const selected = jobs.filter((j) => selectedIds.includes(j.jobId));
    if (!selected.length) return;

    const key = 'applyQueue';
    chrome.storage.local.get([key], (st) => {
      const current: Job[] = Array.isArray(st[key]) ? st[key] : [];
      const merged = dedupeBy([...current, ...selected], 'jobId');
      chrome.storage.local.set({ [key]: merged }, () => {
        alert(`Enfileiradas ${selected.length} vaga(s). Vá abrindo e confirme cada candidatura.`);
      });
    });
  });
}

function dedupeBy<T extends Record<string, any>>(arr: T[], k: keyof T): T[] {
  const seen = new Set<any>();
  return arr.filter((o) => (seen.has(o[k]) ? false : (seen.add(o[k]), true)));
}

function escapeHtml(s = '') {
  return s.replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

const mo = new MutationObserver(() => {
  const jobs = getVisibleJobs();
  if (jobs.length) renderOverlay(jobs);
});
mo.observe(document.documentElement, { childList: true, subtree: true });

renderOverlay(getVisibleJobs());
