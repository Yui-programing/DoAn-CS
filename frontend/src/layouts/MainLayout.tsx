// MainLayout component - khung giao diện chính
interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="main-layout">
      {/* Header */}
      <header className="layout-header">{/* Header content */}</header>

      {/* Main content */}
      <main className="layout-content">{children}</main>

      {/* Footer */}
      <footer className="layout-footer">{/* Footer content */}</footer>
    </div>
  );
};

export default MainLayout;
