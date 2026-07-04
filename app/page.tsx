'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Proposal, RATE_CARD } from '@/types';
import { loadDrafts, newDraft, saveDraft } from '@/lib/storage';
import { calcPricing, fmt } from '@/lib/pricing';
import { generatePptx } from '@/lib/generatePptx';
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
  const [exporting, setExporting] = useState(false);
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

  useEffect(() => {
    if (!proposal) return;
    const execItems = proposal.creativity.executions
      .filter(ex => !!ex.content_type)
      .map(ex => {
        const existing = proposal.pricing.items.find(it => it.id === ex.id);
        return {
          id: ex.id,
          content_type: ex.content_type,
          unit_price: existing?.unit_price ?? RATE_CARD[ex.content_type] ?? 0,
          quantity: existing?.quantity ?? 1,
        };
      });

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

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveBlock(e.target.id); });
      },
      { threshold: 0.35 }
    );
    BLOCKS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [proposal]);

  const handlePrint = () => window.print();

  const handleExportPptx = async () => {
    if (!proposal || exporting) return;
    setExporting(true);
    try {
      await generatePptx(proposal);
    } finally {
      setExporting(false);
    }
  };

  if (!proposal) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300,
          color: 'var(--gold)', letterSpacing: '-0.02em',
        }}>
          MERIDIAN
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.1em' }}>
          Ачааллаж байна...
        </div>
      </div>
    );
  }

  const totals = calcPricing(proposal.pricing);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <DraftsSidebar
          drafts={drafts}
          currentId={proposal.id}
          onSelect={setProposal}
          onNew={() => { const p = newDraft(); setProposal(p); refreshDrafts(); }}
          onRefresh={refreshDrafts}
        />
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <header className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: '0 32px',
          height: 56,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          zIndex: 10,
        }}>
          {/* Logo + toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginRight: 32 }}>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              title="Sidebar нээх/хаах"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: 14, padding: '4px 6px',
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              ☰
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.2em', color: 'var(--gold)',
              }}>
                MERIDIAN
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'var(--border)', marginRight: 32 }} />

          {/* Proposal name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24 }}>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 300,
              color: 'var(--text)', letterSpacing: '-0.01em',
            }}>
              {proposal.header.brand_name || 'Шинэ Proposal'}
            </span>
            {proposal.header.campaign_name && (
              <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                — {proposal.header.campaign_name}
              </span>
            )}
          </div>

          {/* Block nav */}
          <nav style={{ display: 'flex', gap: 2 }}>
            {BLOCKS.map((id, i) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{
                  padding: '5px 12px',
                  borderRadius: 2,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeBlock === id ? 'var(--gold-dim)' : 'transparent',
                  color: activeBlock === id ? 'var(--gold)' : 'var(--muted)',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={e => {
                  if (activeBlock !== id) e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={e => {
                  if (activeBlock !== id) e.currentTarget.style.color = 'var(--muted)';
                }}
              >
                {BLOCK_LABELS[i]}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
            {saving ? (
              <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Хадгалж байна...
              </span>
            ) : (
              <span style={{ fontSize: 10, color: 'var(--success)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ✓ Хадгалагдсан
              </span>
            )}

            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300,
              color: 'var(--gold)', letterSpacing: '-0.01em',
            }}>
              {fmt(totals.grand_total)}
            </div>

            <button className="btn btn-success no-print" onClick={handlePrint}>
              ↓ PDF
            </button>

            <button
              className="btn no-print"
              onClick={handleExportPptx}
              disabled={exporting}
              style={{
                background: exporting ? 'transparent' : 'transparent',
                color: exporting ? 'var(--muted)' : 'var(--gold)',
                border: '1px solid var(--gold-dim)',
                opacity: exporting ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!exporting) { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--bg)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = exporting ? 'var(--muted)' : 'var(--gold)'; }}
            >
              {exporting ? '...' : '↓ PPT'}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div
          ref={printRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '48px 64px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            background: 'var(--bg)',
          }}
        >
          <BlockHeader   data={proposal.header}     onChange={v => setProposal(p => p ? { ...p, header: v }     : p)} />
          <BlockBackground data={proposal.background} onChange={v => setProposal(p => p ? { ...p, background: v } : p)} />
          <BlockPersona  data={proposal.persona}    onChange={v => setProposal(p => p ? { ...p, persona: v }    : p)} />
          <BlockInsight  data={proposal.insight}    onChange={v => setProposal(p => p ? { ...p, insight: v }    : p)} />
          <BlockStrategy data={proposal.strategy}   onChange={v => setProposal(p => p ? { ...p, strategy: v }   : p)} />
          <BlockCreativity data={proposal.creativity} onChange={v => setProposal(p => p ? { ...p, creativity: v } : p)} />
          <BlockPricing  data={proposal.pricing}    onChange={v => setProposal(p => p ? { ...p, pricing: v }    : p)} />
          <div style={{ height: 80 }} />
        </div>
      </div>
    </div>
  );
}
