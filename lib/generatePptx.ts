import PptxGenJS from 'pptxgenjs';
import type { Proposal } from '@/types';
import { calcPricing, fmt } from '@/lib/pricing';

/* ── Slide canvas size (matches template: 12192000 x 6858000 EMU) ─── */
const W = 13.33;
const H = 7.5;

/* ── Color palette ──────────────────────────────────────────────────── */
const C = {
  navy:   '24365B',
  dark:   '1B2A4A',
  lblue:  'CADCFC',
  coral:  'FF5A5F',
  grayBg: 'E4E9F2',
  grayMd: '6B7A90',
  grayLt: 'AEB8C9',
  white:  'FFFFFF',
  black:  '000000',
} as const;

/* ── Nav tabs (shown on slides 2–7) ─────────────────────────────────── */
const NAV_TABS = ['Нөхцөл', 'Хэрэглэгч', 'Инсайт', 'Стратеги', 'Санаа', 'Үнэ'];

function addNavTabs(slide: PptxGenJS.Slide, activeIdx: number) {
  const tabW = 0.92;
  const tabH = 0.42;
  const startX = W - NAV_TABS.length * (tabW + 0.02) - 0.3;
  const y = 0.48;

  NAV_TABS.forEach((label, i) => {
    const x = startX + i * (tabW + 0.02);
    const isActive = i === activeIdx;

    slide.addShape('rect' as PptxGenJS.ShapeType, {
      x, y, w: tabW, h: tabH,
      fill: { color: isActive ? C.coral : C.grayBg },
      line: { color: isActive ? C.coral : C.grayBg, width: 0 },
    });

    slide.addText(label, {
      x, y, w: tabW, h: tabH,
      align: 'center',
      valign: 'middle',
      fontSize: 8,
      bold: isActive,
      color: isActive ? C.white : C.grayMd,
      fontFace: 'Arial',
    });
  });
}

/* ── Slide background ────────────────────────────────────────────────── */
function addBg(slide: PptxGenJS.Slide) {
  slide.background = { color: C.navy };

  /* Decorative circles – top right, matching template */
  slide.addShape('ellipse' as PptxGenJS.ShapeType, {
    x: W - 3.8, y: -1.6, w: 4.2, h: 4.2,
    fill: { color: '1B2A4A' },
    line: { color: '1B2A4A', width: 0 },
  });
  slide.addShape('ellipse' as PptxGenJS.ShapeType, {
    x: W - 2.6, y: -0.7, w: 1.5, h: 1.5,
    fill: { color: C.coral },
    line: { color: C.coral, width: 0 },
  });
}

/* ── Section number badge ────────────────────────────────────────────── */
function addBadge(slide: PptxGenJS.Slide, num: string, x = 0.7, y = 0.7) {
  slide.addShape('ellipse' as PptxGenJS.ShapeType, {
    x, y, w: 0.62, h: 0.62,
    fill: { color: C.coral },
    line: { color: C.coral, width: 0 },
  });
  slide.addText(num, {
    x, y, w: 0.62, h: 0.62,
    align: 'center', valign: 'middle',
    fontSize: 14, bold: true,
    color: C.white, fontFace: 'Arial',
  });
}

/* ── Section title row ───────────────────────────────────────────────── */
function addSectionTitle(slide: PptxGenJS.Slide, title: string, subtitle: string) {
  /* Coral title bar */
  slide.addShape('rect' as PptxGenJS.ShapeType, {
    x: 1.5, y: 0.42, w: 6.0, h: 0.35,
    fill: { color: C.coral },
    line: { color: C.coral, width: 0 },
  });
  slide.addText(title, {
    x: 1.5, y: 0.42, w: 6.0, h: 0.35,
    align: 'left', valign: 'middle',
    fontSize: 13, bold: true,
    color: C.white, fontFace: 'Arial',
  });

  /* Dark subtitle bar */
  slide.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0.7, y: 1.33, w: 8.2, h: 0.5,
    fill: { color: C.dark },
    line: { color: C.dark, width: 0 },
  });
  slide.addText(subtitle, {
    x: 0.7, y: 1.33, w: 8.2, h: 0.5,
    align: 'left', valign: 'middle',
    fontSize: 11, italic: true,
    color: C.grayBg, fontFace: 'Arial',
  });
}

