'use client';
import { useEffect, useRef, useState, useCallback, useMemo, createContext, useContext } from 'react';
import type { Proposal, BrandAssets } from '@/types';
import { calcPricing, fmt } from '@/lib/pricing';

/* ════════════════════════════════════════════════════════════════════
   PPT Preview Modal
   Renders all 7 slides as HTML — pixel-perfect match to generatePptx.ts
   Base slide: 960 × 540px (72px/inch × 13.33" × 7.5")
   ════════════════════════════════════════════════════════════════════ */

const SW = 960;
const SH = 540;

const NAV = ['Нүүр', 'Нөхцөл', 'Persona', 'Инсайт', 'Стратеги', 'Санаа', 'Үнэ'];

interface DT {
  bg: string; surface: string; surface2: string; border: string;
  text: string; muted: string; muted2: string;
  gold: string; goldDim: string; blue: string; danger: string;
  serif: string; sans: string; body: string;
  logo: string;
}

const DTContext = createContext<DT>(null!);

function useDT() { return useContext(DTContext); }

function buildDT(brand?: BrandAssets): DT {
  return {
    bg:       '#050508',
    surface:  '#111118',
    surface2: '#18181F',
    border:   '#1E1E28',
    text:     brand?.accent_color ?? '#E8E0D5',
    muted:    '#6B6A72',
    muted2:   '#9A9098',
    gold:     brand?.primary_color ?? '#C9A96E',
    goldDim:  '#2E2519',
    blue:     brand?.secondary_color ?? '#4A9EFF',
    danger:   '#E05555',
    serif:    brand?.font_serif ? `'${brand.font_serif}', Georgia, serif` : "'Cormorant Garamond', Georgia, serif",
    sans:     brand?.font_sans ? `'${brand.font_sans}', system-ui, sans-serif` : "'Space Grotesk', system-ui, sans-serif",
    body:     "'Inter', system-ui, sans-serif",
    logo:     brand?.logo ?? '',
  };
}

/* ── Shared slide primitives ─────────────────────────────────────── */

function AccentBar() {
  const dt = useDT();
  return <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: SH, background: dt.gold }} />;
}

function NavBar({ activeIdx }: { activeIdx: number }) {
  const dt = useDT();
  const tabW = SW / NAV.length;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: SW, height: 37, background: dt.surface, borderBottom: `0.5px solid ${dt.border}` }}>
      <span style={{ position: 'absolute', left: 14, top: 0, height: 37, display: 'flex', alignItems: 'center', fontFamily: dt.sans, fontSize: 7, fontWeight: 700, letterSpacing: '0.25em', color: dt.gold }}>
        MERIDIAN
      </span>
      <div style={{ position: 'absolute', left: 118, top: 9, width: 1, height: 20, background: dt.border }} />
      {NAV.map((label, i) => {
        const active = i === activeIdx;
        const x = SW - NAV.length * tabW + i * tabW;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: 0, width: tabW, height: 37, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: dt.sans, fontSize: 6.5, fontWeight: active ? 700 : 400, letterSpacing: '0.04em', color: active ? dt.gold : dt.muted }}>
              {label}
            </span>
            {active && <div style={{ position: 'absolute', bottom: 0, left: 8, right: 8, height: 2, background: dt.gold, borderRadius: 1 }} />}
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  const dt = useDT();
  return (
    <div style={{ position: 'absolute', left: 18, top: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: dt.serif, fontSize: 10, fontStyle: 'italic', color: dt.gold }}>{num}</span>
        <div style={{ width: 1, height: 20, background: dt.muted, opacity: 0.4 }} />
        <span style={{ fontFamily: dt.serif, fontSize: 20, color: dt.text, letterSpacing: '-0.01em' }}>{title}</span>
      </div>
      <div style={{ marginTop: 3, marginLeft: 2, fontFamily: dt.body, fontSize: 7.5, fontStyle: 'italic', color: dt.muted2 }}>{subtitle}</div>
    </div>
  );
}

