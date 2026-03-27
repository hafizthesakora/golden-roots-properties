import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { AnimatedPage } from '@/components/animated-page';
import { CreateProjectModal } from '@/features/projects/components/create-project-modal';
import { CreateTaskModal } from '@/features/tasks/components/create-task-modal';
import { EditTaskModal } from '@/features/tasks/components/edit-task-modal';
import { CreateWorkspaceModal } from '@/features/workspaces/components/create-workspace-modal';
import { CreateContentModal } from '@/features/content/components/create-content-modal';
import { EditContentModal } from '@/features/content/components/edit-content-modal';
import { UploadFileModal } from '@/features/repository/components/upload-file-modal';
import { CreateLeadModal } from '@/features/leads/components/create-lead-modal';
import { EditLeadModal } from '@/features/leads/components/edit-lead-modal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
      <CreateContentModal />
      <EditContentModal />
      <UploadFileModal />
      <CreateLeadModal />
      <EditLeadModal />
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
          <Sidebar />
        </div>
        <div className="lg:pl-[264px] w-full">
          <div className="mx-auto max-w-screen-2xl h-full">
            <Navbar />
            <main className="h-full py-4 px-3 md:py-8 md:px-6 flex flex-col">
              <AnimatedPage>{children}</AnimatedPage>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
