import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StockData, ApiUsageStats } from '../providers/types';
import { defaultWatchlist } from '../config/defaultWatchlist';
import { MarketParameters } from './cacheManager';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STOCKS_FILE = path.join(DATA_DIR, 'stocks.json');
const STATS_FILE = path.join(DATA_DIR, 'api_usage.json');
const PARAMS_FILE = path.join(DATA_DIR, 'params.json');

export interface StorageAdapter {
  type: 'redis' | 'supabase' | 'local';
  loadStocks(): Promise<StockData[]>;
  saveStocks(stocks: StockData[]): Promise<void>;
  loadStats(): Promise<ApiUsageStats | null>;
  saveStats(stats: ApiUsageStats): Promise<void>;
  loadParams(): Promise<MarketParameters | null>;
  saveParams(params: MarketParameters): Promise<void>;
}

/**
 * 1. Adaptador Upstash Redis (Vercel KV / Upstash - 100% Serverless via REST HTTP)
 */
class RedisStorageAdapter implements StorageAdapter {
  public type: 'redis' = 'redis';
  private redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  async loadStocks(): Promise<StockData[]> {
    try {
      const data = await this.redis.get<StockData[]>('screener:stocks');
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {
      console.error('[RedisStorage] Erro ao carregar screener:stocks:', e);
    }
    return defaultWatchlist;
  }

  async saveStocks(stocks: StockData[]): Promise<void> {
    try {
      await this.redis.set('screener:stocks', stocks);
    } catch (e) {
      console.error('[RedisStorage] Erro ao salvar screener:stocks:', e);
    }
  }

  async loadStats(): Promise<ApiUsageStats | null> {
    try {
      return await this.redis.get<ApiUsageStats>('screener:stats');
    } catch (e) {
      console.error('[RedisStorage] Erro ao carregar screener:stats:', e);
      return null;
    }
  }

  async saveStats(stats: ApiUsageStats): Promise<void> {
    try {
      await this.redis.set('screener:stats', stats);
    } catch (e) {
      console.error('[RedisStorage] Erro ao salvar screener:stats:', e);
    }
  }

  async loadParams(): Promise<MarketParameters | null> {
    try {
      return await this.redis.get<MarketParameters>('screener:params');
    } catch (e) {
      console.error('[RedisStorage] Erro ao carregar screener:params:', e);
      return null;
    }
  }

  async saveParams(params: MarketParameters): Promise<void> {
    try {
      await this.redis.set('screener:params', params);
    } catch (e) {
      console.error('[RedisStorage] Erro ao salvar screener:params:', e);
    }
  }
}

/**
 * 2. Adaptador Supabase (PostgreSQL via REST - 100% Serverless)
 */
class SupabaseStorageAdapter implements StorageAdapter {
  public type: 'supabase' = 'supabase';
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async loadStocks(): Promise<StockData[]> {
    try {
      const { data, error } = await this.client
        .from('screener_kv')
        .select('value')
        .eq('key', 'stocks')
        .single();

      if (!error && data?.value && Array.isArray(data.value)) {
        return data.value;
      }
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao carregar stocks:', e);
    }
    return defaultWatchlist;
  }

