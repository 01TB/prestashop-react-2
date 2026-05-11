import SidebarBackoffice from "../../../components/UI/Navigation/backoffice/SidebarBackoffice";
import TopbarBackoffice from "../../../components/UI/Navigation/backoffice/TopbarBackoffice";
import PageHeading from "../../../components/UI/Heading/PageHeading";
import { useOrdersWithStatus } from "../../../hooks/backoffice/orders/useOrdersWithStatus";

function ListOrders() {
	const {
		data,
		states,
		loading,
		error,
		updatingIds,
		updateErrors,
		updateOrderState,
	} = useOrdersWithStatus();

	const allowedStateIds = new Set([2, 6, 8]);
	const selectableStates = states.filter(state => allowedStateIds.has(state.id));
	const baseOptions = selectableStates.length > 0 ? selectableStates : states;
	const baseOptionIds = new Set(baseOptions.map(state => state.id));

	const getLangValue = (map: Record<number, string>, preferred = 1): string =>
		map[preferred] ?? Object.values(map)[0] ?? '';

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
							<PageHeading title="Liste des commandes" />

							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">Commandes</h6>
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
														<th>Reference</th>
														<th>Etat</th>
															<th>Changer etat</th>
														<th>Paiement</th>
														<th>Total TTC</th>
														<th>Date</th>
													</tr>
												</thead>
												<tbody>
													{data.map(item => (
														<tr key={item.order.id}>
															<td>{item.order.id}</td>
															<td>{item.order.reference}</td>
															<td>
																<span
																	className="badge"
																	style={{ backgroundColor: item.statusColor, color: '#fff' }}
																	title={item.statusId ? `ID ${item.statusId}` : 'Etat inconnu'}
																>
																	{item.statusName}
																</span>
															</td>
															<td>
																{(() => {
																	const currentState = item.statusId
																		? states.find(state => state.id === item.statusId)
																		: undefined;
																	const rowOptions =
																		item.statusId && !baseOptionIds.has(item.statusId) && currentState
																			? [...baseOptions, currentState]
																			: baseOptions;
																	return (
																<select
																	className="form-control form-control-sm"
																	value={item.statusId ?? ''}
																		disabled={!!updatingIds[item.order.id] || rowOptions.length === 0}
																	onChange={(event) => {
																		const nextId = Number(event.target.value);
																		if (!nextId || nextId === item.statusId) return;
																		updateOrderState(item.order.id, nextId);
																	}}
																>
																	{!item.statusId && (
																		<option value="">Choisir un etat</option>
																	)}
																		{rowOptions.map(state => (
																		<option key={state.id} value={state.id}>
																			{getLangValue(state.name)}
																		</option>
																	))}
																</select>
																	);
																})()}
																{updatingIds[item.order.id] && (
																	<div className="small text-muted mt-1">Mise a jour...</div>
																)}
																{updateErrors[item.order.id] && (
																	<div className="small text-danger mt-1">
																		{updateErrors[item.order.id]}
																	</div>
																)}
															</td>
															<td>{item.order.payment}</td>
															<td>{item.order.total_paid_tax_incl.toFixed(2)} €</td>
															<td>{item.order.date_add}</td>
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

export default ListOrders;
