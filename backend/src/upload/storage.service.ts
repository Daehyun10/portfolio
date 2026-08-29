import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: SupabaseClient | null = null;

  private get bucket() {
    return process.env.SUPABASE_BUCKET ?? 'portfolio';
  }

  /// 서버리스 콜드스타트마다 새로 만들지 않도록 인스턴스에 캐시해 둔다.
  private getClient(): SupabaseClient {
    if (this.client) return this.client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.');
    }

    this.client = createClient(url, key, { auth: { persistSession: false } });
    return this.client;
  }

  async upload(path: string, body: Buffer, contentType: string): Promise<string> {
    const storage = this.getClient().storage.from(this.bucket);

    const { error } = await storage.upload(path, body, { contentType, upsert: false });
    if (error) {
      this.logger.error(`업로드 실패: ${error.message}`);
      throw new Error(error.message);
    }

    return storage.getPublicUrl(path).data.publicUrl;
  }
}
