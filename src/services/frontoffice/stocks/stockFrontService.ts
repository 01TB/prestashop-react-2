import {createStockMovement} from "../../../resources/stock_movements/stock_movements.service.ts";
import {listStockMovementReasons} from "../../../resources/stock_movement_reasons/stock_movement_reasons.service.ts";
import {parseDateToStringWithHour} from "../../../utils/date-utils.ts";
import {getProductMyPrice} from "../../../resources/products/products.service.ts";
import {listStockAvailables} from "../../../resources/stock_availables/stock_availables.service.ts";

/** Id de l'employé administrateur PrestaShop (adapter si nécessaire). */
const DEFAULT_EMPLOYEE_ID = 1;

export type OrderRowStock = {
    product_id: number;
    product_attribute_id: number;
    product_quantity: number;
    id_customization: number;
}

export async function mvtStockOrders(idOrder:number, orderRows: OrderRowStock[]) : Promise<void> {
    for(const order of orderRows) {
        // const stock = await listStocks({
        //     'filter[id_product]': '['+order.product_id+']',
        //     'filter[id_product_attribute]': '['+order.product_attribute_id+']'
        // });

        const stockAvailables = await listStockAvailables({
            'filter[id_product]': '['+order.product_id+']',
            'filter[id_product_attribute]': '['+order.product_attribute_id+']'
        });

        const mvtStockReason = await listStockMovementReasons({
            'filter[sign]': 'filter[sign]=[-1]'
        });

        const product = await getProductMyPrice(order.product_id, {
            'price[my_price][use_tax]': '0',
            'price[my_price][use_reduction]':'1',
            'price[my_price][product_attribute]': '['+order.product_attribute_id+']',
            'price[my_price][id_country]': '[8]',
        });

        if(stockAvailables.length > 0){
            await createStockMovement({
                id_stock:            stockAvailables[0].id,
                id_stock_mvt_reason: mvtStockReason[0].id,
                id_order:            idOrder,
                id_employee:         DEFAULT_EMPLOYEE_ID,
                physical_quantity:   order.product_quantity,
                sign:                -1,
                price_te:            product.my_price,
                date_add:            parseDateToStringWithHour(new Date()),
            });
        }
    }
}