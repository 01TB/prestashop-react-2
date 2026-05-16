import { Link } from 'react-router-dom';
import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useProductsList } from '../../../hooks/backoffice/products/useProductsList';

function ListProducts() {
	const {
		data,
		loading,
		error,
	} = useProductsList();

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
							<PageHeading title="Liste des produits" />

							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">Produits</h6>
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
														<th>Nom</th>
														<th>Reference</th>
														<th>Categorie</th>
														<th>Stock</th>
														<th>Prix HT</th>
														<th>Prix TTC</th>
														<th>Etat</th>
														<th>Date</th>
														<th>Details</th>
													</tr>
												</thead>
												<tbody>
													{data.map(item => (
														<tr key={item.product.id}>
															<td>{item.product.id}</td>
															<td>{item.name}</td>
															<td>{item.product.reference || '-'}</td>
															<td>{item.categoryName}</td>
															<td>{item.product.quantity}</td>
															<td>{item.product.price.toFixed(2)} €</td>
															<td>{item.priceTtc.toFixed(2)} €</td>
															<td>
																<span className={item.product.active ? 'badge badge-success' : 'badge badge-secondary'}>
																	{item.product.active ? 'Actif' : 'Inactif'}
																</span>
															</td>
															<td>{item.product.date_upd}</td>
															<td>
																<Link className="btn btn-sm btn-primary" to={`/backoffice/produits/${item.product.id}`}>
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

export default ListProducts;