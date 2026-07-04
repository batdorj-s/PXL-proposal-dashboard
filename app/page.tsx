'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Proposal, RATE_CARD } from '@/types';
import { loadDrafts, newDraft, saveDraft } from '@/lib/storage';
import { calcPricing, fmt } from '@/lib/pricing';
import BlockHeader from '@/components/BlockHeader';
import BlockBackground from '@/components/BlockBackground';
import BlockPersona from '@/components/BlockPersona';
import BlockInsight from '@/components/BlockInsight';
import BlockStrategy from '@/components/BlockStrategy';
import BlockCreativity from '@/components/BlockCreativity';
import BlockPricing from '@/components/BlockPricing';
import DraftsSidebar from '@/components/DraftsSidebar';

const BLOCKS = ['block-0', 'block-1', 'block-2', 'block-3', 'block-4', 'block-5', 'block-6'];
const BLOCK_LABELS = ['Нүүр', '1 · Нөхцөл', '2 · Persona', '3 · Инсайт', '4 · Стратеги', '5 · Санаа', '6 · Үнэ'];

export default function Home() {
  const [drafts, setDrafts] = useState<Proposal[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeBlock, setActiveBlock] = useState('block-0');
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const refreshDrafts = useCallback(() => {
    const d = loadDrafts();
    setDrafts(d);
    return d;
  }, []);

  useEffect(() => {
    const d = refreshDrafts();
    if (d.length > 0) setProposal(d[0]);
    else {
      const fresh = newDraft();
      setProposal(fresh);
      refreshDrafts();
    }
  }, [refreshDrafts]);

  // Auto-save with debounce
  useEffect(() => {
    if (!proposal) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(() => {
      saveDraft(proposal);
      setSaving(false);
      refreshDrafts();
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [proposal, refreshDrafts]);

  // Sync pricing from creativity executions
  useEffect(() => {
    if (!proposal) return;
    const execItems = proposal.creativity.executions
      .filter(ex => !!ex.content_type)
      .map(ex => {
        const existing = proposal.pricing.items.find(
          it => it.id === ex.id
        );
        return {
          id: ex.id,
          content_type: ex.content_type,
          unit_price: existing?.unit_price ?? RATE_CARD[ex.content_type] ?? 0,
          quantity: existing?.quantity ?? 1,
        };
      });

    // Merge: keep manually-added items that aren't from executions
    const execIds = new Set(proposal.creativity.executions.map(e => e.id));
    const manualItems = proposal.pricing.items.filter(it => !execIds.has(it.id));
    const merged = [...execItems, ...manualItems];

    const prevIds = proposal.pricing.items.map(i => i.id).join(',');
    const nextIds = merged.map(i => i.id).join(',');
    if (prevIds !== nextIds) {
      setProposal(prev => prev ? { ...prev, pricing: { ...prev.pricing, items: merged } } : prev);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.creativity.executions]);

  // Intersection observer for active block highlight
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveBlock(e.target.id); });
      },
      { threshold: 0.4 }
    );
    BLOCKS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [proposal]);

  const handlePrint = () => window.print();

  if (!proposal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)' }}>
        Ачааллаж байна...
      </div>
    );
  }

  const totals = calcPricing(proposal.pricing);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          height: 56,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: 16 }}
            onClick={() => setSidebarOpen(v => !v)}
            title="Sidebar нээх/хаах"
          >
            ☰
          </button>

          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {proposal.header.brand_name || 'Шинэ Proposal'}
          </span>
          {proposal.header.campaign_name && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {proposal.header.campaign_name}</span>
          )}

          {/* Block nav */}
          <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
            {BLOCKS.map((id, i) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeBlock === id ? 'var(--accent)' : 'transparent',
                  color: activeBlock === id ? 'white' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}
              >
                {BLOCK_LABELS[i]}
              </button>
            ))}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {saving && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Хадгалж байна...</span>}
            {!saving && <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ Хадгалагдсан</span>}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent2)' }}>{fmt(totals.grand_total)}</div>
            <button className="btn btn-success" onClick={handlePrint}>↓ PDF</button>
          </div>
        </header>

        {/* Scrollable content */}
        <div ref={printRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <BlockHeader data={proposal.header} onChange={v => setProposal(p => p ? { ...p, header: v } : p)} />
          <BlockBackground data={proposal.background} onChange={v => setProposal(p => p ? { ...p, background: v } : p)} />
          <BlockPersona data={proposal.persona} onChange={v => setProposal(p => p ? { ...p, persona: v } : p)} />
          <BlockInsight data={proposal.insight} onChange={v => setProposal(p => p ? { ...p, insight: v } : p)} />
          <BlockStrategy data={proposal.strategy} onChange={v => setProposal(p => p ? { ...p, strategy: v } : p)} />
          <BlockCreativity data={proposal.creativity} onChange={v => setProposal(p => p ? { ...p, creativity: v } : p)} />
          <BlockPricing data={proposal.pricing} onChange={v => setProposal(p => p ? { ...p, pricing: v } : p)} />

          <div style={{ height: 80 }} />
        </div>
      </div>

      {/* Print styles injected inline */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .sidebar-nav, header, aside { display: none !important; }
          .block-card {
            background: white !important;
            border: 1px solid #ddd !important;
            color: black !important;
            break-inside: avoid;
          }
          .field-input, .field-textarea, .field-select, .computed-value {
            background: #f5f5f5 !important;
            color: black !important;
            border: 1px solid #ddd !important;
          }
          .field-label { color: #555 !important; }
          .field-hint { color: #888 !important; }
          .totals-row { border-color: #ddd !important; }
          .totals-row.grand { color: #3d35c0 !important; border-color: #3d35c0 !important; }
          .btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
