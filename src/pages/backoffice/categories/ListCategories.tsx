import SidebarBackoffice from "../../../components/UI/Navigation/backoffice/SidebarBackoffice";
import TopbarBackoffice from "../../../components/UI/Navigation/backoffice/TopbarBackoffice";
import PageHeading from "../../../components/UI/Heading/PageHeading";
import { useCategoriesList } from "../../../hooks/backoffice/categories/useCategoriesList";

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
	map[preferred] ?? Object.values(map)[0] ?? '';

function ListCategories() {
	const {
		data,
		loading,
		error,
	} = useCategoriesList();

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
							<PageHeading title="Liste des catégories" />

							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">Catégories de produits</h6>
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
														<th>Parent</th>
														<th>Actif</th>
														<th>Niveau</th>
														<th>Produits</th>
														<th>Rewrite</th>
														<th>Mis à jour</th>
													</tr>
												</thead>
												<tbody>
													{data.map(category => (
														<tr key={category.id}>
															<td>{category.id}</td>
															<td>{getLangValue(category.name)}</td>
															<td>{category.id_parent ?? '-'}</td>
															<td>
																<span className={category.active ? 'badge badge-success' : 'badge badge-secondary'}>
																	{category.active ? 'Oui' : 'Non'}
																</span>
															</td>
															<td>{category.level_depth ?? '-'}</td>
															<td>{category.nb_products_recursive ?? 0}</td>
															<td>{getLangValue(category.link_rewrite)}</td>
															<td>{category.date_upd ?? '-'}</td>
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

export default ListCategories;