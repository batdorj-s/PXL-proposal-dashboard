import PptxGenJS from 'pptxgenjs';
import type { Proposal } from '@/types';
import { calcPricing, fmt } from '@/lib/pricing';

/* ════════════════════════════════════════════════════════════════════
   MERIDIAN — PPT Design System
   Mirrors the dashboard exactly: dark bg, gold accent, cream text
   ════════════════════════════════════════════════════════════════════ */

const W = 13.33; // LAYOUT_WIDE width (inches)
const H = 7.5;   // LAYOUT_WIDE height (inches)

/* ── Design tokens (matches globals.css) ─────────────────────────── */
const C = {
  bg:       '050508', // --bg
  surface:  '111118', // --surface
  surface2: '18181F', // --surface-2
  border:   '1E1E28', // ~--border visible for pptx
  text:     'E8E0D5', // --text
  muted:    '6B6A72', // --muted (opaque approx)
  muted2:   '9A9098', // --muted-2 (opaque approx)
  gold:     'C9A96E', // --gold
  goldDim:  '2E2519', // --gold-glow (dark)
  blue:     '4A9EFF', // --blue
  danger:   'E05555', // --danger
} as const;

/* ── Typography ──────────────────────────────────────────────────── */
const F = {
  serif: 'Garamond',    // Cormorant Garamond → Garamond (system font)
  sans:  'Calibri',     // Space Grotesk → Calibri
  body:  'Calibri',     // Inter → Calibri
} as const;

/* ── Nav labels ──────────────────────────────────────────────────── */
const NAV = ['Нүүр', 'Нөхцөл', 'Persona', 'Инсайт', 'Стратеги', 'Санаа', 'Үнэ'];

/* ════════════════════════════════════════════════════════════════════
   PRIMITIVES
   ════════════════════════════════════════════════════════════════════ */

/* Full-slide dark background */
function addBg(s: PptxGenJS.Slide) {
  s.background = { color: C.bg };
}

/* Left vertical gold accent bar — mirrors block-card::before */
function addAccentBar(s: PptxGenJS.Slide) {
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0, y: 0, w: 0.055, h: H,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
}

/* Top navigation bar — mirrors dashboard header */
function addNavBar(s: PptxGenJS.Slide, activeIdx: number) {
  /* Bar background */
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0, y: 0, w: W, h: 0.52,
    fill: { color: C.surface },
    line: { color: C.border, width: 0.75 },
  });

  /* MERIDIAN wordmark */
  s.addText('MERIDIAN', {
    x: 0.2, y: 0, w: 1.4, h: 0.52,
    align: 'left', valign: 'middle',
    fontFace: F.sans, fontSize: 8,
    bold: true, charSpacing: 3,
    color: C.gold,
  });

  /* Divider */
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 1.65, y: 0.12, w: 0.01, h: 0.28,
    fill: { color: C.border },
    line: { color: C.border, width: 0 },
  });

  /* Nav tabs */
  const tabW = 1.3;
  const startX = W - NAV.length * tabW - 0.2;

  NAV.forEach((label, i) => {
    const x = startX + i * tabW;
    const isActive = i === activeIdx;

    if (isActive) {
      /* Gold underline for active */
      s.addShape('rect' as PptxGenJS.ShapeType, {
        x, y: 0.44, w: tabW, h: 0.08,
        fill: { color: C.gold },
        line: { color: C.gold, width: 0 },
      });
    }

    s.addText(label, {
      x, y: 0, w: tabW, h: 0.44,
      align: 'center', valign: 'middle',
      fontFace: F.sans, fontSize: 7.5,
      bold: isActive, charSpacing: 0.5,
      color: isActive ? C.gold : C.muted,
    });
  });
}

