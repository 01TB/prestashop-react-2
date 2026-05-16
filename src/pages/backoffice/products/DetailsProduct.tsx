import { useMemo } from 'react';
import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useProductDetails } from '../../../hooks/backoffice/products/useProductDetails';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
	map[preferred] ?? Object.values(map)[0] ?? '';

function DetailsProduct() {
	const {
		product,
		associatedCategories,
		defaultCategoryName,
		loading,
		error,
	} = useProductDetails();

	const badgeClass = product?.active ? 'badge badge-success' : 'badge badge-secondary';
	const productName = product ? getLangValue(product.name) : '';
	const stateLabel = product?.active ? 'Actif' : 'Inactif';

	const productFlags = useMemo(() => {
		if (!product) return [];
		return [
			{ label: 'Nouveau', value: product.new ? 'Oui' : 'Non' },
			{ label: 'En promotion', value: product.on_sale ? 'Oui' : 'Non' },
			{ label: 'En ligne uniquement', value: product.online_only ? 'Oui' : 'Non' },
			{ label: 'Disponible à la commande', value: product.available_for_order ? 'Oui' : 'Non' },
			{ label: 'Prix affiché', value: product.show_price ? 'Oui' : 'Non' },
			{ label: 'Indexé', value: product.indexed ? 'Oui' : 'Non' },
		];
	}, [product]);

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
							<PageHeading title={`Details produit${product ? ` #${product.id}` : ''}`} />

							{loading && (
								<div className="text-center py-4">Chargement...</div>
							)}

							{error && (
								<div className="alert alert-danger" role="alert">
									{error}
								</div>
							)}

							{!loading && !error && !product && (
								<div className="alert alert-warning" role="alert">
									Produit introuvable.
								</div>
							)}

							{!loading && !error && product && (
								<>
									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Informations produit</h6>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-sm">
													<tbody>
														<tr>
															<th>ID</th>
															<td>{product.id}</td>
														</tr>
														<tr>
															<th>Nom</th>
															<td>{productName}</td>
														</tr>
														<tr>
															<th>Reference</th>
															<td>{product.reference || '-'}</td>
														</tr>
														<tr>
															<th>Catégorie par défaut</th>
															<td>{defaultCategoryName}</td>
														</tr>
														<tr>
															<th>Date de mise à jour</th>
															<td>{product.date_upd}</td>
														</tr>
														<tr>
															<th>Etat</th>
															<td>
																<span className={badgeClass}>{stateLabel}</span>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Prix et stock</h6>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-sm">
													<tbody>
														<tr>
															<th>Prix HT</th>
															<td>{product.price.toFixed(2)} €</td>
														</tr>
														<tr>
															<th>Prix TTC</th>
															<td><strong>{product.price_ttc.toFixed(2)} €</strong></td>
														</tr>
														<tr>
															<th>Stock</th>
															<td>{product.quantity}</td>
														</tr>
														<tr>
															<th>Quantite minimale</th>
															<td>{product.minimal_quantity}</td>
														</tr>
														<tr>
															<th>Taxes</th>
															<td>Groupe #{product.id_tax_rules_group}</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Flags</h6>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-bordered table-hover" width="100%" cellSpacing="0">
													<thead>
														<tr>
															<th>Label</th>
															<th>Valeur</th>
														</tr>
													</thead>
													<tbody>
														{productFlags.map(flag => (
															<tr key={flag.label}>
																<td>{flag.label}</td>
																<td>{flag.value}</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Associations</h6>
										</div>
										<div className="card-body">
											<div className="mb-3">
												<strong>Categories associees</strong>
												{associatedCategories.length === 0 ? (
													<div className="text-muted">Aucune categorie associee.</div>
												) : (
													<ul className="mb-0">
														{associatedCategories.map(category => (
															<li key={category.id}>{category.name}</li>
														))}
													</ul>
												)}
											</div>

											<div>
												<strong>Nombre d'images</strong>
												<div>{product.images.length}</div>
											</div>
										</div>
									</div>
								</>
							)}
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

export default DetailsProduct;