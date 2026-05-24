import fs from 'fs';
import path from 'path';

export interface SocialCredentials {
  x?: {
    accessToken?: string;
    accessSecret?: string;
  };
  linkedin?: {
    accessToken?: string;
    personId?: string;
  };
  facebook?: {
    pageId?: string;
    accessToken?: string;
  };
  tiktok?: {
    accessToken?: string;
  };
  gemini?: {
    apiKey?: string;
  };
}

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = path.resolve(process.cwd(), 'credentials.json');
    if (!fs.existsSync(this.configPath)) {
      this.write({});
    }
  }

  read(): SocialCredentials {
    try {
      const data = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to read credentials:', err);
      return {};
    }
  }

  write(credentials: SocialCredentials): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(credentials, null, 2));
    } catch (err) {
      console.error('Failed to write credentials:', err);
    }
  }

  update(platform: keyof SocialCredentials, data: any): void {
    const creds = this.read();
    creds[platform] = { ...creds[platform], ...data };
    this.write(creds);
  }

  clear(platform: keyof SocialCredentials): void {
    const creds = this.read();
    delete creds[platform];
    this.write(creds);
  }
}

export const configService = new ConfigService();