function Surface({ x, y, w, h, highlight = false, children }: { x: number; y: number; w: number; h: number; highlight?: boolean; children?: React.ReactNode }) {
  const dt = useDT();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: dt.surface, border: `${highlight ? 1 : 0.5}px solid ${highlight ? dt.gold : dt.border}`, boxSizing: 'border-box', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const dt = useDT();
  return <div style={{ fontFamily: dt.sans, fontSize: 6.5, fontWeight: 700, letterSpacing: '0.12em', color: dt.muted2, textTransform: 'uppercase', marginBottom: 4 }}>{children}</div>;
}

function Divider({ mb = 6 }: { mb?: number }) {
  const dt = useDT();
  return <div style={{ height: 0.5, background: dt.border, marginBottom: mb }} />;
}

function BodyText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const dt = useDT();
  return (
    <div style={{ fontFamily: dt.body, fontSize: 10, color: dt.text, lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', ...style }}>
      {children || '—'}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SLIDE RENDERERS
   ════════════════════════════════════════════════════════════════════ */

const SLIDE_LABELS = ['Нүүр', 'Нөхцөл', 'Persona', 'Инсайт', 'Стратеги', 'Санаа', 'Үнэ'];

function Slide1({ p }: { p: Proposal }) {
  const dt = useDT();
  const { header } = p;
  return (
    <div style={{ position: 'absolute', inset: 0, background: dt.bg, overflow: 'hidden' }}>
      <AccentBar />
      <div style={{ position: 'absolute', right: -100, top: -173, width: 432, height: 432, borderRadius: '50%', background: dt.surface, border: `1px solid ${dt.border}` }} />
      <div style={{ position: 'absolute', right: -31, top: -43, width: 173, height: 173, borderRadius: '50%', background: dt.surface2, border: `0.75px solid ${dt.gold}` }} />
      <div style={{ position: 'absolute', right: 65, top: 22, width: 10, height: 10, borderRadius: '50%', background: dt.gold }} />
      <div style={{ position: 'absolute', left: 40, top: 108 }}>
        {dt.logo ? (
          <img src={dt.logo} alt="logo" style={{ height: 28, marginBottom: 14, objectFit: 'contain' }} />
        ) : (
          <div style={{ fontFamily: dt.sans, fontSize: 8, fontWeight: 700, letterSpacing: '0.3em', color: dt.gold, marginBottom: 10 }}>MERIDIAN</div>
        )}
        <div style={{ width: 40, height: 1, background: dt.gold, marginBottom: 14 }} />
        <div style={{ fontFamily: dt.serif, fontSize: 48, color: dt.text, lineHeight: 1.0, maxWidth: 560, marginBottom: 14, wordBreak: 'break-word' }}>
          {header.brand_name || 'Брэндийн нэр'}
        </div>
        <div style={{ fontFamily: dt.serif, fontSize: 16, fontStyle: 'italic', color: dt.gold, marginBottom: 22, maxWidth: 540 }}>
          {header.campaign_name || 'Кампанит ажлын нэр'}
        </div>
        <div style={{ width: 200, height: 0.5, background: dt.border, marginBottom: 12 }} />
        <div style={{ fontFamily: dt.body, fontSize: 8.5, color: dt.muted2, marginBottom: 5 }}>
          Бэлтгэсэн: {header.prepared_by || '—'}
        </div>
        <div style={{ fontFamily: dt.body, fontSize: 8.5, color: dt.muted2 }}>
          Огноо: {header.date || '—'}
        </div>
      </div>
      <div style={{ position: 'absolute', right: 14, bottom: 12, fontFamily: dt.sans, fontSize: 6, letterSpacing: '0.15em', color: dt.muted }}>
        Маркетингийн санал
      </div>
    </div>
  );
}

function Slide2({ p }: { p: Proposal }) {
  const dt = useDT();
  const { background: bg } = p;
  return (
    <div style={{ position: 'absolute', inset: 0, background: dt.bg }}>
      <AccentBar />
      <NavBar activeIdx={1} />
      <SectionHeader num="01" title="Нөхцөл байдал" subtitle="Background — Ямар асуудлыг шийдэх вэ?" />
      <Surface x={18} y={108} w={SW - 36} h={SH - 126}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.42fr', gap: 16, padding: '18px 20px' }}>
          <div>
            <Label>Брэндийн одоогийн нөхцөл</Label>
            <Divider />
            <BodyText>{bg.context}</BodyText>
            <div style={{ height: 14 }} />
            <Label>Гол сорилт</Label>
            <Divider />
            <BodyText>{bg.key_challenge}</BodyText>
          </div>
          <div>
            <Label>Дэмжих өгөгдөл</Label>
            <Divider />
            <BodyText style={{ fontSize: 9, WebkitLineClamp: 12 }}>{bg.supporting_data || '—'}</BodyText>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function Slide3({ p }: { p: Proposal }) {
  const dt = useDT();
  const { persona } = p;
  return (
    <div style={{ position: 'absolute', inset: 0, background: dt.bg }}>
      <AccentBar />
      <NavBar activeIdx={2} />
      <SectionHeader num="02" title="Зорилтот хэрэглэгч" subtitle="Persona — Хэнд зориулж байна?" />
      <Surface x={18} y={108} w={SW - 36} h={SH - 126}>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 12 }}>
            {[
              { label: 'Юунд итгэдэг?', text: persona.believes },
              { label: 'Юунаас айдаг?', text: persona.fears },
              { label: 'Ямар зөрчилтэй?', text: persona.tension },
              { label: 'Өдөр тутмын амьдрал', text: persona.daily_life },
            ].map(f => (
              <div key={f.label}>
                <Label>{f.label}</Label>
                <Divider />
                <BodyText style={{ WebkitLineClamp: 3 }}>{f.text}</BodyText>
              </div>
            ))}
          </div>
          <div style={{ height: 0.5, background: dt.border, marginBottom: 10 }} />
          <Label>Гол хөдөлгүүр</Label>
          <div style={{ fontFamily: dt.serif, fontSize: 18, fontStyle: 'italic', color: dt.gold, marginTop: 2 }}>
            {persona.core_driver || '—'}
          </div>
        </div>
      </Surface>
    </div>
  );
}

function Slide4({ p }: { p: Proposal }) {
  const dt = useDT();
  const { insight } = p;
  return (
    <div style={{ position: 'absolute', inset: 0, background: dt.bg }}>
      <AccentBar />
      <NavBar activeIdx={3} />
      <SectionHeader num="03" title="Гол инсайт" subtitle="Insight — Хэлэгдээгүй үнэн" />
      <Surface x={18} y={108} w={SW - 36} h={SH - 126} highlight>
          <div style={{ position: 'absolute', left: 16, top: 6, fontFamily: dt.serif, fontSize: 80, lineHeight: 1, color: dt.gold, opacity: 0.8 }}>&ldquo;</div>
        <div style={{ position: 'absolute', left: 76, top: 26, right: 24, bottom: 32, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontFamily: dt.serif, fontSize: 17, fontStyle: 'italic', color: dt.text, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 7, WebkitBoxOrient: 'vertical' }}>
            {insight.insight || '[ Инсайт энд орно ]'}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 18, fontFamily: dt.body, fontSize: 7.5, fontStyle: 'italic', color: dt.muted }}>
          Ганц хүчтэй инсайт — бүх стратеги эндээс ургана.
        </div>
      </Surface>
    </div>
  );
}

function Slide5({ p }: { p: Proposal }) {
  const dt = useDT();
  const { strategy } = p;
  const cols = [
    { num: 'I',   label: 'Гол мессеж', text: strategy.key_message, hint: 'Инсайтад суурилсан гол зурвас' },
    { num: 'II',  label: 'Суваг',       text: strategy.channels,    hint: 'Хаана, ямар сувгаар хүрэх вэ?' },
    { num: 'III', label: 'Хандлага',   text: strategy.approach,    hint: 'Ямар өнцгөөр, ямар аяар?' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: dt.bg }}>
      <AccentBar />
      <NavBar activeIdx={4} />
      <SectionHeader num="04" title="Стратеги" subtitle="Strategy — Юу хийж, яаж хүрэх вэ?" />
      <div style={{ position: 'absolute', left: 18, top: 108, width: SW - 36, height: SH - 126, display: 'flex', gap: 1 }}>
        {cols.map((c, i) => (
          <div key={i} style={{ flex: 1, background: dt.surface, border: `0.5px solid ${dt.border}`, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: dt.serif, fontSize: 11, fontStyle: 'italic', color: dt.gold, marginBottom: 8 }}>{c.num}</div>
            <div style={{ height: 0.5, background: dt.border, marginBottom: 6 }} />
            <Label>{c.label}</Label>
            <Divider />
            <BodyText style={{ flex: 1, WebkitLineClamp: 10 }}>{c.text}</BodyText>
            <div style={{ fontFamily: dt.body, fontSize: 7.5, fontStyle: 'italic', color: dt.muted, marginTop: 'auto', paddingTop: 8 }}>{c.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide6({ p }: { p: Proposal }) {
  const dt = useDT();
  const { creativity } = p;
  const leftW = (SW - 36) * 0.55;
  const rightW = SW - 36 - leftW - 14;
  return (
    <div style={{ position: 'absolute', inset: 0, background: dt.bg }}>
      <AccentBar />
      <NavBar activeIdx={5} />
      <SectionHeader num="05" title="Бүтээлч санаа" subtitle="Big Idea — Санахуйц гол санаа" />
      <Surface x={18} y={108} w={SW - 36} h={SH - 126}>
        <div style={{ position: 'absolute', left: 16, top: 16, width: leftW - 32, bottom: 16 }}>
          <Label>Big Idea</Label>
          <Divider />
          <div style={{ fontFamily: dt.serif, fontSize: 14, color: dt.text, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', marginBottom: 14 }}>
            {creativity.big_idea || '—'}
          </div>
          <div style={{ height: 0.5, background: dt.border, marginBottom: 8 }} />
          <Label>Tagline</Label>
          <div style={{ fontFamily: dt.serif, fontSize: 16, fontStyle: 'italic', color: dt.gold, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {creativity.tagline || '—'}
          </div>
        </div>
        <div style={{ position: 'absolute', left: leftW + 2, top: 16, width: 0.5, bottom: 16, background: dt.border }} />
        <div style={{ position: 'absolute', left: leftW + 12, top: 16, width: rightW - 12, right: 12 }}>
          <Label>Гүйцэтгэл</Label>
          <Divider />
          {creativity.executions.slice(0, 5).map((ex, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {ex.content_type && (
                <div style={{ display: 'inline-block', background: dt.goldDim, border: `0.5px solid ${dt.gold}`, padding: '1px 6px', borderRadius: 1, fontFamily: dt.sans, fontSize: 6.5, fontWeight: 700, letterSpacing: '0.05em', color: dt.gold, marginBottom: 3 }}>
                  {ex.content_type}
                </div>
              )}
              <div style={{ fontFamily: dt.body, fontSize: 8.5, color: dt.muted2, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {ex.description || '—'}
              </div>
            </div>
          ))}
          {creativity.executions.length === 0 && (
            <div style={{ fontFamily: dt.body, fontSize: 9, color: dt.muted, fontStyle: 'italic' }}>—</div>
          )}
        </div>
      </Surface>
    </div>
  );
}

function Slide7({ p }: { p: Proposal }) {
  const dt = useDT();
  const { pricing } = p;
  const totals = calcPricing(pricing);
  const maxRows = Math.min(pricing.items.length, 7);
  return (
    <div style={{ position: 'absolute', inset: 0, background: dt.bg }}>
      <AccentBar />
      <NavBar activeIdx={6} />
      <SectionHeader num="06" title="Үнийн санал" subtitle="Pricing — Автомат тооцоолол" />
      <Surface x={18} y={108} w={SW - 36} h={SH - 126}>
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.8fr 0.6fr 1.8fr', background: dt.surface2, borderBottom: `0.5px solid ${dt.border}`, padding: '5px 8px', marginBottom: 0 }}>
            {['Контент төрөл', 'Нэгжийн үнэ', 'Тоо', 'Нийт'].map(h => (
              <span key={h} style={{ fontFamily: dt.sans, fontSize: 6.5, fontWeight: 700, letterSpacing: '0.1em', color: dt.muted2, textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {pricing.items.slice(0, maxRows).map((item, i) => {
            const lt = item.unit_price * Math.max(0, item.quantity);
            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1.8fr 0.6fr 1.8fr', background: i % 2 === 1 ? dt.surface2 : 'transparent', borderBottom: `0.5px solid ${dt.border}`, padding: '5px 8px' }}>
                <span style={{ fontFamily: dt.body, fontSize: 9, color: dt.text }}>{item.content_type || '—'}</span>
                <span style={{ fontFamily: dt.body, fontSize: 9, color: dt.muted2 }}>{fmt(item.unit_price)}</span>
                <span style={{ fontFamily: dt.body, fontSize: 9, color: dt.muted2 }}>{item.quantity}</span>
                <span style={{ fontFamily: dt.body, fontSize: 9, color: dt.blue }}>{fmt(lt)}</span>
              </div>
            );
          })}
          {pricing.items.length === 0 && (
            <div style={{ padding: '20px 8px', fontFamily: dt.body, fontSize: 9, color: dt.muted, fontStyle: 'italic' }}>Мөр байхгүй байна</div>
          )}
        </div>
        <div style={{ position: 'absolute', right: 20, bottom: 16, width: 200 }}>
          <div style={{ height: 0.5, background: dt.border, marginBottom: 8 }} />
          {[
            { label: 'Нийт дүн',   value: fmt(totals.subtotal),                                color: dt.muted2 },
            { label: `Хөнгөлөлт`, value: pricing.discount_pct > 0 ? `-${fmt(totals.discount_amount)}` : '—', color: dt.danger },
            { label: `НӨАТ`,       value: fmt(totals.vat_amount),                              color: dt.muted2 },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: dt.body, fontSize: 8.5, color: dt.muted }}>{t.label}</span>
              <span style={{ fontFamily: dt.body, fontSize: 8.5, color: t.color }}>{t.value}</span>
            </div>
          ))}
          <div style={{ height: 0.5, background: dt.border, margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: dt.sans, fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', color: dt.muted2 }}>НИЙТ ТӨЛБӨР</span>
            <span style={{ fontFamily: dt.serif, fontSize: 22, color: dt.gold }}>{fmt(totals.grand_total)}</span>
          </div>
        </div>
      </Surface>
    </div>
  );
}

/* ── Slide registry ──────────────────────────────────────────────── */
const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7];

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */
interface Props {
  proposal: Proposal;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}

export default function PptPreview({ proposal, onClose, onDownload, downloading }: Props) {
  const dt = useMemo(() => buildDT(proposal.brand), [proposal.brand]);
  const [active, setActive] = useState(0);
  const [scale, setScale] = useState(1);
  const areaRef = useRef<HTMLDivElement>(null);

  const calcScale = useCallback(() => {
    if (!areaRef.current) return;
    const { clientWidth: w, clientHeight: h } = areaRef.current;
    const s = Math.min((w - 80) / SW, (h - 16) / SH, 1.35);
    setScale(Math.max(s, 0.3));
  }, []);

  useEffect(() => {
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, [calcScale]);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setActive(a => Math.min(SLIDES.length - 1, a + 1));
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   setActive(a => Math.max(0, a - 1));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const SlideComp = SLIDES[active];
  const thumbScale = 152 / SW;

  return (
    <DTContext.Provider value={dt}>
    {/* Backdrop */}
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
      >

        {/* ── Header bar ── */}
        <div style={{
          flexShrink: 0,
          height: 52,
          background: '#111118',
          borderBottom: '1px solid #1E1E28',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 16,
        }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#C9A96E' }}>
            MERIDIAN
          </span>
          <div style={{ width: 1, height: 22, background: '#1E1E28' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#9A9098' }}>
            Слайдын preview
          </span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#E8E0D5', marginLeft: 4 }}>
            {proposal.header.brand_name || 'Нэргүй'}
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Slide counter */}
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#6B6A72' }}>
              {active + 1} / {SLIDES.length}
            </span>

            {/* Download */}
            <button
              onClick={onDownload}
              disabled={downloading}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '7px 20px', borderRadius: 2,
                background: downloading ? 'transparent' : '#C9A96E',
                color: downloading ? '#6B6A72' : '#050508',
                border: `1px solid ${downloading ? '#1E1E28' : '#C9A96E'}`,
                cursor: downloading ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {downloading ? '...' : '↓ PPT татах'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: '1px solid #1E1E28',
                color: '#6B6A72', borderRadius: 2,
                width: 32, height: 32, cursor: 'pointer',
                fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8E0D5'; e.currentTarget.style.color = '#E8E0D5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E28'; e.currentTarget.style.color = '#6B6A72'; }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Main slide area ── */}
        <div
          ref={areaRef}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 8px' }}
        >
          {/* Prev button */}
          <button
            onClick={() => setActive(a => Math.max(0, a - 1))}
            disabled={active === 0}
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 2,
              background: 'transparent', border: '1px solid #1E1E28',
              color: active === 0 ? '#1E1E28' : '#9A9098',
              fontSize: 18, cursor: active === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: 12, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (active > 0) { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#C9A96E'; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E28'; e.currentTarget.style.color = active === 0 ? '#1E1E28' : '#9A9098'; }}
          >
            ‹
          </button>

          {/* Slide viewport */}
          <div style={{
            width: SW * scale, height: SH * scale,
            position: 'relative', flexShrink: 0,
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            border: '1px solid #1E1E28',
          }}>
            <div style={{
              width: SW, height: SH,
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              position: 'absolute', top: 0, left: 0,
            }}>
              <SlideComp p={proposal} />
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={() => setActive(a => Math.min(SLIDES.length - 1, a + 1))}
            disabled={active === SLIDES.length - 1}
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 2,
              background: 'transparent', border: '1px solid #1E1E28',
              color: active === SLIDES.length - 1 ? '#1E1E28' : '#9A9098',
              fontSize: 18, cursor: active === SLIDES.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginLeft: 12, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (active < SLIDES.length - 1) { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#C9A96E'; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E28'; e.currentTarget.style.color = active === SLIDES.length - 1 ? '#1E1E28' : '#9A9098'; }}
          >
            ›
          </button>
        </div>

        {/* ── Thumbnail strip ── */}
        <div style={{
          flexShrink: 0,
          height: 90 + 28,
          background: '#0c0c12',
          borderTop: '1px solid #1E1E28',
          display: 'flex', alignItems: 'center',
          gap: 8, padding: '0 20px',
          overflowX: 'auto',
        }}>
          {SLIDES.map((SlideT, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                cursor: 'pointer',
              }}
            >
              {/* Thumbnail slide */}
              <div style={{
                width: 152, height: 85.5,
                position: 'relative', overflow: 'hidden',
                border: `${i === active ? 2 : 1}px solid ${i === active ? '#C9A96E' : '#1E1E28'}`,
                transition: 'border-color 0.2s',
                boxShadow: i === active ? '0 0 0 1px #C9A96E22' : 'none',
              }}>
                <div style={{
                  width: SW, height: SH,
                  transformOrigin: 'top left',
                  transform: `scale(${thumbScale})`,
                  position: 'absolute', top: 0, left: 0,
                  pointerEvents: 'none',
                }}>
                  <SlideT p={proposal} />
                </div>
              </div>
              {/* Label */}
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9, color: i === active ? '#C9A96E' : '#6B6A72',
                transition: 'color 0.2s',
              }}>
                {SLIDE_LABELS[i]}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
    </DTContext.Provider>
  );
}
