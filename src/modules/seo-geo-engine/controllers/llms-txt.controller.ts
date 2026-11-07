import type { GeoAiCitationService } from '../services/geo-ai-citation.service';

export class LlmsTxtController {
  constructor(private readonly citationService: GeoAiCitationService) {}

  async getLlmsTxt(): Promise<{ contentType: string; body: string }> {
    const body = await this.citationService.generateLlmsTxt();
    return {
      contentType: 'text/markdown; charset=utf-8',
      body,
    };
  }

  async getProductFactSheet(slug: string): Promise<{ status: number; contentType: string; body: string }> {
    const body = await this.citationService.generateProductFactSheet(slug);
    if (!body) {
      return {
        status: 404,
        contentType: 'text/plain; charset=utf-8',
        body: 'Ürün bulunamadı',
      };
    }
    return {
      status: 200,
      contentType: 'text/markdown; charset=utf-8',
      body,
    };
  }
}

