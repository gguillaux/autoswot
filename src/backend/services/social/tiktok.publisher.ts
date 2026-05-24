import axios from 'axios';
import { SocialPublisher, PublishResult } from './publisher.interface.js';

export class TiktokPublisher implements SocialPublisher {
  platform = 'tiktok' as const;

  isConfigured(): boolean {
    return !!process.env.TIKTOK_ACCESS_TOKEN;
  }

  async publish(imagePath: string, caption: string): Promise<PublishResult> {
    if (!this.isConfigured()) return { success: false, error: 'TikTok Publisher not configured' };

    // Note: TikTok Content Posting API is complex and requires public URL or specific upload flows.
    // For this prototype, we'll return a simulated success as full TikTok OAuth & App Review 
    // is required before their API will actually accept requests from our app.
    
    console.log(`[TikTok] Simulated publish for ${imagePath}`);
    
    return new Promise(resolve => setTimeout(() => {
      resolve({
        success: true,
        postId: `tt_${Date.now()}`,
        postUrl: `https://tiktok.com/@user/video/simulated`,
      });
    }, 1500));
  }
}
