import SidebarFrontoffice from "../components/UI/Navigation/frontoffice/SidebarFrontoffice.tsx";
import TopbarFrontoffice from "../components/UI/Navigation/frontoffice/TopbarFrontoffice.tsx";

import CardInfo from "../components/UI/Cards/Info";
import PageHeading from "../components/UI/Heading/PageHeading";
import TestCard from "../components/UI/Cards/TestCard";

function Home() {
    return (
        <div>
            {/* <!-- Page Wrapper --> */}
            <div id="wrapper">

                {/* <!-- SidebarFrontoffice --> */}
                <SidebarFrontoffice />
                {/* <!-- End of SidebarFrontoffice --> */}

                {/* <!-- Content Wrapper --> */}
                <div id="content-wrapper" className="d-flex flex-column">

                {/* <!-- Main Content --> */}
                <div id="content">

                    {/* <!-- TopbarFrontoffice --> */}
                    <TopbarFrontoffice />
                    {/* <!-- End of TopbarFrontoffice --> */}

                    {/* <!-- Begin Page Content --> */}
                    <div className="container-fluid">

                    {/* <!-- Page Heading --> */}

                    <PageHeading title="Home tsotra be" />

                    {/* <!-- Content Row --> */}
                    <div className="row">
                        <TestCard
                            title="Test Card"
                            description="Carte simple avec Bootstrap 5 (style SB Admin 2)."
                            buttonText="Tester"
                            onButtonClick={() => alert("Bouton cliqué !")}
                        />
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

export default Home;