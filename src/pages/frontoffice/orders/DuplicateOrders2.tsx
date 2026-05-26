import {Link, useParams} from "react-router-dom";
import FrontofficeLayout from "../../../components/UI/Navigation/frontoffice/FrontofficeLayout.tsx";
import {useDuplicateOrdersBis} from "../../../hooks/frontoffice/orders/useDuplicateOrders2.ts";
import {useState} from "react";

function DuplicateOrdersBis() {
    const { orderId } = useParams<{ orderId: string }>();
    const { quantity } = useParams<{ quantity: string }>();

    const id_order = Number(orderId);
    const quantity_order = Number(quantity);

    const [selected, setSelected] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setSelected((prev) =>
            checked ? [...prev, value as string] : prev.filter((f) => f !== value)
        );
        addChosenProductQuantity(value)
    };

    const {
        orderChosen,
        totals,
        customer,
        productById,
        loading,
        error,
        isDuplicable,
        placing,
        handlePlaceOrder,
        addChosenProductQuantity,
        chosenProductQuantity,
    } = useDuplicateOrdersBis(id_order, quantity_order);

    if (!customer) {
        return (
            <FrontofficeLayout title="Checkout">
                <div className="alert alert-warning" role="alert">
                    Veuillez vous connecter pour finaliser votre commande.
                </div>
                <Link to="/frontoffice/login" className="btn btn-primary">
                    Se connecter
                </Link>
            </FrontofficeLayout>
        );
    }

    return (
        <FrontofficeLayout title="Checkout">
            {loading && <div className="text-center py-4">Chargement...</div>}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {!loading && (
                <div className="row">
                    <div className="col-lg-7">
                        <div className="card shadow mb-4">
                            <div className="card-header py-3">
                                <h6 className="m-0 font-weight-bold text-primary">Commande dupliqué</h6>
                            </div>
                            <div className="card-body">
                                { orderChosen && (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                                            <thead>
                                                <tr>
                                                    <th>Produit</th>
                                                    <th>Quantité</th>
                                                    <th>Sélection</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.values(orderChosen.order_rows).map((orderRow,index) => (
                                                    <tr key={index}>
                                                        <td>{productById.get(orderRow.product_id)?.name[1]}</td>
                                                        <td>{orderRow.product_quantity}</td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                value={`${orderRow.product_id}-${orderRow.product_attribute_id}`}
                                                                checked={selected.includes(`${orderRow.product_id}-${orderRow.product_attribute_id}`)}
                                                                onChange={handleChange}
                                                            />
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

                    <div className="col-lg-5">
                        <div className="card shadow mb-4">
                            <div className="card-header py-3">
                                <h6 className="m-0 font-weight-bold text-primary">Recapitulatif</h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Duplication par : </span>
                                    <span>{quantity}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Produits choisis</span>
                                    <span>{chosenProductQuantity.join(" | ")}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Total HT</span>
                                    <span>{totals.totalHt.toFixed(2)} EUR</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>TVA</span>
                                    <span>{(totals.totalTtc - totals.totalHt).toFixed(2)} EUR</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Livraison</span>
                                    <span>0.00 EUR</span>
                                </div>
                                <div className="d-flex justify-content-between font-weight-bold">
                                    <span>Total TTC</span>
                                    <span>{totals.totalTtc.toFixed(2)} EUR</span>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-block mt-4"
                                    onClick={handlePlaceOrder}
                                    disabled={!isDuplicable}
                                >
                                    {placing ? 'Validation...' : 'Valider la commande'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </FrontofficeLayout>
    );
}

export default DuplicateOrdersBis;