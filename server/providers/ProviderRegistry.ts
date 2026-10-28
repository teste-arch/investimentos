import { StockDataProvider, MarketType } from './types';
import { BrapiProvider } from './BrapiProvider';
import { FmpProvider } from './FmpProvider';

export class ProviderRegistry {
  private providers: Map<string, StockDataProvider> = new Map();
  private activeB3ProviderId: string = 'brapi';
  private activeUSProviderId: string = 'fmp';

  constructor() {
    this.registerProvider(new BrapiProvider());
    this.registerProvider(new FmpProvider());
  }

  public registerProvider(provider: StockDataProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): StockDataProvider | undefined {
    return this.providers.get(id);
  }

  public getActiveProvider(market: MarketType): StockDataProvider | undefined {
    if (market === 'B3') {
      return this.providers.get(this.activeB3ProviderId);
    }
    return this.providers.get(this.activeUSProviderId);
  }

  public setActiveProvider(market: MarketType, providerId: string): boolean {
    if (!this.providers.has(providerId)) return false;
    if (market === 'B3') {
      this.activeB3ProviderId = providerId;
    } else {
      this.activeUSProviderId = providerId;
    }
    return true;
  }

  public listProviders(): {
    id: string;
    name: string;
    market: MarketType;
    isConfigured: boolean;
    isActive: boolean;
  }[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      market: p.market,
      isConfigured: p.isConfigured(),
      isActive:
        (p.market === 'B3' && p.id === this.activeB3ProviderId) ||
        (p.market === 'US' && p.id === this.activeUSProviderId),
    }));
  }
}

export const providerRegistry = new ProviderRegistry();
