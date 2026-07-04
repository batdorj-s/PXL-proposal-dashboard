import PptxGenJS from 'pptxgenjs';
import type { Proposal, BrandAssets } from '@/types';
import { calcPricing, fmt } from '@/lib/pricing';

/* ════════════════════════════════════════════════════════════════════
   MERIDIAN — PPT Design System
   Mirrors the dashboard exactly: dark bg, gold accent, cream text
   ════════════════════════════════════════════════════════════════════ */

const W = 13.33; // LAYOUT_WIDE width (inches)
const H = 7.5;   // LAYOUT_WIDE height (inches)

/* ── Build design tokens from brand ──────────────────────────────── */
function tokens(brand?: BrandAssets) {
  return {
    bg:       '050508',
    surface:  '111118',
    surface2: '18181F',
    border:   '1E1E28',
    text:     (brand?.accent_color ?? '#E8E0D5').replace('#', ''),
    muted:    '6B6A72',
    muted2:   '9A9098',
    gold:     (brand?.primary_color ?? '#C9A96E').replace('#', ''),
    goldDim:  '2E2519',
    blue:     (brand?.secondary_color ?? '#4A9EFF').replace('#', ''),
    danger:   'E05555',
    serif:    'Garamond',
    sans:     'Calibri',
    body:     'Calibri',
    logo:     brand?.logo ?? '',
  };
}

/* ── Nav labels ──────────────────────────────────────────────────── */
const NAV = ['Нүүр', 'Нөхцөл', 'Persona', 'Инсайт', 'Стратеги', 'Санаа', 'Үнэ'];

/* ════════════════════════════════════════════════════════════════════
   PRIMITIVES
   ════════════════════════════════════════════════════════════════════ */

type Tokens = ReturnType<typeof tokens>;

/* Full-slide dark background */
function addBg(s: PptxGenJS.Slide, t: Tokens) {
  s.background = { color: t.bg };
}

/* Left vertical gold accent bar — mirrors block-card::before */
function addAccentBar(s: PptxGenJS.Slide, t: Tokens) {
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0, y: 0, w: 0.055, h: H,
    fill: { color: t.gold },
    line: { color: t.gold, width: 0 },
  });
}

/* Top navigation bar — mirrors dashboard header */
function addNavBar(s: PptxGenJS.Slide, t: Tokens, activeIdx: number) {
  /* Bar background */
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0, y: 0, w: W, h: 0.52,
    fill: { color: t.surface },
    line: { color: t.border, width: 0.75 },
  });

  /* MERIDIAN wordmark */
  s.addText('MERIDIAN', {
    x: 0.2, y: 0, w: 1.4, h: 0.52,
    align: 'left', valign: 'middle',
    fontFace: t.sans, fontSize: 8,
    bold: true, charSpacing: 3,
    color: t.gold,
  });

  /* Divider */
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 1.65, y: 0.12, w: 0.01, h: 0.28,
    fill: { color: t.border },
    line: { color: t.border, width: 0 },
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
        fill: { color: t.gold },
        line: { color: t.gold, width: 0 },
      });
    }

    s.addText(label, {
      x, y: 0, w: tabW, h: 0.44,
      align: 'center', valign: 'middle',
      fontFace: t.sans, fontSize: 7.5,
      bold: isActive, charSpacing: 0.5,
      color: isActive ? t.gold : t.muted,
    });
  });
}

/* Section header block (top-left of content slides) */
function addSectionHeader(
  s: PptxGenJS.Slide,
  t: Tokens,
  num: string,
  title: string,
  subtitle: string,
) {
  const contentY = 0.7;

  /* Section number — small italic serif gold */
  s.addText(num, {
    x: 0.25, y: contentY, w: 0.6, h: 0.35,
    align: 'left', valign: 'middle',
    fontFace: t.serif, fontSize: 11,
    italic: true, color: t.gold,
  });

  /* Divider */
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0.82, y: contentY + 0.07, w: 0.01, h: 0.22,
    fill: { color: t.muted },
    line: { color: t.muted, width: 0 },
  });

  /* Title — large serif cream */
  s.addText(title, {
    x: 0.92, y: contentY - 0.06, w: 9.0, h: 0.48,
    align: 'left', valign: 'middle',
    fontFace: t.serif, fontSize: 22,
    color: t.text,
  });

  /* Subtitle — small muted */
  s.addText(subtitle, {
    x: 0.92, y: contentY + 0.42, w: 10.0, h: 0.28,
    align: 'left', valign: 'top',
    fontFace: t.body, fontSize: 8.5,
    italic: true, color: t.muted2,
  });
}

