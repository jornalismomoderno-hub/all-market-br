
export type AppView = 'MARKETPLACE' | 'LANDING' | 'ADMIN';

export interface Product {
  id: string;
  name: string;
  niche: string;
  description: string;
  link: string;
  imageUrl: string;
  platform: string;
  affiliateLink?: string;
  totalCommission?: number;
  partnerCommission?: number;
}

export interface Lead {
  id: string;
  email: string;
  productId: string;
  productName: string;
  niche: string;
  consentedAt: string;
}

export interface ResearchResult {
  lastUpdated: string;
  items: Product[];
}

export interface AppSettings {
  globalAffiliatePrefix: string; // Ex: https://shopee.com.br/universal-link?aff_id=123&url=
  autoApplyPrefix: boolean;
}