/* ── White content card ──────────────────────────────────────────────── */
function addCard(slide: PptxGenJS.Slide, x: number, y: number, w: number, h: number) {
  slide.addShape('rect' as PptxGenJS.ShapeType, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: C.white, width: 0 },
    shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.15 },
  });
}

/* ── Inside-card dark label ──────────────────────────────────────────── */
function addCardLabel(slide: PptxGenJS.Slide, label: string, x: number, y: number, w: number) {
  slide.addShape('rect' as PptxGenJS.ShapeType, {
    x, y, w, h: 0.4,
    fill: { color: C.dark },
    line: { color: C.dark, width: 0 },
  });
  slide.addText(label, {
    x, y, w, h: 0.4,
    align: 'left', valign: 'middle',
    fontSize: 9, bold: true,
    color: C.lblue, fontFace: 'Arial',
  });
}

/* ── Body text inside card ───────────────────────────────────────────── */
function addCardText(
  slide: PptxGenJS.Slide,
  text: string,
  x: number, y: number, w: number, h: number,
  opts: Partial<PptxGenJS.TextPropsOptions> = {}
) {
  slide.addText(text || '—', {
    x, y, w, h,
    align: 'left', valign: 'top',
    fontSize: 11, color: C.dark,
    fontFace: 'Arial',
    wrap: true,
    ...opts,
  });
}

/* ════════════════════════════════════════════════════════════════════
   PUBLIC EXPORT
   ════════════════════════════════════════════════════════════════════ */