/* Dark surface card — mirrors .block-card */
function addSurface(
  s: PptxGenJS.Slide,
  t: Tokens,
  x: number, y: number, w: number, h: number,
  highlight = false,
) {
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x, y, w, h,
    fill: { color: t.surface },
    line: { color: highlight ? t.gold : t.border, width: highlight ? 1 : 0.5 },
  });
}

/* Field label — mirrors .field-label (small caps, gold-ish muted) */
function addLabel(s: PptxGenJS.Slide, t: Tokens, text: string, x: number, y: number, w: number) {
  s.addText(text, {
    x, y, w, h: 0.22,
    align: 'left', valign: 'top',
    fontFace: t.sans, fontSize: 7,
    bold: true, charSpacing: 1.5,
    color: t.muted2,
  });
}

/* Field content — mirrors field text */
function addContent(
  s: PptxGenJS.Slide,
  t: Tokens,
  text: string,
  x: number, y: number, w: number, h: number,
  opts: Partial<PptxGenJS.TextPropsOptions> = {},
) {
  s.addText(text || '—', {
    x, y, w, h,
    align: 'left', valign: 'top',
    fontFace: t.body, fontSize: 11,
    color: t.text, wrap: true,
    ...opts,
  });
}

/* Thin horizontal gold divider line */
function addDivider(s: PptxGenJS.Slide, t: Tokens, x: number, y: number, w: number) {
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x, y, w, h: 0.008,
    fill: { color: t.border },
    line: { color: t.border, width: 0 },
  });
}

/* ════════════════════════════════════════════════════════════════════
   PUBLIC EXPORT
   ════════════════════════════════════════════════════════════════════ */
