import { Link } from 'react-router-dom';
import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useCartsList } from '../../../hooks/backoffice/carts/useCartsList';

function ListCarts() {
	const {
		data,
		loading,
		error,
	} = useCartsList();

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
						<div className="container-fluid">
							<PageHeading title="Liste des paniers" />

							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">Paniers</h6>
								</div>
								<div className="card-body">
									{loading && (
										<div className="text-center py-4">Chargement...</div>
									)}

									{error && (
										<div className="alert alert-danger" role="alert">
											{error}
										</div>
									)}

									{!loading && !error && (
										<div className="table-responsive">
											<table className="table table-bordered table-hover" width="100%" cellSpacing="0">
												<thead>
													<tr>
														<th>ID</th>
														<th>Client</th>
														<th>Livraison</th>
														<th>Facturation</th>
														<th>Lignes</th>
														<th>Date</th>
														<th>Mise a jour</th>
														<th>Details</th>
													</tr>
												</thead>
												<tbody>
													{data.map(item => (
														<tr key={item.cart.id}>
															<td>{item.cart.id}</td>
															<td>{item.cart.id_customer ?? item.cart.id_guest ?? '-'}</td>
															<td>{item.cart.id_address_delivery ?? '-'}</td>
															<td>{item.cart.id_address_invoice ?? '-'}</td>
															<td>{item.rowCount}</td>
															<td>{item.cart.date_add}</td>
															<td>{item.cart.date_upd}</td>
															<td>
																<Link className="btn btn-sm btn-primary" to={`/backoffice/paniers/${item.cart.id}`}>
																	Voir
																</Link>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
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
}

export default ListCarts;