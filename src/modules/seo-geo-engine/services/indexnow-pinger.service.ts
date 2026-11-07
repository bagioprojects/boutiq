export class IndexNowPingerService {
  private readonly host: string;
  private readonly key: string;
  private readonly keyLocation?: string;

  constructor(host = 'fkbutik.com', key = 'indexnow-key-fkbutik', keyLocation?: string) {
    this.host = host;
    this.key = key;
    this.keyLocation = keyLocation;
  }

  async pingUrls(urls: string[]): Promise<boolean> {
    if (urls.length === 0) return true;

    const payload = {
      host: this.host,
      key: this.key,
      keyLocation: this.keyLocation,
      urlList: urls,
    };

    try {
      // Bing / Yandex IndexNow API endpoint
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

