import type { ReactNode } from 'react';
import SidebarFrontoffice from './SidebarFrontoffice';
import TopbarFrontoffice from './TopbarFrontoffice';
import PageHeading from '../../Heading/PageHeading';

interface FrontofficeLayoutProps {
  title: string;
  children: ReactNode;
}

function FrontofficeLayout({ title, children }: FrontofficeLayoutProps) {
  return (
    <div>
      <div id="wrapper">
        <SidebarFrontoffice />

        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopbarFrontoffice />

            <div className="container-fluid">
              <PageHeading title={title} />
              {children}
            </div>
          </div>

          <footer className="sticky-footer bg-white">
            <div className="container my-auto">
              <div className="copyright text-center my-auto">
                <span>Copyright &copy; Your Website 2019</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>
    </div>
  );
}

export default FrontofficeLayout;
