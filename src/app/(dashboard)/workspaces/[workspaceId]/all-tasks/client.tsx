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
<TaskViewSwitcher hideProjectFilter={false} />
      </div>
    </>
  );
};
