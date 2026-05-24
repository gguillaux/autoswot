import axios from 'axios';
import fs from 'fs';
import { SocialPublisher, PublishResult } from './publisher.interface.js';

export class LinkedinPublisher implements SocialPublisher {
  platform = 'linkedin' as const;

  isConfigured(): boolean {
    return !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_ID);
  }

  async publish(imagePath: string, caption: string): Promise<PublishResult> {
    if (!this.isConfigured()) return { success: false, error: 'LinkedIn Publisher not configured' };

    try {
      const token = process.env.LINKEDIN_ACCESS_TOKEN!;
      const personId = process.env.LINKEDIN_PERSON_ID!;
      const authorUrn = `urn:li:person:${personId}`;
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Linkedin-Version': '202505'
      };

      // 1. Register Upload
      const initRes = await axios.post('https://api.linkedin.com/rest/images?action=initializeUpload', {
        initializeUploadRequest: { owner: authorUrn }
      }, { headers });

      const uploadUrl = initRes.data.value.uploadUrl;
      const imageUrn = initRes.data.value.image;

      // 2. Upload Binary
      const imageBuffer = fs.readFileSync(imagePath);
      await axios.put(uploadUrl, imageBuffer, {
        headers: { 'Content-Type': 'application/octet-stream' }
      });

      // 3. Create Post
      const postRes = await axios.post('https://api.linkedin.com/rest/posts', {
        author: authorUrn,
        commentary: caption,
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED' },
        content: {
          media: {
            title: 'AutoSWOT Infographic',
            id: imageUrn
          }
        },
        lifecycleState: 'PUBLISHED'
      }, { headers });

      return {
        success: true,
        postId: postRes.headers['x-restli-id'] || 'unknown',
      };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.message 
      };
    }
  }
}
