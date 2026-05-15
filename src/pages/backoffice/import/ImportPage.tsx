import SidebarBackoffice from "../../../components/UI/Navigation/backoffice/SidebarBackoffice.tsx";
import TopbarBackoffice from "../../../components/UI/Navigation/backoffice/TopbarBackoffice.tsx";

import PageHeading from "../../../components/UI/Heading/PageHeading";
import {ImportForm} from "../../../components/UI/Forms/backoffice/import/ImportForm.tsx";

function ImportPage() {
    return (
        <div>
            {/* <!-- Page Wrapper --> */}
            <div id="wrapper">

                {/* <!-- SidebarBackoffice --> */}
                <SidebarBackoffice />
                {/* <!-- End of SidebarBackoffice --> */}

                {/* <!-- Content Wrapper --> */}
                <div id="content-wrapper" className="d-flex flex-column">

                    {/* <!-- Main Content --> */}
                    <div id="content">

                        {/* <!-- TopbarBackoffice --> */}
                        <TopbarBackoffice />
                        {/* <!-- End of TopbarBackoffice --> */}

                        {/* <!-- Begin Page Content --> */}
                        <div className="container-fluid">

                            {/* <!-- Page Heading --> */}

                            <PageHeading title="Home Back Office" />

                            {/* <!-- Content Row --> */}
                            <div className="row">
                                <ImportForm />
                            </div>

                        </div>
                        {/* <!-- /.container-fluid --> */}

                    </div>
                    {/* <!-- End of Main Content --> */}
                    {/* <!-- Footer --> */}
                    <footer className="sticky-footer bg-white">
                        <div className="container my-auto">
                            <div className="copyright text-center my-auto">
                                <span>Copyright &copy; Your Website 2019</span>
                            </div>
                        </div>
                    </footer>
                    {/* <!-- End of Footer --> */}

                </div>
                {/* <!-- End of Content Wrapper --> */}

            </div>
            {/* <!-- End of Page Wrapper --> */}

            {/* <!-- Scroll to Top Button--> */}
            <a className="scroll-to-top rounded" href="#page-top">
                <i className="fas fa-angle-up"></i>
            </a>
        </div>
    );
}

export default ImportPage;