import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as ws from 'ws';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private config: ConfigService) {
    this.client = createClient(
      config.get<string>('SUPABASE_URL'),
      config.get<string>('SUPABASE_SERVICE_KEY'),
      {
        realtime: {
          transport: ws as any,
        },
      },
    );
  }

  get db(): SupabaseClient {
    return this.client;
  }
}
