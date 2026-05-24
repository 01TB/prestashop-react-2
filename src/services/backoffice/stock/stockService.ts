import {listStockAvailables} from "../../../resources/stock_availables/stock_availables.service.ts";
import {createStockMovement, updateStockMovement} from "../../../resources/stock_movements/stock_movements.service.ts";
import {getProductMyPrice} from "../../../resources/products/products.service.ts";
import {parseDateToStringWithHour} from "../../../utils/date-utils.ts";
import {listStockMovementReasons} from "../../../resources/stock_movement_reasons/stock_movement_reasons.service.ts";

/** Id de l'employé administrateur PrestaShop (adapter si nécessaire). */
const DEFAULT_EMPLOYEE_ID = 1;

export async function entreStock(idProduct: number, idProductAttribute: number, quantity: number, dateAdd: Date) {

    const dateString = parseDateToStringWithHour(dateAdd);

    // 1. Retrouver le stock_availables associé au produit et à son combination
    const stockAvailables = await listStockAvailables({
        'filter[id_product]': '['+ idProduct +']',
        'filter[id_product_attribute]': '['+ idProductAttribute +']',
    });

    // 2. Retrouver le product associé
    const myProduct = await getProductMyPrice(idProduct, {
        'price[my_price][use_tax]': '0',
        'price[my_price][use_reduction]':'1',
        'price[my_price][product_attribute]': String(idProductAttribute),
        'price[my_price][id_country]': '8',
    });

    // 3. Retrouver le mouvement de stock ENTREE
    const mvtStockReason = await listStockMovementReasons({
        'filter[sign]': '[1]'
    });

    // 2. Mouvement d'entrée de stock
    const newIdStockMovement = await createStockMovement({
        id_stock:            stockAvailables[0].id,
        id_stock_mvt_reason: mvtStockReason[0].id,
        id_employee:         DEFAULT_EMPLOYEE_ID,
        physical_quantity:   quantity,
        sign:                1,
        price_te:            myProduct.my_price,
        date_add:            dateString,
    });

    updateStockMovement(newIdStockMovement, {date_add: dateString});

}

export async function sortieStock(idProduct: number, idProductAttribute: number, quantity: number, dateAdd: Date) {

    const dateString = parseDateToStringWithHour(dateAdd);

    // 1. Retrouver le stock_availables associé au produit et à son combination
    const stockAvailables = await listStockAvailables({
        'filter[id_product]': '['+ idProduct +']',
        'filter[id_product_attribute]': '['+ idProductAttribute +']',
    });

    // 2. Retrouver le product associé
    const myProduct = await getProductMyPrice(idProduct, {
        'price[my_price][use_tax]': '0',
        'price[my_price][use_reduction]':'1',
        'price[my_price][product_attribute]': String(idProductAttribute),
        'price[my_price][id_country]': '8',
    });

    // 3. Retrouver le mouvement de stock SORTIE
    const mvtStockReason = await listStockMovementReasons({
        'filter[sign]': '[-1]'
    });

    // 2. Mouvement de sortie de stock
    const newIdStockMovement = await createStockMovement({
        id_stock:            stockAvailables[0].id,
        id_stock_mvt_reason: mvtStockReason[0].id,
        id_employee:         DEFAULT_EMPLOYEE_ID,
        physical_quantity:   quantity,
        sign:                -1,
        price_te:            myProduct.my_price,
        date_add:            dateString,
    });

    updateStockMovement(newIdStockMovement, {date_add: dateString});

}