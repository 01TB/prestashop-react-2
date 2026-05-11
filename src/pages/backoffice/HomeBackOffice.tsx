import SidebarBackoffice from "../../components/UI/Navigation/backoffice/SidebarBackoffice.tsx";
import TopbarBackoffice from "../../components/UI/Navigation/backoffice/TopbarBackoffice.tsx";

import CardInfo from "../../components/UI/Cards/Info";
import PageHeading from "../../components/UI/Heading/PageHeading";
import TestCard from "../../components/UI/Cards/TestCard";

function HomeBackOffice() {
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
                        <CardInfo title="Earnings (Monthly)"
                        icon="calendar"
                        color="primary"
                        value="$40,000" />

                        <CardInfo title="Earnings (Annual)"
                        icon="calendar"
                        color="success"
                        value="215,000" />

                        <CardInfo title="Tasks"
                        icon="clipboard"
                        color="info"
                        value="50%" />

                        <CardInfo title="Pending Requests"
                        icon="comments"
                        color="warning"
                        value="18" />
                    </div>

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

export default HomeBackOffice;