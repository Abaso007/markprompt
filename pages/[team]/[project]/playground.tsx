import PlaygroundDashboard from '@/components/files/PlaygroundDashboard';
import { ProjectLayout } from '@/components/layouts/ProjectLayout';

const PlaygroundPage = () => {
  return (
    <ProjectLayout title="Playground" noHeading>
      <div className="fixed top-[calc(var(--app-navbar-height)+var(--app-tabbar-height))] bottom-0 left-0 right-0">
        <PlaygroundDashboard />
      </div>
    </ProjectLayout>
  );
};

export default PlaygroundPage;
