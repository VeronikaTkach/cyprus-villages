import { PublicSidebar } from '@/widgets/public-sidebar';

interface IPublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: IPublicLayoutProps) {
  return (
    <div className="cv-shell">
      <PublicSidebar />
      <div className="cv-body">
        <main className="cv-main">{children}</main>
      </div>
    </div>
  );
}
