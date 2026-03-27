export type FileCategory = {
  $id: string;
  $createdAt: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  textColor: string;
  workspaceId: string;
  isDefault: boolean;
  order: number;
};

export type RepositoryFile = {
  $id: string;
  $createdAt: string;
  name: string;
  fileId: string;
  mimeType: string;
  size: number;
  category: string;
  description?: string;
  workspaceId: string;
  projectId?: string;
  uploadedBy: string;
};
