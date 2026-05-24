import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { SocialPublisher, PublishResult } from './publisher.interface.js';

export class FacebookPublisher implements SocialPublisher {
  platform = 'facebook' as const;

  isConfigured(): boolean {
    return !!(process.env.FB_PAGE_ID && process.env.FB_PAGE_ACCESS_TOKEN);
  }

  async publish(imagePath: string, caption: string): Promise<PublishResult> {
    if (!this.isConfigured()) return { success: false, error: 'Facebook Publisher not configured' };

    try {
      const pageId = process.env.FB_PAGE_ID!;
      const token = process.env.FB_PAGE_ACCESS_TOKEN!;
      const url = `https://graph.facebook.com/v22.0/${pageId}/photos`;

      const form = new FormData();
      form.append('source', fs.createReadStream(imagePath));
      form.append('message', caption);
      form.append('access_token', token);

      const response = await axios.post(url, form, {
        headers: form.getHeaders(),
      });

      return {
        success: true,
        postId: response.data.id,
        postUrl: `https://facebook.com/${response.data.post_id || response.data.id}`,
      };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.error?.message || err.message 
      };
    }
  }
}