export async function generatePptx(proposal: Proposal): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  const { header, brand, background, persona, insight, strategy, creativity, pricing } = proposal;
  const t = tokens(brand);
  const totals = calcPricing(pricing);

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 1 — Cover
     Full dark with decorative geometry, large brand name
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s, t);

    /* Left gold accent bar */
    addAccentBar(s, t);

    /* Decorative circle — top right (dark surface, matches WebGL mesh mood) */
    s.addShape('ellipse' as PptxGenJS.ShapeType, {
      x: W - 4.2, y: -2.4, w: 6.0, h: 6.0,
      fill: { color: t.surface },
      line: { color: t.border, width: 1 },
    });
    s.addShape('ellipse' as PptxGenJS.ShapeType, {
      x: W - 2.1, y: -0.6, w: 2.4, h: 2.4,
      fill: { color: t.surface2 },
      line: { color: t.gold, width: 0.75 },
    });
    /* Small gold dot */
    s.addShape('ellipse' as PptxGenJS.ShapeType, {
      x: W - 1.1, y: 0.3, w: 0.14, h: 0.14,
      fill: { color: t.gold },
      line: { color: t.gold, width: 0 },
    });

    /* Logo or wordmark */
    if (t.logo) {
      s.addImage({ path: t.logo, x: 0.55, y: 1.4, w: 2.0, h: 0.5 });
    } else {
      s.addText('MERIDIAN', {
        x: 0.55, y: 1.5, w: 4.0, h: 0.35,
        align: 'left', valign: 'middle',
        fontFace: t.sans, fontSize: 9,
        bold: true, charSpacing: 4,
        color: t.gold,
      });
    }

    /* Thin gold line under wordmark/logo */
    s.addShape('rect' as PptxGenJS.ShapeType, {
      x: 0.55, y: 1.9, w: 0.55, h: 0.01,
      fill: { color: t.gold }, line: { color: t.gold, width: 0 },
    });

    /* Brand name — very large serif */
    s.addText(header.brand_name || 'Брэндийн нэр', {
      x: 0.55, y: 2.1, w: 9.5, h: 1.6,
      align: 'left', valign: 'middle',
      fontFace: t.serif, fontSize: 54,
      color: t.text,
    });

    /* Campaign name — gold italic */
    s.addText(header.campaign_name || 'Кампанит ажлын нэр', {
      x: 0.55, y: 3.8, w: 9.5, h: 0.55,
      align: 'left', valign: 'middle',
      fontFace: t.serif, fontSize: 18,
      italic: true, color: t.gold,
    });

    /* Thin divider */
    addDivider(s, t, 0.55, 4.55, 4.0);

    /* Prepared by / Date — small muted */
    s.addText(`Бэлтгэсэн: ${header.prepared_by || '—'}`, {
      x: 0.55, y: 4.7, w: 5.0, h: 0.3,
      align: 'left', valign: 'middle',
      fontFace: t.body, fontSize: 9,
      color: t.muted2,
    });
    s.addText(`Огноо: ${header.date || '—'}`, {
      x: 0.55, y: 5.05, w: 5.0, h: 0.3,
      align: 'left', valign: 'middle',
      fontFace: t.body, fontSize: 9,
      color: t.muted2,
    });

    /* Bottom-right: "Маркетингийн санал" */
    s.addText('Маркетингийн санал', {
      x: W - 4.0, y: H - 0.5, w: 3.8, h: 0.35,
      align: 'right', valign: 'middle',
      fontFace: t.sans, fontSize: 7,
      charSpacing: 1.5, color: t.muted,
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 2 — Background
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s, t);
    addAccentBar(s, t);
    addNavBar(s, t, 1);
    addSectionHeader(s, t, '01', 'Нөхцөл байдал', 'Background — Ямар асуудлыг шийдэх вэ?');

    /* Main surface card */
    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, t, cardX, cardY, cardW, cardH);

    /* Нөхцөл */
    addLabel(s, t, 'БРЭНДИЙН ОДООГИЙН НӨХЦӨЛ', cardX + 0.3, cardY + 0.3, cardW - 0.6);
    addDivider(s, t, cardX + 0.3, cardY + 0.55, cardW - 0.6);
    addContent(s, t, background.context, cardX + 0.3, cardY + 0.62, cardW * 0.58, 1.3);

    /* Сорилт */
    addLabel(s, t, 'ГОЛ СОРИЛТ', cardX + 0.3, cardY + 2.1, cardW - 0.6);
    addDivider(s, t, cardX + 0.3, cardY + 2.35, cardW - 0.6);
    addContent(s, t, background.key_challenge, cardX + 0.3, cardY + 2.42, cardW * 0.58, 1.0);

    /* Supporting data (right column) */
    const rx = cardX + cardW * 0.65;
    const rw = cardW * 0.32;
    addLabel(s, t, 'ДЭМЖИХ ӨГӨГДӨЛ', rx, cardY + 0.3, rw);
    addDivider(s, t, rx, cardY + 0.55, rw);
    addContent(s, t, background.supporting_data || '—', rx, cardY + 0.62, rw, 3.5, { fontSize: 10 });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 3 — Persona
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s, t);
    addAccentBar(s, t);
    addNavBar(s, t, 2);
    addSectionHeader(s, t, '02', 'Зорилтот хэрэглэгч', 'Persona — Хэнд зориулж байна?');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, t, cardX, cardY, cardW, cardH);

    const lx = cardX + 0.3, rx = cardX + cardW / 2 + 0.1;
    const cw = cardW / 2 - 0.45;

    /* Итгэл / Айдас */
    addLabel(s, t, 'ЮУНД ИТГЭДЭГ?', lx, cardY + 0.28, cw);
    addDivider(s, t, lx, cardY + 0.52, cw);
    addContent(s, t, persona.believes, lx, cardY + 0.59, cw, 0.95);

    addLabel(s, t, 'ЮУНААС АЙДАГ?', rx, cardY + 0.28, cw);
    addDivider(s, t, rx, cardY + 0.52, cw);
    addContent(s, t, persona.fears, rx, cardY + 0.59, cw, 0.95);

    /* Зөрчил / Өдөр тутам */
    addLabel(s, t, 'ЯМАр ЗӨРЧИЛТЭЙ АМЬДАРДАГ?', lx, cardY + 1.65, cw);
    addDivider(s, t, lx, cardY + 1.89, cw);
    addContent(s, t, persona.tension, lx, cardY + 1.96, cw, 0.95);

    addLabel(s, t, 'ӨДӨР ТУТМЫН АМЬДРАЛ', rx, cardY + 1.65, cw);
    addDivider(s, t, rx, cardY + 1.89, cw);
    addContent(s, t, persona.daily_life, rx, cardY + 1.96, cw, 0.95);

    /* Core driver — full width, highlighted */
    addDivider(s, t, cardX + 0.3, cardY + 3.1, cardW - 0.6);
    addLabel(s, t, 'ГОЛ ХӨДӨЛГҮҮР', cardX + 0.3, cardY + 3.2, cardW - 0.6);
    s.addText(persona.core_driver || '—', {
      x: cardX + 0.3, y: cardY + 3.45, w: cardW - 0.6, h: 0.6,
      align: 'left', valign: 'middle',
      fontFace: t.serif, fontSize: 22,
      italic: true, color: t.gold,
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 4 — Insight
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s, t);
    addAccentBar(s, t);
    addNavBar(s, t, 3);
    addSectionHeader(s, t, '03', 'Гол инсайт', 'Insight — Хэлэгдээгүй үнэн');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, t, cardX, cardY, cardW, cardH, true);

    /* Large opening quote mark */
    s.addText('“', {
      x: cardX + 0.25, y: cardY + 0.1, w: 1.2, h: 1.2,
      align: 'left', valign: 'top',
      fontFace: t.serif, fontSize: 96,
      color: t.gold,
    });

    /* Insight text — large centered serif */
    s.addText(insight.insight || '[ Инсайт энд орно ]', {
      x: cardX + 1.1, y: cardY + 0.35, w: cardW - 1.5, h: cardH - 1.0,
      align: 'left', valign: 'middle',
      fontFace: t.serif, fontSize: 20,
      italic: true, color: t.text,
      wrap: true,
    });

    /* Bottom hint */
    s.addText('Ганц хүчтэй инсайт — бүх стратеги эндээс ургана.', {
      x: cardX + 0.3, y: cardY + cardH - 0.42, w: cardW - 0.6, h: 0.32,
      align: 'right', valign: 'middle',
      fontFace: t.body, fontSize: 8,
      italic: true, color: t.muted,
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 5 — Strategy
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s, t);
    addAccentBar(s, t);
    addNavBar(s, t, 4);
    addSectionHeader(s, t, '04', 'Стратеги', 'Strategy — Юу хийж, яаж хүрэх вэ?');

    const cardY = 1.5, cardH = H - 1.7;
    const colW  = (W - 0.5 - 0.04 * 2) / 3;

    const cols = [
      { num: 'I',   label: 'ГОЛ МЕССЕЖ', text: strategy.key_message, hint: 'Инсайтад суурилсан гол зурвас' },
      { num: 'II',  label: 'СУВАГ',       text: strategy.channels,    hint: 'Хаана, ямар сувгаар хүрэх вэ?' },
      { num: 'III', label: 'ХАНДЛАГА',   text: strategy.approach,    hint: 'Ямар өнцгөөр, ямар аяар?' },
    ];

    cols.forEach((c, i) => {
      const x = 0.25 + i * (colW + 0.02);

      addSurface(s, t, x, cardY, colW, cardH);

      /* Roman numeral */
      s.addText(c.num, {
        x: x + 0.2, y: cardY + 0.22, w: 0.9, h: 0.4,
        align: 'left', valign: 'middle',
        fontFace: t.serif, fontSize: 13,
        italic: true, color: t.gold,
      });

      addDivider(s, t, x + 0.2, cardY + 0.68, colW - 0.4);
      addLabel(s, t, c.label, x + 0.2, cardY + 0.78, colW - 0.4);
      addDivider(s, t, x + 0.2, cardY + 1.02, colW - 0.4);
      addContent(s, t, c.text, x + 0.2, cardY + 1.1, colW - 0.4, cardH - 1.8);

      /* Bottom hint */
      s.addText(c.hint, {
        x: x + 0.2, y: cardY + cardH - 0.45, w: colW - 0.4, h: 0.35,
        align: 'left', valign: 'bottom',
        fontFace: t.body, fontSize: 8,
        italic: true, color: t.muted,
        wrap: true,
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 6 — Creativity
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s, t);
    addAccentBar(s, t);
    addNavBar(s, t, 5);
    addSectionHeader(s, t, '05', 'Бүтээлч санаа', 'Big Idea — Санахуйц гол санаа');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, t, cardX, cardY, cardW, cardH);

    const leftW  = cardW * 0.55;
    const rightX = cardX + leftW + 0.2;
    const rightW = cardW - leftW - 0.5;

    /* Left: Big idea + Tagline */
    addLabel(s, t, 'BIG IDEA', cardX + 0.3, cardY + 0.28, leftW - 0.3);
    addDivider(s, t, cardX + 0.3, cardY + 0.52, leftW - 0.3);
    addContent(s, t, creativity.big_idea, cardX + 0.3, cardY + 0.6, leftW - 0.3, 2.2, {
      fontFace: t.serif, fontSize: 16, bold: false,
    });

    addDivider(s, t, cardX + 0.3, cardY + 2.95, leftW - 0.3);
    addLabel(s, t, 'TAGLINE', cardX + 0.3, cardY + 3.05, leftW - 0.3);
    s.addText(creativity.tagline || '—', {
      x: cardX + 0.3, y: cardY + 3.3, w: leftW - 0.3, h: 0.7,
      align: 'left', valign: 'middle',
      fontFace: t.serif, fontSize: 18,
      italic: true, color: t.gold,
    });

    /* Vertical divider between columns */
    s.addShape('rect' as PptxGenJS.ShapeType, {
      x: cardX + leftW + 0.08, y: cardY + 0.28, w: 0.008, h: cardH - 0.56,
      fill: { color: t.border }, line: { color: t.border, width: 0 },
    });

    /* Right: Executions */
    addLabel(s, t, 'ГҮЙЦЭТГЭЛ', rightX, cardY + 0.28, rightW);
    addDivider(s, t, rightX, cardY + 0.52, rightW);

    creativity.executions.slice(0, 5).forEach((ex, i) => {
      const ey = cardY + 0.65 + i * 0.95;
      /* Type pill */
      if (ex.content_type) {
        s.addShape('rect' as PptxGenJS.ShapeType, {
          x: rightX, y: ey, w: rightW, h: 0.22,
          fill: { color: t.goldDim },
          line: { color: t.gold, width: 0.5 },
        });
        s.addText(ex.content_type, {
          x: rightX + 0.08, y: ey, w: rightW - 0.1, h: 0.22,
          align: 'left', valign: 'middle',
          fontFace: t.sans, fontSize: 7.5,
          bold: true, charSpacing: 0.5, color: t.gold,
        });
      }
      s.addText(ex.description || '—', {
        x: rightX, y: ey + 0.25, w: rightW, h: 0.62,
        align: 'left', valign: 'top',
        fontFace: t.body, fontSize: 9.5,
        color: t.muted2, wrap: true,
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 7 — Pricing
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s, t);
    addAccentBar(s, t);
    addNavBar(s, t, 6);
    addSectionHeader(s, t, '06', 'Үнийн санал', 'Pricing — Автомат тооцоолол');

    const cardX = 0.25, cardY = 1.5, cardW = W - 0.5, cardH = H - 1.7;
    addSurface(s, t, cardX, cardY, cardW, cardH);

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
      fill: { color: t.surface2 },
      line: { color: t.border, width: 0.5 },
    });
    tCols.forEach(c => {
      s.addText(c.label, {
        x: c.x, y: cardY + 0.28, w: c.w, h: 0.33,
        align: 'left', valign: 'middle',
        fontFace: t.sans, fontSize: 7,
        bold: true, charSpacing: 1, color: t.muted2,
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
          fill: { color: t.surface2 },
          line: { color: t.border, width: 0.3 },
        });
      } else {
        s.addShape('rect' as PptxGenJS.ShapeType, {
          x: cardX + 0.2, y: ry, w: cardW - 0.4, h: 0.38,
          fill: { color: 'transparent' },
          line: { color: t.border, width: 0.3 },
        });
      }

      [
        { col: tCols[0], text: item.content_type || '—', color: t.text   },
        { col: tCols[1], text: fmt(item.unit_price),      color: t.muted2 },
        { col: tCols[2], text: String(item.quantity),     color: t.muted2 },
        { col: tCols[3], text: fmt(lt),                   color: t.blue   },
      ].forEach(cell => {
        s.addText(cell.text, {
          x: cell.col.x, y: ry, w: cell.col.w, h: 0.38,
          align: 'left', valign: 'middle',
          fontFace: t.body, fontSize: 10,
          color: cell.color,
        });
      });
    });

    /* Totals panel — bottom right */
    const totY = cardY + 0.68 + maxRows * 0.42 + 0.15;
    const totX = cardX + cardW * 0.6;
    const totW = cardW * 0.38;

    addDivider(s, t, totX, totY, totW);

    const totLines = [
      { label: 'Нийт дүн',    value: fmt(totals.subtotal),       color: t.muted2 },
      { label: `Хөнгөлөлт (${pricing.discount_pct}%)`, value: pricing.discount_pct > 0 ? `-${fmt(totals.discount_amount)}` : '—', color: t.danger },
      { label: `НӨАТ (${pricing.vat_pct}%)`, value: fmt(totals.vat_amount), color: t.muted2 },
    ];

    totLines.forEach((line, i) => {
      const ty = totY + 0.08 + i * 0.36;
      s.addText(line.label, {
        x: totX, y: ty, w: totW * 0.55, h: 0.32,
        align: 'left', valign: 'middle',
        fontFace: t.body, fontSize: 9, color: t.muted,
      });
      s.addText(line.value, {
        x: totX + totW * 0.55, y: ty, w: totW * 0.44, h: 0.32,
        align: 'right', valign: 'middle',
        fontFace: t.body, fontSize: 9, color: line.color,
      });
    });

    /* Grand total — large gold serif */
    const gtY = totY + totLines.length * 0.36 + 0.12;
    addDivider(s, t, totX, gtY, totW);

    s.addText('НИЙТ ТӨЛБӨР', {
      x: totX, y: gtY + 0.1, w: totW * 0.5, h: 0.5,
      align: 'left', valign: 'middle',
      fontFace: t.sans, fontSize: 8,
      bold: true, charSpacing: 1.5, color: t.muted2,
    });
    s.addText(fmt(totals.grand_total), {
      x: totX, y: gtY + 0.1, w: totW - 0.1, h: 0.5,
      align: 'right', valign: 'middle',
      fontFace: t.serif, fontSize: 26,
      color: t.gold,
    });
  }

  /* ── Download ─────────────────────────────────────────────────────── */
  const fileName = `${header.brand_name || 'Proposal'}_${header.campaign_name || 'Draft'}.pptx`
    .replace(/[^a-zA-Z0-9А-Яа-яҮүӨөЭэ\s._-]/g, '')
    .replace(/\s+/g, '_');

  await pptx.writeFile({ fileName });
}
