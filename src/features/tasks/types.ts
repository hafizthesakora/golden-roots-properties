export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export type Task = {
  $id: string;
  $createdAt: string;
  name: string;
  status: TaskStatus;
  workspaceId: string;
  projectId: string;
  dueDate: string;
  position: number;
  assigneeId: string;
  description?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  recurringEndDate?: string;
  // Populated fields (optional, returned by GET endpoints)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignee?: any;
};