/* Section header block (top-left of content slides) */
function addSectionHeader(
  s: PptxGenJS.Slide,
  num: string,
  title: string,
  subtitle: string,
) {
  const contentY = 0.7;

  /* Section number — small italic serif gold */
  s.addText(num, {
    x: 0.25, y: contentY, w: 0.6, h: 0.35,
    align: 'left', valign: 'middle',
    fontFace: F.serif, fontSize: 11,
    italic: true, color: C.gold,
  });

  /* Divider */
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0.82, y: contentY + 0.07, w: 0.01, h: 0.22,
    fill: { color: C.muted },
    line: { color: C.muted, width: 0 },
  });

  /* Title — large serif cream */
  s.addText(title, {
    x: 0.92, y: contentY - 0.06, w: 9.0, h: 0.48,
    align: 'left', valign: 'middle',
    fontFace: F.serif, fontSize: 22,
    color: C.text,
  });

  /* Subtitle — small muted */
  s.addText(subtitle, {
    x: 0.92, y: contentY + 0.42, w: 10.0, h: 0.28,
    align: 'left', valign: 'top',
    fontFace: F.body, fontSize: 8.5,
    italic: true, color: C.muted2,
  });
}

/* Dark surface card — mirrors .block-card */
function addSurface(
  s: PptxGenJS.Slide,
  x: number, y: number, w: number, h: number,
  highlight = false,
) {
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x, y, w, h,
    fill: { color: C.surface },
    line: { color: highlight ? C.gold : C.border, width: highlight ? 1 : 0.5 },
  });
}

/* Field label — mirrors .field-label (small caps, gold-ish muted) */
function addLabel(s: PptxGenJS.Slide, text: string, x: number, y: number, w: number) {
  s.addText(text, {
    x, y, w, h: 0.22,
    align: 'left', valign: 'top',
    fontFace: F.sans, fontSize: 7,
    bold: true, charSpacing: 1.5,
    color: C.muted2,
  });
}

/* Field content — mirrors field text */
function addContent(
  s: PptxGenJS.Slide,
  text: string,
  x: number, y: number, w: number, h: number,
  opts: Partial<PptxGenJS.TextPropsOptions> = {},
) {
  s.addText(text || '—', {
    x, y, w, h,
    align: 'left', valign: 'top',
    fontFace: F.body, fontSize: 11,
    color: C.text, wrap: true,
    ...opts,
  });
}

/* Thin horizontal gold divider line */
function addDivider(s: PptxGenJS.Slide, x: number, y: number, w: number) {
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x, y, w, h: 0.008,
    fill: { color: C.border },
    line: { color: C.border, width: 0 },
  });
}

/* ════════════════════════════════════════════════════════════════════
   PUBLIC EXPORT
   ════════════════════════════════════════════════════════════════════ */
