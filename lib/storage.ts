import { Proposal, emptyProposal } from '@/types';

const KEY = 'mpd_drafts';

export function loadDrafts(): Proposal[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveDraft(proposal: Proposal) {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === proposal.id);
  const updated = { ...proposal, updatedAt: new Date().toISOString() };
  if (idx >= 0) drafts[idx] = updated;
  else drafts.unshift(updated);
  localStorage.setItem(KEY, JSON.stringify(drafts));
  return updated;
}

export function deleteDraft(id: string) {
  const drafts = loadDrafts().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(drafts));
}

export function duplicateDraft(proposal: Proposal): Proposal {
  const copy = structuredClone(proposal) as Proposal;
  copy.id = crypto.randomUUID();
  copy.header.campaign_name = copy.header.campaign_name + ' (хуулбар)';
  copy.updatedAt = new Date().toISOString();
  return saveDraft(copy);
}

export function newDraft(): Proposal {
  return saveDraft(emptyProposal());
}