export async function generatePptx(proposal: Proposal): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33" × 7.5"

  const { header, background, persona, insight, strategy, creativity, pricing } = proposal;
  const totals = calcPricing(pricing);

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 1 — Cover
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);

    /* "МАРКЕТИНГИЙН САНАЛ" label */
    slide1Label(s, 0.9, 2.15, 9.0, 'МАРКЕТИНГИЙН САНАЛ');

    /* Brand name (large white box) */
    s.addShape('rect' as PptxGenJS.ShapeType, {
      x: 0.9, y: 2.6, w: 10.5, h: 1.1,
      fill: { color: C.white }, line: { color: C.white, width: 0 },
    });
    s.addText(header.brand_name || 'Брэндийн нэр', {
      x: 0.9, y: 2.6, w: 10.5, h: 1.1,
      align: 'left', valign: 'middle',
      fontSize: 28, bold: true,
      color: C.dark, fontFace: 'Arial',
    });

    /* Campaign name */
    slide1Label(s, 0.9, 3.85, 9.5, header.campaign_name || 'Кампанит ажлын нэр');

    /* Prepared by + Date */
    slide1Label(s, 0.9, 5.7, 8.0,
      `Бэлтгэсэн: ${header.prepared_by || '—'}     Огноо: ${header.date || '—'}`
    );
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 2 — Background
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addBadge(s, '1');
    addNavTabs(s, 0);
    addSectionTitle(s, 'НӨХЦӨЛ БАЙДАЛ', 'Background — Ямар асуудлыг шийдэх вэ?');

    const cardY = 2.0, cardH = 4.8;
    addCard(s, 0.7, cardY, W - 1.0, cardH);

    addCardLabel(s, 'БРЭНДИЙН ОДООГИЙН НӨХЦӨЛ', 1.1, 2.35, W - 1.8);
    addCardText(s, background.context, 1.1, 2.85, W - 1.8, 1.4);

    addCardLabel(s, 'ГОЛ СОРИЛТ', 1.1, 4.35, W - 1.8);
    addCardText(s, background.key_challenge, 1.1, 4.82, W - 1.8, 0.9);

    if (background.supporting_data) {
      addCardLabel(s, 'ДЭМЖИХ ӨГӨГДӨЛ', 1.1, 5.82, W - 1.8);
      addCardText(s, background.supporting_data, 1.1, 6.28, W - 1.8, 0.4, { fontSize: 9.5 });
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 3 — Persona
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addBadge(s, '2');
    addNavTabs(s, 1);
    addSectionTitle(s, 'ЗОРИЛТОТ ХЭРЭГЛЭГЧ', 'Persona — Хэнд зориулж байна?');

    addCard(s, 0.7, 2.0, W - 1.0, 4.8);

    const col1X = 1.1, col2X = 7.0;
    const colW  = 5.6;

    addCardLabel(s, 'ЮУНД ИТГЭДЭГ ВЭ?', col1X, 2.35, colW);
    addCardText(s, persona.believes, col1X, 2.82, colW, 0.9);

    addCardLabel(s, 'ЮУНААС АЙДАГ?', col2X, 2.35, colW);
    addCardText(s, persona.fears, col2X, 2.82, colW, 0.9);

    addCardLabel(s, 'ЯМАр ЗӨРЧИЛТЭЙ АМЬДАРДАГ?', col1X, 3.88, colW);
    addCardText(s, persona.tension, col1X, 4.35, colW, 0.9);

    addCardLabel(s, 'ӨДӨР ТУТМЫН АМЬДРАЛ', col2X, 3.88, colW);
    addCardText(s, persona.daily_life, col2X, 4.35, colW, 0.9);

    addCardLabel(s, 'ГОЛ ХӨДӨЛГҮҮР', col1X, 5.41, W - 1.8);
    addCardText(s, persona.core_driver, col1X, 5.88, W - 1.8, 0.65, { bold: true, fontSize: 14, color: C.coral });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 4 — Insight
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addBadge(s, '3');
    addNavTabs(s, 2);
    addSectionTitle(s, 'ГОЛ ИНСАЙТ', 'Insight — Хэлэгдээгүй үнэн');

    addCard(s, 0.7, 2.0, W - 1.0, 4.8);

    /* Big quote marks */
    s.addText('"', {
      x: 1.0, y: 2.2, w: 1.0, h: 1.0,
      align: 'left', valign: 'top',
      fontSize: 72, color: C.coral,
      fontFace: 'Arial',
    });

    addCardText(s, insight.insight || '[ Инсайт энд орно ]', 1.8, 2.6, W - 2.8, 3.5, {
      fontSize: 18,
      italic: true,
      bold: false,
      color: C.dark,
      align: 'left',
      valign: 'middle',
    });

    /* Bottom hint */
    s.addText('Ганц хүчтэй инсайт бич — олон биш. Бүх стратеги эндээс ургана.', {
      x: 1.1, y: 6.45, w: W - 1.8, h: 0.4,
      align: 'left', valign: 'middle',
      fontSize: 9, italic: true,
      color: C.grayMd, fontFace: 'Arial',
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 5 — Strategy
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addBadge(s, '4');
    addNavTabs(s, 3);
    addSectionTitle(s, 'СТРАТЕГИ', 'Strategy — Юу хийж, яаж хүрэх вэ?');

    const cardY = 2.0, cardH = 4.8;
    const col = (W - 1.4) / 3;
    const cols = [
      { num: '1', label: 'ГОЛ МЕССЕЖ',  text: strategy.key_message, hint: 'Инсайтад суурилсан гол зурвас' },
      { num: '2', label: 'СУВАГ',       text: strategy.channels,    hint: 'Хаана, ямар сувгаар хүрэх вэ?' },
      { num: '3', label: 'ХАНДЛАГА',   text: strategy.approach,    hint: 'Ямар өнцгөөр, ямар аяар?' },
    ];

    cols.forEach((c, i) => {
      const x = 0.7 + i * col;
      /* Card */
      addCard(s, x + 0.02, cardY, col - 0.04, cardH);
      /* Number */
      s.addShape('ellipse' as PptxGenJS.ShapeType, {
        x: x + 0.18, y: cardY + 0.25, w: 0.42, h: 0.42,
        fill: { color: C.coral }, line: { color: C.coral, width: 0 },
      });
      s.addText(c.num, {
        x: x + 0.18, y: cardY + 0.25, w: 0.42, h: 0.42,
        align: 'center', valign: 'middle',
        fontSize: 11, bold: true,
        color: C.white, fontFace: 'Arial',
      });
      /* Label */
      addCardLabel(s, c.label, x + 0.18, cardY + 0.85, col - 0.26);
      /* Content */
      addCardText(s, c.text, x + 0.18, cardY + 1.35, col - 0.26, 2.8);
      /* Hint */
      s.addText(c.hint, {
        x: x + 0.18, y: cardY + 4.1, w: col - 0.26, h: 0.45,
        align: 'left', valign: 'bottom',
        fontSize: 8.5, italic: true,
        color: C.grayMd, fontFace: 'Arial',
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
    addBadge(s, '5');
    addNavTabs(s, 4);
    addSectionTitle(s, 'БҮТЭЭЛЧ САНАА', 'Big Idea — Санахуйц гол санаа');

    addCard(s, 0.7, 2.0, W - 1.0, 4.8);

    /* Left column */
    addCardLabel(s, 'БИГ АЙДИА', 1.1, 2.35, 7.5);
    addCardText(s, creativity.big_idea, 1.1, 2.82, 7.5, 1.8, { fontSize: 14, bold: true });

    addCardLabel(s, 'TAGLINE', 1.1, 4.75, 7.5);
    addCardText(s, creativity.tagline, 1.1, 5.22, 7.5, 0.65, { fontSize: 16, italic: true, color: C.coral });

    /* Right column — executions */
    const execX = 9.0;
    addCardLabel(s, 'ГҮЙЦЭТГЭЛ', execX, 2.35, W - execX - 0.4);
    creativity.executions.slice(0, 4).forEach((ex, i) => {
      const y = 2.82 + i * 0.9;
      s.addText(`${ex.content_type || '—'}`, {
        x: execX, y, w: W - execX - 0.4, h: 0.3,
        align: 'left', valign: 'top',
        fontSize: 9, bold: true,
        color: C.coral, fontFace: 'Arial',
      });
      s.addText(ex.description || '—', {
        x: execX, y: y + 0.28, w: W - execX - 0.4, h: 0.5,
        align: 'left', valign: 'top',
        fontSize: 9, color: C.dark,
        fontFace: 'Arial', wrap: true,
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SLIDE 7 — Pricing
  ────────────────────────────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    addBg(s);
    addBadge(s, '6');
    addNavTabs(s, 5);
    addSectionTitle(s, 'ҮНИЙН САНАЛ', 'Pricing — Автомат тооцоолол');

    addCard(s, 0.7, 2.0, W - 1.0, 4.8);

    /* Table header */
    const cols = [
      { label: 'КОНТЕНТ ТӨРӨЛ', x: 1.1,  w: 4.0 },
      { label: 'НЭГЖийн ҮНЭ',  x: 5.2,  w: 2.4 },
      { label: 'ТОО',           x: 7.7,  w: 1.0 },
      { label: 'НИЙТ',          x: 8.8,  w: 2.5 },
    ];

    cols.forEach(c => {
      s.addShape('rect' as PptxGenJS.ShapeType, {
        x: c.x, y: 2.35, w: c.w, h: 0.35,
        fill: { color: C.dark }, line: { color: C.dark, width: 0 },
      });
      s.addText(c.label, {
        x: c.x, y: 2.35, w: c.w, h: 0.35,
        align: 'left', valign: 'middle',
        fontSize: 8, bold: true,
        color: C.lblue, fontFace: 'Arial',
      });
    });

    /* Rows */
    const maxRows = Math.min(pricing.items.length, 6);
    pricing.items.slice(0, maxRows).forEach((item, i) => {
      const rowY = 2.78 + i * 0.42;
      const lineTotal = item.unit_price * Math.max(0, item.quantity);
      const bg = i % 2 === 0 ? 'F5F7FA' : C.white;

      s.addShape('rect' as PptxGenJS.ShapeType, {
        x: 1.1, y: rowY, w: W - 1.8, h: 0.38,
        fill: { color: bg }, line: { color: 'E4E9F2', width: 0.5 },
      });

      [
        { x: 1.1, w: 4.0, text: item.content_type || '—' },
        { x: 5.2, w: 2.4, text: fmt(item.unit_price) },
        { x: 7.7, w: 1.0, text: String(item.quantity) },
        { x: 8.8, w: 2.5, text: fmt(lineTotal), color: C.coral },
      ].forEach(cell => {
        s.addText(cell.text, {
          x: cell.x + 0.08, y: rowY, w: cell.w - 0.1, h: 0.38,
          align: 'left', valign: 'middle',
          fontSize: 10,
          color: (cell as { color?: string }).color || C.dark,
          fontFace: 'Arial',
        });
      });
    });

    /* Totals box */
    const totY = 2.78 + maxRows * 0.42 + 0.15;
    addCard(s, 8.0, totY, W - 8.4, H - totY - 0.35);

    const totLines = [
      { label: 'Нийт дүн',     value: fmt(totals.subtotal),         color: C.dark },
      { label: 'Хөнгөлөлт',   value: pricing.discount_pct > 0 ? `-${fmt(totals.discount_amount)}` : '—', color: 'CC0000' },
      { label: 'НӨАТ',         value: fmt(totals.vat_amount),       color: C.dark },
      { label: 'НИЙТ ТӨЛБӨР', value: fmt(totals.grand_total),      color: C.coral },
    ];

    totLines.forEach((t, i) => {
      const ty = totY + 0.1 + i * 0.42;
      const isGrand = i === totLines.length - 1;
      if (isGrand) {
        s.addShape('rect' as PptxGenJS.ShapeType, {
          x: 8.05, y: ty - 0.05, w: W - 8.45, h: 0.42,
          fill: { color: C.dark }, line: { color: C.dark, width: 0 },
        });
      }
      s.addText(t.label, {
        x: 8.15, y: ty, w: 2.4, h: 0.35,
        align: 'left', valign: 'middle',
        fontSize: isGrand ? 10 : 9,
        bold: isGrand,
        color: isGrand ? C.white : C.grayMd,
        fontFace: 'Arial',
      });
      s.addText(t.value, {
        x: 10.0, y: ty, w: W - 10.35, h: 0.35,
        align: 'right', valign: 'middle',
        fontSize: isGrand ? 12 : 9,
        bold: isGrand,
        color: isGrand ? C.white : t.color,
        fontFace: 'Arial',
      });
    });
  }

  /* ── Download ─────────────────────────────────────────────────────── */
  const fileName = `${header.brand_name || 'Proposal'}_${header.campaign_name || 'Draft'}.pptx`
    .replace(/[^a-zA-Z0-9А-Яа-яҮүӨөЭэ\s_-]/g, '')
    .replace(/\s+/g, '_');

  await pptx.writeFile({ fileName });
}

/* ── Helper: Cover label ─────────────────────────────────────────────── */
function slide1Label(s: PptxGenJS.Slide, x: number, y: number, w: number, text: string) {
  s.addShape('rect' as PptxGenJS.ShapeType, {
    x, y, w, h: 0.4,
    fill: { color: C.lblue }, line: { color: C.lblue, width: 0 },
  });
  s.addText(text, {
    x, y, w, h: 0.4,
    align: 'left', valign: 'middle',
    fontSize: 11, bold: true,
    color: C.dark, fontFace: 'Arial',
  });
}
