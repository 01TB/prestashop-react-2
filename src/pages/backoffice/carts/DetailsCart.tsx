import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useCartDetails } from '../../../hooks/backoffice/carts/useCartDetails';

function DetailsCart() {
	const { cartId } = useParams();
	const numericId = cartId ? Number(cartId) : NaN;
	const {
		cart,
		rows,
		totalItems,
		totalTtc,
		loading,
		error,
	} = useCartDetails(Number.isNaN(numericId) ? null : numericId);

	const summaryRows = useMemo(() => {
		if (!cart) return [];
		return [
			{ label: 'ID', value: cart.id },
			{ label: 'Client', value: cart.id_customer ?? cart.id_guest ?? '-' },
			{ label: 'Langue', value: cart.id_lang },
			{ label: 'Devise', value: cart.id_currency },
			{ label: 'Adresse livraison', value: cart.id_address_delivery ?? '-' },
			{ label: 'Adresse facturation', value: cart.id_address_invoice ?? '-' },
			{ label: 'Transporteur', value: cart.id_carrier ?? '-' },
			{ label: 'Date', value: cart.date_add },
			{ label: 'Mise a jour', value: cart.date_upd },
		];
	}, [cart]);

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
							<PageHeading title={`Details panier${cart ? ` #${cart.id}` : ''}`} />

							{loading && (
								<div className="text-center py-4">Chargement...</div>
							)}

							{error && (
								<div className="alert alert-danger" role="alert">
									{error}
								</div>
							)}

							{!loading && !error && !cart && (
								<div className="alert alert-warning" role="alert">
									Panier introuvable.
								</div>
							)}

							{!loading && !error && cart && (
								<>
									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Informations panier</h6>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-sm">
													<tbody>
														{summaryRows.map(row => (
															<tr key={row.label}>
																<th>{row.label}</th>
																<td>{row.value}</td>
															</tr>
														))}
														<tr>
															<th>Options livraison</th>
															<td>{cart.delivery_option || '-'}</td>
														</tr>
														<tr>
															<th>Code securise</th>
															<td>{cart.secure_key || '-'}</td>
														</tr>
														<tr>
															<th>Cadeau</th>
															<td>{cart.gift ? 'Oui' : 'Non'}</td>
														</tr>
														<tr>
															<th>Message cadeau</th>
															<td>{cart.gift_message || '-'}</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Lignes panier</h6>
										</div>
										<div className="card-body">
											{rows.length === 0 && (
												<div className="text-muted">Aucune ligne de panier.</div>
											)}
											{rows.length > 0 && (
												<div className="table-responsive">
													<table className="table table-bordered table-hover" width="100%" cellSpacing="0">
														<thead>
															<tr>
																<th>Produit</th>
																<th>Reference</th>
																<th>Quantite</th>
																<th>Prix TTC</th>
																<th>Total TTC</th>
															</tr>
														</thead>
														<tbody>
															{rows.map(row => (
																<tr key={row.id}>
																	<td>{row.name}</td>
																	<td>{row.reference}</td>
																	<td>{row.quantity}</td>
																	<td>{row.priceTtc.toFixed(2)} €</td>
																	<td>{row.lineTotalTtc.toFixed(2)} €</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											)}
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Synthese</h6>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-sm">
													<tbody>
														<tr>
															<th>Nombre de lignes</th>
															<td>{rows.length}</td>
														</tr>
														<tr>
															<th>Total articles</th>
															<td>{totalItems}</td>
														</tr>
														<tr>
															<th>Total TTC estime</th>
															<td><strong>{totalTtc.toFixed(2)} €</strong></td>
														</tr>
													</tbody>
											</table>
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

export default DetailsCart;