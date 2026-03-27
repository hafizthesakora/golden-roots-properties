export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export enum LeadSource {
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  REFERRAL = 'REFERRAL',
  WEBSITE = 'WEBSITE',
  WALK_IN = 'WALK_IN',
  COLD_CALL = 'COLD_CALL',
  EVENT = 'EVENT',
  OTHER = 'OTHER',
}

export enum PropertyType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  RENTAL = 'RENTAL',
}

export type Lead = {
  $id: string;
  $createdAt: string;
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  propertyInterest?: string;
  propertyType?: PropertyType;
  budget?: string;
  status: LeadStatus;
  position: number;
  notes?: string;
  workspaceId: string;
  assigneeId?: string;
};
