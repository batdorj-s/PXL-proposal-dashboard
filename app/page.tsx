'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Proposal, RATE_CARD } from '@/types';
import { loadDrafts, newDraft, saveDraft } from '@/lib/storage';
import { calcPricing, fmt } from '@/lib/pricing';
import { generatePptx } from '@/lib/generatePptx';
import PptPreview from '@/components/PptPreview';
import BlockHeader from '@/components/BlockHeader';
import BlockBackground from '@/components/BlockBackground';
import BlockPersona from '@/components/BlockPersona';
import BlockInsight from '@/components/BlockInsight';
import BlockStrategy from '@/components/BlockStrategy';
import BlockCreativity from '@/components/BlockCreativity';
import BlockPricing from '@/components/BlockPricing';
import DraftsSidebar from '@/components/DraftsSidebar';

const BLOCKS      = ['block-0','block-1','block-2','block-3','block-4','block-5','block-6'];
const BLOCK_LABELS = ['Нүүр','Нөхцөл','Persona','Инсайт','Стратеги','Санаа','Үнэ'];

export default function Home() {
  const [drafts,      setDrafts]      = useState<Proposal[]>([]);
  const [proposal,    setProposal]    = useState<Proposal | null>(null);
  const [activeBlock, setActiveBlock] = useState('block-0');
  const [saving,      setSaving]      = useState(false);
  const [exporting,   setExporting]   = useState(false);
  const [previewing,  setPreviewing]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshDrafts = useCallback(() => {
    const d = loadDrafts(); setDrafts(d); return d;
  }, []);

  useEffect(() => {
    const d = refreshDrafts();
    if (d.length > 0) setProposal(d[0]);
    else { const f = newDraft(); setProposal(f); refreshDrafts(); }
  }, [refreshDrafts]);

  /* Auto-save */
  useEffect(() => {
    if (!proposal) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(() => {
      saveDraft(proposal); setSaving(false); refreshDrafts();
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [proposal, refreshDrafts]);

  /* Sync pricing from creativity */
  useEffect(() => {
    if (!proposal) return;
    const execItems = proposal.creativity.executions
      .filter(ex => !!ex.content_type)
      .map(ex => {
        const existing = proposal.pricing.items.find(it => it.id === ex.id);
        return { id: ex.id, content_type: ex.content_type, unit_price: existing?.unit_price ?? RATE_CARD[ex.content_type] ?? 0, quantity: existing?.quantity ?? 1 };
      });
    const execIds    = new Set(proposal.creativity.executions.map(e => e.id));
    const manualItems = proposal.pricing.items.filter(it => !execIds.has(it.id));
    const merged      = [...execItems, ...manualItems];
    const prevIds     = proposal.pricing.items.map(i => i.id).join(',');
    const nextIds     = merged.map(i => i.id).join(',');
    if (prevIds !== nextIds)
      setProposal(prev => prev ? { ...prev, pricing: { ...prev.pricing, items: merged } } : prev);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.creativity.executions]);

  /* Active block via IntersectionObserver */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveBlock(e.target.id); }),
      { threshold: 0.35 }
    );
    BLOCKS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [proposal]);

  const handlePrint = () => window.print();

  const handleExportPptx = async () => {
    if (!proposal || exporting) return;
    setExporting(true);
    try { await generatePptx(proposal); }
    finally { setExporting(false); }
  };

  /* Loading state */
  if (!proposal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, color: 'var(--gold)', letterSpacing: '-0.02em' }}>MERIDIAN</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>Ачааллаж байна</span>
      </div>
    );
  }

  const totals = calcPricing(proposal.pricing);

  return (
    <div className="app-shell">

      {/* Sidebar */}
      {sidebarOpen && (
        <DraftsSidebar
          drafts={drafts}
          currentId={proposal.id}
          onSelect={setProposal}
          onNew={() => { const p = newDraft(); setProposal(p); refreshDrafts(); }}
          onRefresh={refreshDrafts}
        />
      )}

      <div className="app-main">

        {/* ── Top bar ── */}
        <header className="topbar no-print">

          <button className="btn-icon" onClick={() => setSidebarOpen(v => !v)} title="Sidebar">☰</button>

          <div className="topbar-divider" />

          <span className="topbar-brand">MERIDIAN</span>

          <div className="topbar-divider" />

          <span className="topbar-doc-name">
            {proposal.header.brand_name || 'Шинэ Proposal'}
          </span>
          {proposal.header.campaign_name && (
            <span className="topbar-doc-sub">— {proposal.header.campaign_name}</span>
          )}

          <nav className="topbar-nav">
            {BLOCKS.map((id, i) => (
              <button
                key={id}
                className={`topbar-nav-item${activeBlock === id ? ' is-active' : ''}`}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {BLOCK_LABELS[i]}
              </button>
            ))}
          </nav>

          <div className="topbar-end">
            <span className={`topbar-status ${saving ? 'saving' : 'saved'}`}>
              {saving ? 'Хадгалж байна…' : '✓ Хадгалагдсан'}
            </span>
            <span className="topbar-total">{fmt(totals.grand_total)}</span>
            <button className="btn btn-success no-print" onClick={handlePrint}>↓ PDF</button>
            <button className="btn btn-success no-print" onClick={() => setPreviewing(true)}>▶ Preview</button>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="content-scroll">
          <BlockHeader     data={proposal.header}     onChange={v => setProposal(p => p ? { ...p, header: v }     : p)} />
          <BlockBackground data={proposal.background} onChange={v => setProposal(p => p ? { ...p, background: v } : p)} />
          <BlockPersona    data={proposal.persona}    onChange={v => setProposal(p => p ? { ...p, persona: v }    : p)} />
          <BlockInsight    data={proposal.insight}    onChange={v => setProposal(p => p ? { ...p, insight: v }    : p)} />
          <BlockStrategy   data={proposal.strategy}   onChange={v => setProposal(p => p ? { ...p, strategy: v }   : p)} />
          <BlockCreativity data={proposal.creativity} onChange={v => setProposal(p => p ? { ...p, creativity: v } : p)} />
          <BlockPricing    data={proposal.pricing}    onChange={v => setProposal(p => p ? { ...p, pricing: v }    : p)} />
          <div style={{ height: 48 }} />
        </div>

      </div>

      {previewing && (
        <PptPreview
          proposal={proposal}
          onClose={() => setPreviewing(false)}
          onDownload={handleExportPptx}
          downloading={exporting}
        />
      )}
    </div>
  );
}
