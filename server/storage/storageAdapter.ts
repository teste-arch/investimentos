import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StockData, ApiUsageStats } from '../providers/types';
import { defaultWatchlist } from '../config/defaultWatchlist';
import { MarketParameters } from './cacheManager';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STOCKS_FILE = path.join(DATA_DIR, 'stocks.json');
const STATS_FILE = path.join(DATA_DIR, 'api_usage.json');
const PARAMS_FILE = path.join(DATA_DIR, 'params.json');

export interface StorageAdapter {
  type: 'supabase' | 'local';
  loadStocks(): Promise<StockData[]>;
  saveStocks(stocks: StockData[]): Promise<void>;
  loadStats(): Promise<ApiUsageStats | null>;
  saveStats(stats: ApiUsageStats): Promise<void>;
  loadParams(): Promise<MarketParameters | null>;
  saveParams(params: MarketParameters): Promise<void>;
}

/**
 * 1. Adaptador Supabase (PostgreSQL via REST - 100% Serverless)
 * Utiliza as variáveis nativas da integração da Vercel:
 * - URL: SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL
 * - Chave Secreta: SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY (bypassa RLS no servidor)
 */
class SupabaseStorageAdapter implements StorageAdapter {
  public type: 'supabase' = 'supabase';
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async loadStocks(): Promise<StockData[]> {
    try {
      const { data, error } = await this.client
        .from('screener_kv')
        .select('value')
        .eq('key', 'stocks')
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseStorage] Aviso ao buscar stocks:', error.message);
        return defaultWatchlist;
      }

      if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
        return data.value;
      }
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao carregar stocks:', e);
    }
    return defaultWatchlist;
  }

  async saveStocks(stocks: StockData[]): Promise<void> {
    try {
      const { error } = await this.client
        .from('screener_kv')
        .upsert(
          { key: 'stocks', value: stocks, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('[SupabaseStorage] Erro ao salvar stocks:', error.message);
      }
    } catch (e) {
      console.error('[SupabaseStorage] Exceção ao salvar stocks:', e);
    }
  }

  async loadStats(): Promise<ApiUsageStats | null> {
    try {
      const { data, error } = await this.client
        .from('screener_kv')
        .select('value')
        .eq('key', 'stats')
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseStorage] Aviso ao buscar stats:', error.message);
        return null;
      }

      if (data?.value) return data.value;
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao carregar stats:', e);
    }
    return null;
  }

  async saveStats(stats: ApiUsageStats): Promise<void> {
    try {
      const { error } = await this.client
        .from('screener_kv')
        .upsert(
          { key: 'stats', value: stats, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('[SupabaseStorage] Erro ao salvar stats:', error.message);
      }
    } catch (e) {
      console.error('[SupabaseStorage] Exceção ao salvar stats:', e);
    }
  }

  async loadParams(): Promise<MarketParameters | null> {
    try {
      const { data, error } = await this.client
        .from('screener_kv')
        .select('value')
        .eq('key', 'params')
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseStorage] Aviso ao buscar params:', error.message);
        return null;
      }

      if (data?.value) return data.value;
    } catch (e) {
      console.error('[SupabaseStorage] Erro ao carregar params:', e);
    }
    return null;
  }

  async saveParams(params: MarketParameters): Promise<void> {
    try {
      const { error } = await this.client
        .from('screener_kv')
        .upsert(
          { key: 'params', value: params, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('[SupabaseStorage] Erro ao salvar params:', error.message);
      }
    } catch (e) {
      console.error('[SupabaseStorage] Exceção ao salvar params:', e);
    }
  }
}

/**
 * 2. Adaptador Local com Fallback em Memória (seguro para Vercel se o Supabase ainda não estiver conectado)
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
 * Fábrica do Adaptador de Armazenamento
 * Prioriza o Supabase com as variáveis injetadas automaticamente pela integração da Vercel:
 * 1. URL: SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL
 * 2. Chave: SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY (bypassa RLS) ou SUPABASE_ANON_KEY
 */
export function createStorageAdapter(): StorageAdapter {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log('[StorageAdapter] Utilizando Supabase como armazenamento externo.');
    return new SupabaseStorageAdapter(supabaseUrl, supabaseKey);
  }

  console.log('[StorageAdapter] Utilizando Adaptador Local / Memória (Fallback).');
  return new LocalOrMemoryStorageAdapter();
}
