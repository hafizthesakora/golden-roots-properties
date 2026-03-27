export enum ContentPostType {
  FLYER = 'FLYER',
  VIDEO = 'VIDEO',
  REEL = 'REEL',
  STORY = 'STORY',
  CAROUSEL = 'CAROUSEL',
  GRAPHIC = 'GRAPHIC',
  OTHER = 'OTHER',
}

export enum ContentPostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export enum ContentPlatform {
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TIKTOK = 'TIKTOK',
  LINKEDIN = 'LINKEDIN',
  ALL = 'ALL',
}

export type ContentPost = {
  $id: string;
  $createdAt: string;
  title: string;
  concept?: string;
  postType: ContentPostType;
  platform?: ContentPlatform;
  status: ContentPostStatus;
  scheduledDate: string;
  workspaceId: string;
  projectId?: string;
  tags?: string;
  festivity?: string;
};
