import {useFrontofficeAuth} from "../../../services/frontoffice/authentication/authService.tsx";

import {useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {getOrder} from "../../../resources/orders/orders.service.ts";
import {listStockAvailables} from "../../../resources/stock_availables/stock_availables.service.ts";
import type {OrderOutput} from "../../../resources/orders/orders.types.ts";
import {createDuplicatedOrder} from "../../../services/frontoffice/orders/orderService.ts";
import {listProducts} from "../../../resources/products/products.service.ts";
import type {ProductOutput} from "../../../resources/products/products.types.ts";

export interface DuplicateOrder {
    id_order: number;
    quantity: number;

    orderChosen: OrderOutput | null;
    totals: {
        totalHt: number;
        totalTtc: number;
    };

    customer: ReturnType<typeof useFrontofficeAuth>['customer'];

    productById : Map<number, ProductOutput>;

    loading: boolean;
    error: string | null;

    isDuplicable: boolean;
    placing: boolean;

    handlePlaceOrder: () => Promise<void>;
}

export function useDuplicateOrders(id_order: number, quantity: number): DuplicateOrder {

    const navigate = useNavigate();

    const { customer } = useFrontofficeAuth();

    const [orderChosen, setOrderOrderChosen] = useState<OrderOutput | null>(null);
    const [products, setProducts] = useState<ProductOutput[]>([]);

    const [loading, setLoading] = useState(true);

    const [isDuplicable, setIsDuplicable] = useState<boolean>(true);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        let isActive = true;

        const load = async () => {

            setLoading(true);
            setError(null);

            try {
                if (!isActive) return;

                const listProd = await listProducts();
                setProducts(listProd);

                const order = await getOrder(Number(id_order));
                setOrderOrderChosen(order);

                for(const orderRow of order.order_rows) {
                    const stockAvailables = await listStockAvailables({
                        'filter[id_product]':'['+ orderRow.product_id +']',
                        'filter[id_product_attribute]':'['+ orderRow.product_attribute_id +']'
                    });
                    if(orderRow.product_quantity * quantity > stockAvailables[0].quantity) {
                        const productError = listProd.find((product) => product.id === orderRow.product_id);
                        setError("Quantité de #" + orderRow.product_id +" "+ productError?.name[1] +" insuffisante");
                        setIsDuplicable(false);
                        break;
                    }

                }

                if (!isActive) return;

            } catch (err: unknown) {
                if (!isActive) return;
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                if (isActive) setLoading(false);
            }
        };

        load();
        return () => { isActive = false; };
    }, [id_order,quantity,customer]);

    const productById : Map<number, ProductOutput> = new Map(products.map((product) => [product.id, product]));

    const totals = useMemo(() => {
        if (!orderChosen) return { totalHt: 0, totalTtc: 0 };

        return { totalHt: orderChosen.total_paid_tax_excl*quantity, totalTtc: orderChosen.total_paid_tax_incl*quantity };
    }, [quantity,orderChosen]);

    const handlePlaceOrder = async () => {
        if (!orderChosen || !customer) {
            setError('Informations manquantes pour finaliser la commande.');
            return;
        }

        setError(null);

        try {
            setPlacing(true);

            const orderId = await createDuplicatedOrder(orderChosen, customer, quantity);
            navigate(`/frontoffice/commande/${orderId}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue lors du placement de la commande');
        } finally {
            setPlacing(false);
        }
    };


    return {
        id_order,
        quantity,
        orderChosen,
        totals,
        customer,
        productById,
        loading,
        error,
        isDuplicable,
        placing,
        handlePlaceOrder,
    }

}