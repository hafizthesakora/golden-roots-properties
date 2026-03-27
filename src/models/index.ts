import mongoose, { Schema, model, models, type Document } from 'mongoose';

// ── Generic doc transform ──────────────────────────────────────────────────
export type MongoLean<T> = Omit<T, 'createdAt' | 'updatedAt'> & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
};

export function toDoc<T>(raw: MongoLean<T>): Omit<T, never> & { $id: string; $createdAt: string } {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, ...rest } = raw as MongoLean<T> & { __v?: number };
  return {
    ...rest,
    $id: _id.toString(),
    $createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : '',
  } as Omit<T, never> & { $id: string; $createdAt: string };
}

// ── User ─────────────────────────────────────────────────────────────────────
export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser & Document>(
  { name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, passwordHash: { type: String, required: true } },
  { timestamps: true }
);
export const User = models.User || model<IUser & Document>('User', UserSchema);

// ── Workspace ─────────────────────────────────────────────────────────────────
export interface IWorkspace {
  name: string;
  userId: string;
  imageUrl?: string;
  inviteCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkspaceSchema = new Schema<IWorkspace & Document>(
  { name: { type: String, required: true }, userId: { type: String, required: true }, imageUrl: String, inviteCode: { type: String, required: true } },
  { timestamps: true }
);
export const Workspace = models.Workspace || model<IWorkspace & Document>('Workspace', WorkspaceSchema);

// ── Member ────────────────────────────────────────────────────────────────────
export interface IMember {
  userId: string;
  workspaceId: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MemberSchema = new Schema<IMember & Document>(
  { userId: { type: String, required: true }, workspaceId: { type: String, required: true }, role: { type: String, required: true, default: 'MEMBER' } },
  { timestamps: true }
);
export const Member = models.Member || model<IMember & Document>('Member', MemberSchema);

// ── Project ────────────────────────────────────────────────────────────────────
export interface IProject {
  name: string;
  workspaceId: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject & Document>(
  { name: { type: String, required: true }, workspaceId: { type: String, required: true }, imageUrl: String },
  { timestamps: true }
);
export const Project = models.Project || model<IProject & Document>('Project', ProjectSchema);

// ── Task ──────────────────────────────────────────────────────────────────────
export interface ITask {
  name: string;
  status: string;
  workspaceId: string;
  projectId: string;
  assigneeId: string;
  dueDate?: string;
  position: number;
  description?: string;
  isRecurring?: boolean;
  recurringInterval?: string; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurringEndDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new Schema<ITask & Document>(
  {
    name: { type: String, required: true },
    status: { type: String, required: true },
    workspaceId: { type: String, required: true },
    projectId: { type: String, required: true },
    assigneeId: { type: String, required: true },
    dueDate: String,
    position: { type: Number, required: true, default: 1000 },
    description: String,
    isRecurring: { type: Boolean, default: false },
    recurringInterval: String,
    recurringEndDate: String,
  },
  { timestamps: true }
);
export const Task = models.Task || model<ITask & Document>('Task', TaskSchema);

// ── ContentPost ────────────────────────────────────────────────────────────────
export interface IContentPost {
  title: string;
  concept?: string;
  postType: string;
  platform?: string;
  status: string;
  scheduledDate: string;
  workspaceId: string;
  projectId?: string;
  tags?: string;
  festivity?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContentPostSchema = new Schema<IContentPost & Document>(
  {
    title: { type: String, required: true },
    concept: String,
    postType: { type: String, required: true },
    platform: String,
    status: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    workspaceId: { type: String, required: true },
    projectId: String,
    tags: String,
    festivity: String,
  },
  { timestamps: true }
);
export const ContentPost = models.ContentPost || model<IContentPost & Document>('ContentPost', ContentPostSchema);

// ── RepositoryFile ──────────────────────────────────────────────────────────
export interface IRepositoryFile {
  name: string;
  category: string;
  description?: string;
  workspaceId: string;
  projectId?: string;
  fileId: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RepositoryFileSchema = new Schema<IRepositoryFile & Document>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    workspaceId: { type: String, required: true },
    projectId: String,
    fileId: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
);
export const RepositoryFile = models.RepositoryFile || model<IRepositoryFile & Document>('RepositoryFile', RepositoryFileSchema);

// ── WorkspaceFileCategory ──────────────────────────────────────────────────────
export interface IWorkspaceFileCategory {
  name: string;
  label: string;
  icon: string;
  color: string;
  textColor: string;
  workspaceId: string;
  isDefault: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkspaceFileCategorySchema = new Schema<IWorkspaceFileCategory & Document>(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true, default: 'File' },
    color: { type: String, required: true, default: 'bg-neutral-100' },
    textColor: { type: String, required: true, default: 'text-neutral-600' },
    workspaceId: { type: String, required: true },
    isDefault: { type: Boolean, required: true, default: false },
    order: { type: Number, required: true, default: 100 },
  },
  { timestamps: true }
);
export const WorkspaceFileCategory = models.WorkspaceFileCategory || model<IWorkspaceFileCategory & Document>('WorkspaceFileCategory', WorkspaceFileCategorySchema);

// ── TaskComment ────────────────────────────────────────────────────────────────
export interface ITaskComment {
  taskId: string;
  workspaceId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskCommentSchema = new Schema<ITaskComment & Document>(
  {
    taskId: { type: String, required: true },
    workspaceId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);
export const TaskComment = models.TaskComment || model<ITaskComment & Document>('TaskComment', TaskCommentSchema);

// ── LeadNote ────────────────────────────────────────────────────────────────────
export interface ILeadNote {
  leadId: string;
  workspaceId: string;
  authorId: string;
  authorName: string;
  content: string;
  type: string; // 'note' | 'status_change'
  meta?: string; // JSON string e.g. {from, to}
  createdAt?: Date;
  updatedAt?: Date;
}

const LeadNoteSchema = new Schema<ILeadNote & Document>(
  {
    leadId: { type: String, required: true },
    workspaceId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true, default: 'note' },
    meta: String,
  },
  { timestamps: true }
);
export const LeadNote = models.LeadNote || model<ILeadNote & Document>('LeadNote', LeadNoteSchema);

// ── ActivityLog ─────────────────────────────────────────────────────────────────
export interface IActivityLog {
  workspaceId: string;
  userId: string;
  userName: string;
  action: string; // 'created' | 'updated' | 'deleted' | 'commented' | 'status_changed'
  entityType: string; // 'task' | 'lead' | 'project'
  entityId: string;
  entityName: string;
  details?: string; // JSON string
  createdAt?: Date;
  updatedAt?: Date;
}

const ActivityLogSchema = new Schema<IActivityLog & Document>(
  {
    workspaceId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    entityName: { type: String, required: true },
    details: String,
  },
  { timestamps: true }
);
export const ActivityLog = models.ActivityLog || model<IActivityLog & Document>('ActivityLog', ActivityLogSchema);

// ── Lead ──────────────────────────────────────────────────────────────────────
export interface ILead {
  name: string;
  email?: string;
  phone?: string;
  source: string;
  propertyInterest?: string;
  propertyType?: string;
  budget?: string;
  status: string;
  position: number;
  notes?: string;
  workspaceId: string;
  assigneeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LeadSchema = new Schema<ILead & Document>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    source: { type: String, required: true },
    propertyInterest: String,
    propertyType: String,
    budget: String,
    status: { type: String, required: true },
    position: { type: Number, required: true, default: 1000 },
    notes: String,
    workspaceId: { type: String, required: true },
    assigneeId: String,
  },
  { timestamps: true }
);
export const Lead = models.Lead || model<ILead & Document>('Lead', LeadSchema);