export async function generatePptx(proposal: Proposal): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  const { header, background, persona, insight, strategy, creativity, pricing } = proposal;
  const totals = calcPricing(pricing);

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 1 — Cover
     Full dark with decorative geometry, large brand name
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);

    /* Left gold accent bar */
    addAccentBar(s);

    /* Decorative circle — top right (dark surface, matches WebGL mesh mood) */
    s.addShape('ellipse' as PptxGenJS.ShapeType, {
      x: W - 4.2, y: -2.4, w: 6.0, h: 6.0,
      fill: { color: C.surface },
      line: { color: C.border, width: 1 },
    });
    s.addShape('ellipse' as PptxGenJS.ShapeType, {
      x: W - 2.1, y: -0.6, w: 2.4, h: 2.4,
      fill: { color: C.surface2 },
      line: { color: C.gold, width: 0.75 },
    });
    /* Small gold dot */
    s.addShape('ellipse' as PptxGenJS.ShapeType, {
      x: W - 1.1, y: 0.3, w: 0.14, h: 0.14,
      fill: { color: C.gold },
      line: { color: C.gold, width: 0 },
    });

    /* MERIDIAN wordmark */
    s.addText('MERIDIAN', {
      x: 0.55, y: 1.5, w: 4.0, h: 0.35,
      align: 'left', valign: 'middle',
      fontFace: F.sans, fontSize: 9,
      bold: true, charSpacing: 4,
      color: C.gold,
    });

    /* Thin gold line under wordmark */
    s.addShape('rect' as PptxGenJS.ShapeType, {
      x: 0.55, y: 1.9, w: 0.55, h: 0.01,
      fill: { color: C.gold }, line: { color: C.gold, width: 0 },
    });

    /* Brand name — very large serif */
    s.addText(header.brand_name || 'Брэндийн нэр', {
      x: 0.55, y: 2.1, w: 9.5, h: 1.6,
      align: 'left', valign: 'middle',
      fontFace: F.serif, fontSize: 54,
      color: C.text,
    });

    /* Campaign name — gold italic */
    s.addText(header.campaign_name || 'Кампанит ажлын нэр', {
      x: 0.55, y: 3.8, w: 9.5, h: 0.55,
      align: 'left', valign: 'middle',
      fontFace: F.serif, fontSize: 18,
      italic: true, color: C.gold,
    });

    /* Thin divider */
    addDivider(s, 0.55, 4.55, 4.0);

    /* Prepared by / Date — small muted */
    s.addText(`Бэлтгэсэн: ${header.prepared_by || '—'}`, {
      x: 0.55, y: 4.7, w: 5.0, h: 0.3,
      align: 'left', valign: 'middle',
      fontFace: F.body, fontSize: 9,
      color: C.muted2,
    });
    s.addText(`Огноо: ${header.date || '—'}`, {
      x: 0.55, y: 5.05, w: 5.0, h: 0.3,
      align: 'left', valign: 'middle',
      fontFace: F.body, fontSize: 9,
      color: C.muted2,
    });

    /* Bottom-right: "Маркетингийн санал" */
    s.addText('Маркетингийн санал', {
      x: W - 4.0, y: H - 0.5, w: 3.8, h: 0.35,
      align: 'right', valign: 'middle',
      fontFace: F.sans, fontSize: 7,
      charSpacing: 1.5, color: C.muted,
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 2 — Background
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addAccentBar(s);
    addNavBar(s, 1);
    addSectionHeader(s, '01', 'Нөхцөл байдал', 'Background — Ямар асуудлыг шийдэх вэ?');

    /* Main surface card */
    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, cardX, cardY, cardW, cardH);

    /* Нөхцөл */
    addLabel(s, 'БРЭНДИЙН ОДООГИЙН НӨХЦӨЛ', cardX + 0.3, cardY + 0.3, cardW - 0.6);
    addDivider(s, cardX + 0.3, cardY + 0.55, cardW - 0.6);
    addContent(s, background.context, cardX + 0.3, cardY + 0.62, cardW * 0.58, 1.3);

    /* Сорилт */
    addLabel(s, 'ГОЛ СОРИЛТ', cardX + 0.3, cardY + 2.1, cardW - 0.6);
    addDivider(s, cardX + 0.3, cardY + 2.35, cardW - 0.6);
    addContent(s, background.key_challenge, cardX + 0.3, cardY + 2.42, cardW * 0.58, 1.0);

    /* Supporting data (right column) */
    const rx = cardX + cardW * 0.65;
    const rw = cardW * 0.32;
    addLabel(s, 'ДЭМЖИХ ӨГӨГДӨЛ', rx, cardY + 0.3, rw);
    addDivider(s, rx, cardY + 0.55, rw);
    addContent(s, background.supporting_data || '—', rx, cardY + 0.62, rw, 3.5, { fontSize: 10 });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 3 — Persona
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addAccentBar(s);
    addNavBar(s, 2);
    addSectionHeader(s, '02', 'Зорилтот хэрэглэгч', 'Persona — Хэнд зориулж байна?');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, cardX, cardY, cardW, cardH);

    const lx = cardX + 0.3, rx = cardX + cardW / 2 + 0.1;
    const cw = cardW / 2 - 0.45;

    /* Итгэл / Айдас */
    addLabel(s, 'ЮУНД ИТГЭДЭГ?', lx, cardY + 0.28, cw);
    addDivider(s, lx, cardY + 0.52, cw);
    addContent(s, persona.believes, lx, cardY + 0.59, cw, 0.95);

    addLabel(s, 'ЮУНААС АЙДАГ?', rx, cardY + 0.28, cw);
    addDivider(s, rx, cardY + 0.52, cw);
    addContent(s, persona.fears, rx, cardY + 0.59, cw, 0.95);

    /* Зөрчил / Өдөр тутам */
    addLabel(s, 'ЯМАр ЗӨРЧИЛТЭЙ АМЬДАРДАГ?', lx, cardY + 1.65, cw);
    addDivider(s, lx, cardY + 1.89, cw);
    addContent(s, persona.tension, lx, cardY + 1.96, cw, 0.95);

    addLabel(s, 'ӨДӨР ТУТМЫН АМЬДРАЛ', rx, cardY + 1.65, cw);
    addDivider(s, rx, cardY + 1.89, cw);
    addContent(s, persona.daily_life, rx, cardY + 1.96, cw, 0.95);

    /* Core driver — full width, highlighted */
    addDivider(s, cardX + 0.3, cardY + 3.1, cardW - 0.6);
    addLabel(s, 'ГОЛ ХӨДӨЛГҮҮР', cardX + 0.3, cardY + 3.2, cardW - 0.6);
    s.addText(persona.core_driver || '—', {
      x: cardX + 0.3, y: cardY + 3.45, w: cardW - 0.6, h: 0.6,
      align: 'left', valign: 'middle',
      fontFace: F.serif, fontSize: 22,
      italic: true, color: C.gold,
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 4 — Insight
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addAccentBar(s);
    addNavBar(s, 3);
    addSectionHeader(s, '03', 'Гол инсайт', 'Insight — Хэлэгдээгүй үнэн');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, cardX, cardY, cardW, cardH, true);

    /* Large opening quote mark */
    s.addText('“', {
      x: cardX + 0.25, y: cardY + 0.1, w: 1.2, h: 1.2,
      align: 'left', valign: 'top',
      fontFace: F.serif, fontSize: 96,
      color: C.gold,
    });

    /* Insight text — large centered serif */
    s.addText(insight.insight || '[ Инсайт энд орно ]', {
      x: cardX + 1.1, y: cardY + 0.35, w: cardW - 1.5, h: cardH - 1.0,
      align: 'left', valign: 'middle',
      fontFace: F.serif, fontSize: 20,
      italic: true, color: C.text,
      wrap: true,
    });

    /* Bottom hint */
    s.addText('Ганц хүчтэй инсайт — бүх стратеги эндээс ургана.', {
      x: cardX + 0.3, y: cardY + cardH - 0.42, w: cardW - 0.6, h: 0.32,
      align: 'right', valign: 'middle',
      fontFace: F.body, fontSize: 8,
      italic: true, color: C.muted,
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 5 — Strategy
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addAccentBar(s);
    addNavBar(s, 4);
    addSectionHeader(s, '04', 'Стратеги', 'Strategy — Юу хийж, яаж хүрэх вэ?');

    const cardY = 1.5, cardH = H - 1.7;
    const colW  = (W - 0.5 - 0.04 * 2) / 3;

    const cols = [
      { num: 'I',   label: 'ГОЛ МЕССЕЖ', text: strategy.key_message, hint: 'Инсайтад суурилсан гол зурвас' },
      { num: 'II',  label: 'СУВАГ',       text: strategy.channels,    hint: 'Хаана, ямар сувгаар хүрэх вэ?' },
      { num: 'III', label: 'ХАНДЛАГА',   text: strategy.approach,    hint: 'Ямар өнцгөөр, ямар аяар?' },
    ];

    cols.forEach((c, i) => {
      const x = 0.25 + i * (colW + 0.02);

      addSurface(s, x, cardY, colW, cardH);

      /* Roman numeral */
      s.addText(c.num, {
        x: x + 0.2, y: cardY + 0.22, w: 0.9, h: 0.4,
        align: 'left', valign: 'middle',
        fontFace: F.serif, fontSize: 13,
        italic: true, color: C.gold,
      });

      addDivider(s, x + 0.2, cardY + 0.68, colW - 0.4);
      addLabel(s, c.label, x + 0.2, cardY + 0.78, colW - 0.4);
      addDivider(s, x + 0.2, cardY + 1.02, colW - 0.4);
      addContent(s, c.text, x + 0.2, cardY + 1.1, colW - 0.4, cardH - 1.8);

      /* Bottom hint */
      s.addText(c.hint, {
        x: x + 0.2, y: cardY + cardH - 0.45, w: colW - 0.4, h: 0.35,
        align: 'left', valign: 'bottom',
        fontFace: F.body, fontSize: 8,
        italic: true, color: C.muted,
        wrap: true,
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 6 — Creativity
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addAccentBar(s);
    addNavBar(s, 5);
    addSectionHeader(s, '05', 'Бүтээлч санаа', 'Big Idea — Санахуйц гол санаа');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, cardX, cardY, cardW, cardH);

    const leftW  = cardW * 0.55;
    const rightX = cardX + leftW + 0.2;
    const rightW = cardW - leftW - 0.5;

    /* Left: Big idea + Tagline */
    addLabel(s, 'BIG IDEA', cardX + 0.3, cardY + 0.28, leftW - 0.3);
    addDivider(s, cardX + 0.3, cardY + 0.52, leftW - 0.3);
    addContent(s, creativity.big_idea, cardX + 0.3, cardY + 0.6, leftW - 0.3, 2.2, {
      fontFace: F.serif, fontSize: 16, bold: false,
    });

    addDivider(s, cardX + 0.3, cardY + 2.95, leftW - 0.3);
    addLabel(s, 'TAGLINE', cardX + 0.3, cardY + 3.05, leftW - 0.3);
    s.addText(creativity.tagline || '—', {
      x: cardX + 0.3, y: cardY + 3.3, w: leftW - 0.3, h: 0.7,
      align: 'left', valign: 'middle',
      fontFace: F.serif, fontSize: 18,
      italic: true, color: C.gold,
    });

    /* Vertical divider between columns */
    s.addShape('rect' as PptxGenJS.ShapeType, {
      x: cardX + leftW + 0.08, y: cardY + 0.28, w: 0.008, h: cardH - 0.56,
      fill: { color: C.border }, line: { color: C.border, width: 0 },
    });

    /* Right: Executions */
    addLabel(s, 'ГҮЙЦЭТГЭЛ', rightX, cardY + 0.28, rightW);
    addDivider(s, rightX, cardY + 0.52, rightW);

    creativity.executions.slice(0, 5).forEach((ex, i) => {
      const ey = cardY + 0.65 + i * 0.95;
      /* Type pill */
      if (ex.content_type) {
        s.addShape('rect' as PptxGenJS.ShapeType, {
          x: rightX, y: ey, w: rightW, h: 0.22,
          fill: { color: C.goldDim },
          line: { color: C.gold, width: 0.5 },
        });
        s.addText(ex.content_type, {
          x: rightX + 0.08, y: ey, w: rightW - 0.1, h: 0.22,
          align: 'left', valign: 'middle',
          fontFace: F.sans, fontSize: 7.5,
          bold: true, charSpacing: 0.5, color: C.gold,
        });
      }
      s.addText(ex.description || '—', {
        x: rightX, y: ey + 0.25, w: rightW, h: 0.62,
        align: 'left', valign: 'top',
        fontFace: F.body, fontSize: 9.5,
        color: C.muted2, wrap: true,
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 7 — Pricing
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addAccentBar(s);
    addNavBar(s, 6);
    addSectionHeader(s, '06', 'Үнийн санал', 'Pricing — Автомат тооцоолол');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, cardX, cardY, cardW, cardH);

    /* Table columns */
    const tCols = [
      { label: 'КОНТЕНТ ТӨРӨЛ', x: cardX + 0.3,  w: 4.2  },
      { label: 'НЭГЖИЙН ҮНЭ',  x: cardX + 4.65,  w: 2.5  },
      { label: 'ТОО',           x: cardX + 7.3,   w: 0.9  },
      { label: 'НИЙТ',          x: cardX + 8.35,  w: 2.5  },
    ];

    /* Table header row */
    s.addShape('rect' as PptxGenJS.ShapeType, {
      x: cardX + 0.2, y: cardY + 0.28, w: cardW - 0.4, h: 0.33,
      fill: { color: C.surface2 },
      line: { color: C.border, width: 0.5 },
    });
    tCols.forEach(c => {
      s.addText(c.label, {
        x: c.x, y: cardY + 0.28, w: c.w, h: 0.33,
        align: 'left', valign: 'middle',
        fontFace: F.sans, fontSize: 7,
        bold: true, charSpacing: 1, color: C.muted2,
      });
    });

    /* Data rows */
    const maxRows = Math.min(pricing.items.length, 7);
    pricing.items.slice(0, maxRows).forEach((item, i) => {
      const ry  = cardY + 0.68 + i * 0.42;
      const lt  = item.unit_price * Math.max(0, item.quantity);
      const alt = i % 2 === 1;

      if (alt) {
        s.addShape('rect' as PptxGenJS.ShapeType, {
          x: cardX + 0.2, y: ry, w: cardW - 0.4, h: 0.38,
          fill: { color: C.surface2 },
          line: { color: C.border, width: 0.3 },
        });
      } else {
        s.addShape('rect' as PptxGenJS.ShapeType, {
          x: cardX + 0.2, y: ry, w: cardW - 0.4, h: 0.38,
          fill: { color: 'transparent' },
          line: { color: C.border, width: 0.3 },
        });
      }

      [
        { col: tCols[0], text: item.content_type || '—', color: C.text   },
        { col: tCols[1], text: fmt(item.unit_price),      color: C.muted2 },
        { col: tCols[2], text: String(item.quantity),     color: C.muted2 },
        { col: tCols[3], text: fmt(lt),                   color: C.blue   },
      ].forEach(cell => {
        s.addText(cell.text, {
          x: cell.col.x, y: ry, w: cell.col.w, h: 0.38,
          align: 'left', valign: 'middle',
          fontFace: F.body, fontSize: 10,
          color: cell.color,
        });
      });
    });

    /* Totals panel — bottom right */
    const totY = cardY + 0.68 + maxRows * 0.42 + 0.15;
    const totX = cardX + cardW * 0.6;
    const totW = cardW * 0.38;

    addDivider(s, totX, totY, totW);

    const totLines = [
      { label: 'Нийт дүн',    value: fmt(totals.subtotal),       color: C.muted2 },
      { label: `Хөнгөлөлт (${pricing.discount_pct}%)`, value: pricing.discount_pct > 0 ? `-${fmt(totals.discount_amount)}` : '—', color: C.danger },
      { label: `НӨАТ (${pricing.vat_pct}%)`, value: fmt(totals.vat_amount), color: C.muted2 },
    ];

    totLines.forEach((t, i) => {
      const ty = totY + 0.08 + i * 0.36;
      s.addText(t.label, {
        x: totX, y: ty, w: totW * 0.55, h: 0.32,
        align: 'left', valign: 'middle',
        fontFace: F.body, fontSize: 9, color: C.muted,
      });
      s.addText(t.value, {
        x: totX + totW * 0.55, y: ty, w: totW * 0.44, h: 0.32,
        align: 'right', valign: 'middle',
        fontFace: F.body, fontSize: 9, color: t.color,
      });
    });

    /* Grand total — large gold serif */
    const gtY = totY + totLines.length * 0.36 + 0.12;
    addDivider(s, totX, gtY, totW);

    s.addText('НИЙТ ТӨЛБӨР', {
      x: totX, y: gtY + 0.1, w: totW * 0.5, h: 0.5,
      align: 'left', valign: 'middle',
      fontFace: F.sans, fontSize: 8,
      bold: true, charSpacing: 1.5, color: C.muted2,
    });
    s.addText(fmt(totals.grand_total), {
      x: totX, y: gtY + 0.1, w: totW - 0.1, h: 0.5,
      align: 'right', valign: 'middle',
      fontFace: F.serif, fontSize: 26,
      color: C.gold,
    });
  }

  /* ── Download ─────────────────────────────────────────────────────── */
  const fileName = `${header.brand_name || 'Proposal'}_${header.campaign_name || 'Draft'}.pptx`
    .replace(/[^a-zA-Z0-9А-Яа-яҮүӨөЭэ\s._-]/g, '')
    .replace(/\s+/g, '_');

  await pptx.writeFile({ fileName });
}
