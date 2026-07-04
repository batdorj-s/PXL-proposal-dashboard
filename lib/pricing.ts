import { PricingBlock } from '@/types';

export function calcPricing(pricing: PricingBlock) {
  const subtotal = pricing.items
    .filter((it) => it.quantity > 0 && it.unit_price > 0)
    .reduce((sum, it) => sum + it.unit_price * it.quantity, 0);

  const discount_amount = subtotal * (pricing.discount_pct / 100);
  const total_before_vat = subtotal - discount_amount;
  const vat_amount = total_before_vat * (pricing.vat_pct / 100);
  const grand_total = total_before_vat + vat_amount;

  return { subtotal, discount_amount, total_before_vat, vat_amount, grand_total };
}

export function fmt(n: number) {
  return '₮' + Math.round(n).toLocaleString('mn-MN');
}
