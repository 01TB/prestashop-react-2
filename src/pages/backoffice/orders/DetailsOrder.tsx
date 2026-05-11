import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import SidebarBackoffice from "../../../components/UI/Navigation/backoffice/SidebarBackoffice";
import TopbarBackoffice from "../../../components/UI/Navigation/backoffice/TopbarBackoffice";
import PageHeading from "../../../components/UI/Heading/PageHeading";
import { useOrderDetails } from "../../../hooks/backoffice/orders/useOrderDetails";

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
	map[preferred] ?? Object.values(map)[0] ?? '';

function DetailsOrder() {
	const { orderId } = useParams();
	const numericId = orderId ? Number(orderId) : NaN;
	const {
		order,
		histories,
		states,
		payments,
		invoices,
		customer,
		loading,
		error,
	} = useOrderDetails(Number.isNaN(numericId) ? null : numericId);

	const stateMap = useMemo(
		() => new Map(states.map(state => [state.id, state])),
		[states]
	);

	const sortedHistories = useMemo(
		() => [...histories].sort((a, b) => {
			if (a.date_add === b.date_add) return b.id - a.id;
			return a.date_add < b.date_add ? 1 : -1;
		}),
		[histories]
	);

	const currentState = order?.current_state ? stateMap.get(order.current_state) : undefined;
	const currentStateName = currentState ? getLangValue(currentState.name) : 'Inconnu';
	const currentStateColor = currentState?.color ?? '#858796';
	const customerDisplayName = customer
		? `${customer.firstname} ${customer.lastname}`.trim()
		: order?.id_customer && order.id_customer > 0
			? `Client #${order.id_customer}`
			: 'Invite';

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
							<PageHeading title={`Details commande${order ? ` #${order.id}` : ''}`} />

							{loading && (
								<div className="text-center py-4">Chargement...</div>
							)}

							{error && (
								<div className="alert alert-danger" role="alert">
									{error}
								</div>
							)}

							{!loading && !error && !order && (
								<div className="alert alert-warning" role="alert">
									Commande introuvable.
								</div>
							)}

							{!loading && !error && order && (
								<>
									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Informations commande</h6>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-sm">
													<tbody>
														<tr>
															<th>ID</th>
															<td>{order.id}</td>
														</tr>
														<tr>
															<th>Reference</th>
															<td>{order.reference}</td>
														</tr>
														<tr>
															<th>Date</th>
															<td>{order.date_add}</td>
														</tr>
														<tr>
															<th>Etat</th>
															<td>
																<span
																	className="badge"
																	style={{ backgroundColor: currentStateColor, color: '#fff' }}
																>
																	{currentStateName}
																</span>
															</td>
														</tr>
                                                        <tr>
															<th>Paiement</th>
															<td>{order.payment}</td>
														</tr>
														<tr>
															<th>Total Shipping HT</th>
															<td>{order.total_shipping_tax_excl.toFixed(2)} €</td>
														</tr>
														<tr>
															<th>Total Produits HT</th>
															<td>{order.total_products.toFixed(2)} €</td>
														</tr>
														<tr>
															<th>Total HT</th>
															<td>{order.total_paid_tax_excl.toFixed(2)} €</td>
														</tr>
														<tr>
															<th>Total TTC</th>
															<td>
                                                                <strong>{order.total_paid_tax_incl.toFixed(2)} €</strong>
                                                            </td>
														</tr>
														<tr>
															<th>Total Montant Payé</th>
															<td>
                                                                <strong>{order.total_paid_real.toFixed(2)} €</strong>
                                                            </td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Client</h6>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-sm">
													<tbody>
														<tr>
															<th>Client</th>
															<td>{customerDisplayName}</td>
														</tr>
														<tr>
															<th>Email</th>
															<td>{customer?.email ?? '-'}</td>
														</tr>
														<tr>
															<th>Newsletter</th>
															<td>{customer ? (customer.newsletter ? 'Oui' : 'Non') : '-'}</td>
														</tr>
														<tr>
															<th>Opt-in</th>
															<td>{customer ? (customer.optin ? 'Oui' : 'Non') : '-'}</td>
														</tr>
														<tr>
															<th>Societe</th>
															<td>{customer?.company || '-'}</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Produits</h6>
										</div>
										<div className="card-body">
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
														{order.order_rows.map(row => (
															<tr key={row.id}>
																<td>{row.product_name}</td>
																<td>{row.product_reference}</td>
																<td>{row.product_quantity}</td>
																<td>{row.unit_price_tax_incl.toFixed(2)} €</td>
																<td>{(row.unit_price_tax_incl * row.product_quantity).toFixed(2)} €</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Historique</h6>
										</div>
										<div className="card-body">
											{sortedHistories.length === 0 && (
												<div className="text-muted">Aucun historique.</div>
											)}
											{sortedHistories.length > 0 && (
												<div className="table-responsive">
													<table className="table table-bordered table-hover" width="100%" cellSpacing="0">
														<thead>
															<tr>
																<th>Date</th>
																<th>Etat</th>
																<th>Employee</th>
															</tr>
														</thead>
														<tbody>
															{sortedHistories.map(history => {
																const state = stateMap.get(history.id_order_state);
																return (
																	<tr key={history.id}>
																		<td>{history.date_add}</td>
																		<td>
																			{state ? (
																				<span
																					className="badge"
																					style={{ backgroundColor: state.color, color: '#fff' }}
																				>
																					{getLangValue(state.name)}
																				</span>
																			) : (
																				`Etat #${history.id_order_state}`
																			)}
																		</td>
																		<td>{history.id_employee ?? 0}</td>
																	</tr>
																);
															})}
														</tbody>
													</table>
												</div>
											)}
										</div>
									</div>

									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">Paiements</h6>
										</div>
										<div className="card-body">
											{payments.length === 0 && (
												<div className="text-muted">Aucun paiement.</div>
											)}
											{payments.length > 0 && (
												<div className="table-responsive">
													<table className="table table-bordered table-hover" width="100%" cellSpacing="0">
														<thead>
															<tr>
																<th>ID</th>
																<th>Montant</th>
																<th>Methode</th>
																<th>Transaction</th>
																<th>Date</th>
															</tr>
														</thead>
														<tbody>
															{payments.map(payment => (
																<tr key={payment.id}>
																	<td>{payment.id}</td>
																	<td>{payment.amount.toFixed(2)} €</td>
																	<td>{payment.payment_method}</td>
																	<td>{payment.transaction_id || '-'}</td>
																	<td>{payment.date_add}</td>
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
											<h6 className="m-0 font-weight-bold text-primary">Factures</h6>
										</div>
										<div className="card-body">
											{invoices.length === 0 && (
												<div className="text-muted">Aucune facture.</div>
											)}
											{invoices.length > 0 && (
												<div className="table-responsive">
													<table className="table table-bordered table-hover" width="100%" cellSpacing="0">
														<thead>
															<tr>
																<th>Numero</th>
																<th>Date</th>
																<th>Total TTC</th>
																<th>Adresse boutique</th>
															</tr>
														</thead>
														<tbody>
															{invoices.map(invoice => (
																<tr key={invoice.id}>
																	<td>{invoice.number}</td>
																	<td>{invoice.date_add}</td>
																	<td>{invoice.total_paid_tax_incl.toFixed(2)} €</td>
																	<td>{invoice.shop_address}</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											)}
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

export default DetailsOrder;
