chrome.runtime.onInstalled.addListener(() => {
  console.log('Apply Helper installed');
});

interface Job {
  jobId: string;
  title: string;
  company: string;
  href: string;
  easyApply: boolean;
}

async function openNextFromQueue() {
  const { applyQueue = [] } = await chrome.storage.local.get(['applyQueue']);
  if (!applyQueue.length) {
    return { count: 0 };
  }
  const next: Job = applyQueue[0];
  await chrome.storage.local.set({ applyQueue: applyQueue.slice(1) });
  const tab = await chrome.tabs.create({ url: next.href, active: true });
  return { count: applyQueue.length - 1, opened: next, tabId: tab.id };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'OPEN_NEXT') {
    openNextFromQueue().then(sendResponse);
    return true;
  }
  return undefined;
});
