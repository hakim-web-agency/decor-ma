export type PricingSettings = {
  singleFace: number;
  doubleFace: number;
  shippingCost: number;
};

export const DEFAULT_PRICING: PricingSettings = {
  singleFace: 80,
  doubleFace: 90,
  shippingCost: 50,
};
