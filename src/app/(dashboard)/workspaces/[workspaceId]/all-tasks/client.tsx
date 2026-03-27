'use client';

import { TaskViewSwitcher } from '@/features/tasks/components/task-view-switcher';
import { CreateTaskModal } from '@/features/tasks/components/create-task-modal';
import { EditTaskModal } from '@/features/tasks/components/edit-task-modal';

export const AllTasksClient = () => {
  return (
    <>
      <CreateTaskModal />
      <EditTaskModal />
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">All Tasks</h2>
          <p className="text-sm text-neutral-500">View and manage every task across all projects in this workspace</p>
        </div>
        <TaskViewSwitcher hideProjectFilter={false} />
      </div>
    </>
  );
};
