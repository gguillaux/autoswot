import { SocialPublisher } from './publisher.interface.js';
import { XPublisher } from './x.publisher.js';
import { FacebookPublisher } from './facebook.publisher.js';
import { LinkedinPublisher } from './linkedin.publisher.js';
import { TiktokPublisher } from './tiktok.publisher.js';

export class SocialPublisherFactory {
  createPublisher(platform: string): SocialPublisher | null {
    switch (platform.toLowerCase()) {
      case 'x':
        return new XPublisher();
      case 'facebook':
        return new FacebookPublisher();
      case 'linkedin':
        return new LinkedinPublisher();
      case 'tiktok':
        return new TiktokPublisher();
      default:
        return null;
    }
  }

  createAllPublishers(): Record<string, SocialPublisher> {
    return {
      x: new XPublisher(),
      facebook: new FacebookPublisher(),
      linkedin: new LinkedinPublisher(),
      tiktok: new TiktokPublisher(),
    };
  }
}

export const socialPublisherFactory = new SocialPublisherFactory();
