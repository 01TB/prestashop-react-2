import {useFrontofficeAuth} from "../../../services/frontoffice/authentication/authService.tsx";

import {useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {getOrder} from "../../../resources/orders/orders.service.ts";
import {listStockAvailables} from "../../../resources/stock_availables/stock_availables.service.ts";
import type {OrderOutput} from "../../../resources/orders/orders.types.ts";
import {
    createDuplicatedOrder,
    createDuplicatedOrderWithSelectedProducts
} from "../../../services/frontoffice/orders/orderService.ts";
import {listProducts} from "../../../resources/products/products.service.ts";
import type {ProductOutput} from "../../../resources/products/products.types.ts";

export interface ProductQuantity {
    id_product: number;
    id_product_attribute: number;
    id_customization: number;
    quantity: number;
    unit_price_tax_incl: number;
    unit_price_tax_excl: number;
}

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

    refToProductQuantity: Map<string, ProductQuantity>;

    addChosenProductQuantity: (ref: string) => void;

    chosenProductQuantity: string[];
}

export function useDuplicateOrdersBis(id_order: number, quantity: number): DuplicateOrder {

    const navigate = useNavigate();

    const [refToProductQuantity, setRefToProductQuantity] = useState<Map<string, ProductQuantity>>(new Map());

    const [chosenProductQuantity, setChosenProductQuantity] = useState<string[]>([]);

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

                    const refProductQuantity = `${orderRow.product_id}-${orderRow.product_attribute_id}`;
                    // refToProductQuantity.set(refProductQuantity,{
                    //     id_product: orderRow.product_id,
                    //     id_product_attribute: orderRow.product_attribute_id,
                    //     id_customization: orderRow.id_customization,
                    //     quantity: orderRow.product_quantity
                    // });

                    setRefToProductQuantity(prevRefToProductQuantity => {
                        const newPrevRef = new Map(prevRefToProductQuantity);

                        newPrevRef.set(refProductQuantity,{
                            id_product: orderRow.product_id,
                            id_product_attribute: orderRow.product_attribute_id,
                            id_customization: orderRow.id_customization,
                            quantity: orderRow.product_quantity,
                            unit_price_tax_excl: orderRow.unit_price_tax_excl,
                            unit_price_tax_incl: orderRow.unit_price_tax_incl,
                        });

                        return newPrevRef;
                    })
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

    const addChosenProductQuantity = (ref: string) => {
        if(!chosenProductQuantity.includes(ref)) {
            setChosenProductQuantity([...chosenProductQuantity, ref]);
        } else {
            setChosenProductQuantity([]);
            for(const chosen of chosenProductQuantity) {
                if(ref !== chosen) {
                    setChosenProductQuantity([...chosenProductQuantity, chosen]);
                }
            }
        }
    }

    const productById : Map<number, ProductOutput> = new Map(products.map((product) => [product.id, product]));

    const totals = useMemo(() => {
        if (!orderChosen) return { totalHt: 0, totalTtc: 0 };

        const selectedProductQuantity : ProductQuantity[] = [];
        chosenProductQuantity.forEach((ref) => {
            selectedProductQuantity.push(refToProductQuantity.get(ref) as ProductQuantity);
        })



        return { totalHt: orderChosen.total_paid_tax_excl*quantity, totalTtc: orderChosen.total_paid_tax_incl*quantity };
    }, [quantity,orderChosen]);

    const handlePlaceOrder = async () => {
        if (!orderChosen || !customer) {
            setError('Informations manquantes pour finaliser la commande.');
            return;
        }

        setError(null);

        const selectedProductQuantity : ProductQuantity[] = [];
        chosenProductQuantity.forEach((ref) => {
            selectedProductQuantity.push(refToProductQuantity.get(ref) as ProductQuantity);
        })

        console.log("Taille de refToProductQuantity: " + refToProductQuantity.size);

        // const products = Array.from(refToProductQuantity.values());
        // for(const product of products) {
        //     console.log("Product " + product.id_product + "|" + product.id_product_attribute + " => x" + product.quantity);
        // }

        try {
            setPlacing(true);

            const orderId = await createDuplicatedOrderWithSelectedProducts(orderChosen, selectedProductQuantity, customer, quantity);
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
        refToProductQuantity,
        addChosenProductQuantity,
        chosenProductQuantity
    }

}