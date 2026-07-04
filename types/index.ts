export type CoreDriver =
  | 'статус'
  | 'аюулгүй байдал'
  | 'харьяалал'
  | 'тав тух'
  | 'өөрийгөө илэрхийлэх'
  | '';

export type ContentType =
  | 'Рийлс'
  | 'Постер'
  | 'Видео'
  | 'Сошиал пост'
  | 'Эвент'
  | 'KOL'
  | 'PR'
  | '';

export interface HeaderBlock {
  brand_name: string;
  campaign_name: string;
  prepared_by: string;
  date: string;
}

export interface BackgroundBlock {
  context: string;
  key_challenge: string;
  supporting_data: string;
}

export interface PersonaBlock {
  believes: string;
  fears: string;
  tension: string;
  daily_life: string;
  core_driver: CoreDriver;
}

export interface InsightBlock {
  insight: string;
}

export interface StrategyBlock {
  key_message: string;
  channels: string;
  approach: string;
}

export interface Execution {
  id: string;
  content_type: ContentType;
  description: string;
  sample: string;
}

export interface CreativityBlock {
  big_idea: string;
  tagline: string;
  executions: Execution[];
}

export interface LineItem {
  id: string;
  content_type: ContentType;
  unit_price: number;
  quantity: number;
}

export interface PricingBlock {
  items: LineItem[];
  discount_pct: number;
  vat_pct: number;
}

export interface Proposal {
  id: string;
  header: HeaderBlock;
  background: BackgroundBlock;
  persona: PersonaBlock;
  insight: InsightBlock;
  strategy: StrategyBlock;
  creativity: CreativityBlock;
  pricing: PricingBlock;
  updatedAt: string;
}

export const RATE_CARD: Record<ContentType, number> = {
  Рийлс: 2_000_000,
  Постер: 500_000,
  Видео: 5_000_000,
  'Сошиал пост': 300_000,
  Эвент: 0,
  KOL: 0,
  PR: 0,
  '': 0,
};

export const CONTENT_TYPES: ContentType[] = [
  'Рийлс',
  'Постер',
  'Видео',
  'Сошиал пост',
  'Эвент',
  'KOL',
  'PR',
];

export const CORE_DRIVERS: CoreDriver[] = [
  'статус',
  'аюулгүй байдал',
  'харьяалал',
  'тав тух',
  'өөрийгөө илэрхийлэх',
];

export function emptyProposal(): Proposal {
  return {
    id: crypto.randomUUID(),
    header: { brand_name: '', campaign_name: '', prepared_by: '', date: '' },
    background: { context: '', key_challenge: '', supporting_data: '' },
    persona: { believes: '', fears: '', tension: '', daily_life: '', core_driver: '' },
    insight: { insight: '' },
    strategy: { key_message: '', channels: '', approach: '' },
    creativity: { big_idea: '', tagline: '', executions: [] },
    pricing: { items: [], discount_pct: 0, vat_pct: 10 },
    updatedAt: new Date().toISOString(),
  };
}
