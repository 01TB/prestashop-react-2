import SidebarBackoffice from "../../components/UI/Navigation/backoffice/SidebarBackoffice";
import TopbarBackoffice from "../../components/UI/Navigation/backoffice/TopbarBackoffice";
import ResetDatabase from '../../components/UI/Cards/Danger/ResetDatabase';

function ResetPage(){
    return (
        <div>
            {/* <!-- Page Wrapper --> */}
            <div id="wrapper">

                {/* <!-- Sidebar --> */}
                <SidebarBackoffice />
                {/* <!-- End of Sidebar --> */}

                {/* <!-- Content Wrapper --> */}
                <div id="content-wrapper" className="d-flex flex-column">

                {/* <!-- Main Content --> */}
                <div id="content">

                    {/* <!-- Topbar --> */}
                    <TopbarBackoffice />
                    {/* <!-- End of Topbar --> */}

                    {/* <!-- Begin Page Content --> */}
                    <div className="container-fluid mt-4">
                        <h1 className="h3 mb-4 text-gray-800">Paramètres de réinitialisation</h1>
                        <p className="mb-4">
                            Cette page vous permet de gérer les actions destructrices sur la base de données 
                            de PrestaShop. Restez extrêmement prudent.
                        </p>

                        <div className="row">
                            <div className="col-lg-8">
                                <ResetDatabase />
                            </div>
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
};

export default ResetPage;