  async saveStocks(stocks: StockData[]): Promise<void> {
    try {
      await this.client
        .from('screener_kv')
        .upsert({ key: 'stocks', value: stocks, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao salvar stocks:', e);
    }
  }

  async loadStats(): Promise<ApiUsageStats | null> {
    try {
      const { data, error } = await this.client
        .from('screener_kv')
        .select('value')
        .eq('key', 'stats')
        .single();
      if (!error && data?.value) return data.value;
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao carregar stats:', e);
    }
    return null;
  }

  async saveStats(stats: ApiUsageStats): Promise<void> {
    try {
      await this.client
        .from('screener_kv')
        .upsert({ key: 'stats', value: stats, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao salvar stats:', e);
    }
  }

  async loadParams(): Promise<MarketParameters | null> {
    try {
      const { data, error } = await this.client
        .from('screener_kv')
        .select('value')
        .eq('key', 'params')
        .single();
      if (!error && data?.value) return data.value;
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao carregar params:', e);
    }
    return null;
  }

  async saveParams(params: MarketParameters): Promise<void> {
    try {
      await this.client
        .from('screener_kv')
        .upsert({ key: 'params', value: params, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao salvar params:', e);
    }
  }
}

/**
 * 3. Adaptador Local com Fallback em Memória (seguro para Vercel se nenhuma chave externa estiver setada)
 */
class LocalOrMemoryStorageAdapter implements StorageAdapter {
  public type: 'local' = 'local';
  private memoryStocks: StockData[] = [...defaultWatchlist];
  private memoryStats: ApiUsageStats = {
    brapiRequestsToday: 0,
    fmpRequestsToday: 0,
    brapiLimit: 150,
    fmpLimit: 250,
    lastResetDate: new Date().toISOString().split('T')[0],
  };
  private memoryParams: MarketParameters = {
    bazinRateB3: 6.0,
    bazinRateUS: 3.5,
    grahamMultiplier: 22.5,
    marginOfSafety: 20.0,
  };

  private canWriteDisk(): boolean {
    // Vercel serverless tem filesystem read-only (exceto /tmp que é efêmero)
    return !process.env.VERCEL;
  }

  async loadStocks(): Promise<StockData[]> {
    if (this.canWriteDisk()) {
      try {
        if (fs.existsSync(STOCKS_FILE)) {
          const raw = fs.readFileSync(STOCKS_FILE, 'utf-8');
          const parsed: StockData[] = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((s) => {
              if (s.isExampleData === undefined) s.isExampleData = true;
              if (!s.dataSource) s.dataSource = 'EXEMPLO';
            });
            this.memoryStocks = parsed;
            return parsed;
          }
        }
      } catch (e) {
        console.warn('[LocalStorage] Lendo fallback padrão:', e);
      }
    }
    return this.memoryStocks;
  }

  async saveStocks(stocks: StockData[]): Promise<void> {
    this.memoryStocks = stocks;
    if (this.canWriteDisk()) {
      try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(STOCKS_FILE, JSON.stringify(stocks, null, 2), 'utf-8');
      } catch (e) {
        console.warn('[LocalStorage] Erro ao gravar disco local:', e);
      }
    }
  }

  async loadStats(): Promise<ApiUsageStats | null> {
    if (this.canWriteDisk()) {
      try {
        if (fs.existsSync(STATS_FILE)) {
          const raw = fs.readFileSync(STATS_FILE, 'utf-8');
          return JSON.parse(raw);
        }
      } catch (e) {
        console.warn('[LocalStorage] Erro ao carregar stats:', e);
      }
    }
    return this.memoryStats;
  }

  async saveStats(stats: ApiUsageStats): Promise<void> {
    this.memoryStats = stats;
    if (this.canWriteDisk()) {
      try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
      } catch (e) {
        console.warn('[LocalStorage] Erro ao salvar stats:', e);
      }
    }
  }

  async loadParams(): Promise<MarketParameters | null> {
    if (this.canWriteDisk()) {
      try {
        if (fs.existsSync(PARAMS_FILE)) {
          const raw = fs.readFileSync(PARAMS_FILE, 'utf-8');
          return JSON.parse(raw);
        }
      } catch (e) {
        console.warn('[LocalStorage] Erro ao carregar params:', e);
      }
    }
    return this.memoryParams;
  }

  async saveParams(params: MarketParameters): Promise<void> {
    this.memoryParams = params;
    if (this.canWriteDisk()) {
      try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(PARAMS_FILE, JSON.stringify(params, null, 2), 'utf-8');
      } catch (e) {
        console.warn('[LocalStorage] Erro ao salvar params:', e);
      }
    }
  }
}

/**
 * Fábrica do Adaptador de Armazenamento Inteligente
 */
export function createStorageAdapter(): StorageAdapter {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    console.log('[StorageAdapter] Utilizando Upstash Redis como armazenamento externo.');
    return new RedisStorageAdapter(redisUrl, redisToken);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log('[StorageAdapter] Utilizando Supabase como armazenamento externo.');
    return new SupabaseStorageAdapter(supabaseUrl, supabaseKey);
  }

  console.log('[StorageAdapter] Utilizando Adaptador Local / Memória (Fallback).');
  return new LocalOrMemoryStorageAdapter();
}
