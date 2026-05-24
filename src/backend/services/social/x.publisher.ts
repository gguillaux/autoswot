import { TwitterApi } from 'twitter-api-v2';
import { SocialPublisher, PublishResult } from './publisher.interface.js';

export class XPublisher implements SocialPublisher {
  platform = 'x' as const;
  private client: TwitterApi | null = null;

  constructor() {
    if (this.isConfigured()) {
      this.client = new TwitterApi({
        appKey: process.env.X_APP_KEY!,
        appSecret: process.env.X_APP_SECRET!,
        accessToken: process.env.X_ACCESS_TOKEN!,
        accessSecret: process.env.X_ACCESS_SECRET!,
      });
    }
  }

  isConfigured(): boolean {
    return !!(
      process.env.X_APP_KEY &&
      process.env.X_APP_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_SECRET
    );
  }

  async publish(imagePath: string, caption: string): Promise<PublishResult> {
    if (!this.client) return { success: false, error: 'X Publisher not configured' };

    try {
      // 1. Upload media (v1.1)
      const mediaId = await this.client.v1.uploadMedia(imagePath);
      
      // 2. Tweet (v2)
      const tweet = await this.client.v2.tweet({
        text: caption,
        media: { media_ids: [mediaId] },
      });

      return {
        success: true,
        postId: tweet.data.id,
        postUrl: `https://x.com/user/status/${tweet.data.id}`,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
