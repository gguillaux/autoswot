export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface SocialPublisher {
  platform: 'x' | 'tiktok' | 'facebook' | 'linkedin';
  publish(imagePath: string, caption: string): Promise<PublishResult>;
  isConfigured(): boolean;
}
