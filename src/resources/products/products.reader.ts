import {
  getNodeText,
  getNodeInt,
  getNodeFloat,
  getNodeBool,
  getNodeLangMap,
  getAssocIds,
} from '../../utils/xml-utils';
import type {ProductMyPriceOutput, ProductOutput, ProductTtcOutput} from './products.types';

export function parseProduct(doc: Document): ProductOutput {
  const root = doc.querySelector('prestashop > product');
  if (!root) throw new Error('Réponse GET product invalide : nœud <product> absent');
  return parseProductFromElement(root);
}

export function parseProductTtc(doc: Document): ProductTtcOutput {
    const root = doc.querySelector('prestashop > product');
    if (!root) throw new Error('Réponse GET product invalide : nœud <product> absent');
    return parseProductTtcFromElement(root);
}

export function parseProductMyPrice(doc: Document): ProductMyPriceOutput {
    const root = doc.querySelector('prestashop > product');
    if (!root) throw new Error('Réponse GET product invalide : nœud <product> absent');
    return parseProductMyPriceFromElement(root);
}

export function parseProductList(doc: Document): ProductOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > products > product'))
    .map(parseProductFromElement);
}

export function parseProductTtcList(doc: Document): ProductTtcOutput[] {
    return Array.from(doc.querySelectorAll('prestashop > products > product'))
        .map(parseProductTtcFromElement);
}

export function parseProductMyPriceList(doc: Document): ProductMyPriceOutput[] {
    return Array.from(doc.querySelectorAll('prestashop > products > product'))
        .map(parseProductMyPriceFromElement);
}

export function parseProductFromElement(el: Element): ProductOutput {
  // Associations simples (listes d'IDs)
  const categories = getAssocIds(el, 'associations > categories', 'category');
  const images     = getAssocIds(el, 'associations > images', 'image');
  const combinations = getAssocIds(el, 'associations > combinations', 'combination');
  const productOptionValues = getAssocIds(el, 'associations > product_option_values', 'product_option_value');
  const tags       = getAssocIds(el, 'associations > tags', 'tag');
  const attachments = getAssocIds(el, 'associations > attachments', 'attachment');
  const accessories = getAssocIds(el, 'associations > accessories', 'product');

  // Associations avec plusieurs champs
  const productFeatures = Array.from(
    el.querySelectorAll('associations > product_features > product_feature')
  ).map(f => ({
    id:               parseInt(f.querySelector('id')?.textContent?.trim() ?? '0', 10),
    id_feature_value: parseInt(f.querySelector('id_feature_value')?.textContent?.trim() ?? '0', 10),
  }));

  const stockAvailables = Array.from(
    el.querySelectorAll('associations > stock_availables > stock_available')
  ).map(s => ({
    id:                   parseInt(s.querySelector('id')?.textContent?.trim() ?? '0', 10),
    id_product_attribute: parseInt(s.querySelector('id_product_attribute')?.textContent?.trim() ?? '0', 10),
  }));

  const productBundle = Array.from(
    el.querySelectorAll('associations > product_bundle > product')
  ).map(b => ({
    id:                   parseInt(b.querySelector('id')?.textContent?.trim() ?? '0', 10),
    id_product_attribute: parseInt(b.querySelector('id_product_attribute')?.textContent?.trim() ?? '0', 10),
    quantity:             parseInt(b.querySelector('quantity')?.textContent?.trim() ?? '0', 10),
  }));

  return {
    id:                          getNodeInt(el, 'id') ?? 0,
    id_manufacturer:             getNodeInt(el, 'id_manufacturer'),
    id_supplier:                 getNodeInt(el, 'id_supplier'),
    id_category_default:         getNodeInt(el, 'id_category_default') ?? 0,
    new:                         getNodeBool(el, 'new'),
    cache_default_attribute:     getNodeInt(el, 'cache_default_attribute') ?? 0,
    id_default_image:            getNodeInt(el, 'id_default_image'),
    id_default_combination:      getNodeInt(el, 'id_default_combination'),
    id_tax_rules_group:          getNodeInt(el, 'id_tax_rules_group') ?? 0,
    position_in_category:        getNodeInt(el, 'position_in_category') ?? 0,
    manufacturer_name:           getNodeText(el, 'manufacturer_name'),
    quantity:                    getNodeInt(el, 'quantity') ?? 0,
    type:                        getNodeText(el, 'type'),
    id_shop_default:             getNodeInt(el, 'id_shop_default') ?? 0,
    reference:                   getNodeText(el, 'reference'),
    supplier_reference:          getNodeText(el, 'supplier_reference'),
    location:                    getNodeText(el, 'location'),
    width:                       getNodeFloat(el, 'width') ?? 0,
    height:                      getNodeFloat(el, 'height') ?? 0,
    depth:                       getNodeFloat(el, 'depth') ?? 0,
    weight:                      getNodeFloat(el, 'weight') ?? 0,
    quantity_discount:           getNodeBool(el, 'quantity_discount'),
    ean13:                       getNodeText(el, 'ean13'),
    isbn:                        getNodeText(el, 'isbn'),
    upc:                         getNodeText(el, 'upc'),
    mpn:                         getNodeText(el, 'mpn'),
    cache_is_pack:               getNodeBool(el, 'cache_is_pack'),
    cache_has_attachments:       getNodeBool(el, 'cache_has_attachments'),
    is_virtual:                  getNodeBool(el, 'is_virtual'),
    on_sale:                     getNodeBool(el, 'on_sale'),
    online_only:                 getNodeBool(el, 'online_only'),
    ecotax:                      getNodeFloat(el, 'ecotax') ?? 0,
    minimal_quantity:            getNodeInt(el, 'minimal_quantity') ?? 1,
    low_stock_threshold:         getNodeInt(el, 'low_stock_threshold'),
    low_stock_alert:             getNodeBool(el, 'low_stock_alert'),
    price:                       getNodeFloat(el, 'price') ?? 0,
    wholesale_price:             getNodeFloat(el, 'wholesale_price') ?? 0,
    unity:                       getNodeText(el, 'unity'),
    unit_price:                  getNodeFloat(el, 'unit_price') ?? 0,
    additional_shipping_cost:    getNodeFloat(el, 'additional_shipping_cost') ?? 0,
    customizable:                getNodeInt(el, 'customizable') ?? 0,
    text_fields:                 getNodeInt(el, 'text_fields') ?? 0,
    uploadable_files:            getNodeInt(el, 'uploadable_files') ?? 0,
    active:                      getNodeBool(el, 'active'),
    redirect_type:               getNodeText(el, 'redirect_type'),
    id_type_redirected:          getNodeInt(el, 'id_type_redirected'),
    available_for_order:         getNodeBool(el, 'available_for_order'),
    available_date:              getNodeText(el, 'available_date'),
    show_condition:              getNodeBool(el, 'show_condition'),
    condition:                   getNodeText(el, 'condition'),
    show_price:                  getNodeBool(el, 'show_price'),
    indexed:                     getNodeBool(el, 'indexed'),
    visibility:                  getNodeText(el, 'visibility'),
    advanced_stock_management:   getNodeBool(el, 'advanced_stock_management'),
    date_add:                    getNodeText(el, 'date_add'),
    date_upd:                    getNodeText(el, 'date_upd'),
    pack_stock_type:             getNodeInt(el, 'pack_stock_type') ?? 0,
    // champs multilingues
    meta_description:            getNodeLangMap(el, 'meta_description'),
    meta_keywords:               getNodeLangMap(el, 'meta_keywords'),
    meta_title:                  getNodeLangMap(el, 'meta_title'),
    link_rewrite:                getNodeLangMap(el, 'link_rewrite'),
    name:                        getNodeLangMap(el, 'name'),
    description:                 getNodeLangMap(el, 'description'),
    description_short:           getNodeLangMap(el, 'description_short'),
    available_now:               getNodeLangMap(el, 'available_now'),
    available_later:             getNodeLangMap(el, 'available_later'),
    // associations
    categories,
    images,
    combinations,
    product_option_values:       productOptionValues,
    product_features:            productFeatures,
    tags,
    stock_availables:            stockAvailables,
    attachments,
    accessories,
    product_bundle:              productBundle,
  };
}

export function parseProductTtcFromElement(el: Element): ProductTtcOutput {
    // Associations simples (listes d'IDs)
    const categories = getAssocIds(el, 'associations > categories', 'category');
    const images     = getAssocIds(el, 'associations > images', 'image');
    const combinations = getAssocIds(el, 'associations > combinations', 'combination');
    const productOptionValues = getAssocIds(el, 'associations > product_option_values', 'product_option_value');
    const tags       = getAssocIds(el, 'associations > tags', 'tag');
    const attachments = getAssocIds(el, 'associations > attachments', 'attachment');
    const accessories = getAssocIds(el, 'associations > accessories', 'product');

    // Associations avec plusieurs champs
    const productFeatures = Array.from(
        el.querySelectorAll('associations > product_features > product_feature')
    ).map(f => ({
        id:               parseInt(f.querySelector('id')?.textContent?.trim() ?? '0', 10),
        id_feature_value: parseInt(f.querySelector('id_feature_value')?.textContent?.trim() ?? '0', 10),
    }));

    const stockAvailables = Array.from(
        el.querySelectorAll('associations > stock_availables > stock_available')
    ).map(s => ({
        id:                   parseInt(s.querySelector('id')?.textContent?.trim() ?? '0', 10),
        id_product_attribute: parseInt(s.querySelector('id_product_attribute')?.textContent?.trim() ?? '0', 10),
    }));

    const productBundle = Array.from(
        el.querySelectorAll('associations > product_bundle > product')
    ).map(b => ({
        id:                   parseInt(b.querySelector('id')?.textContent?.trim() ?? '0', 10),
        id_product_attribute: parseInt(b.querySelector('id_product_attribute')?.textContent?.trim() ?? '0', 10),
        quantity:             parseInt(b.querySelector('quantity')?.textContent?.trim() ?? '0', 10),
    }));

    return {
        id:                          getNodeInt(el, 'id') ?? 0,
        id_manufacturer:             getNodeInt(el, 'id_manufacturer'),
        id_supplier:                 getNodeInt(el, 'id_supplier'),
        id_category_default:         getNodeInt(el, 'id_category_default') ?? 0,
        new:                         getNodeBool(el, 'new'),
        cache_default_attribute:     getNodeInt(el, 'cache_default_attribute') ?? 0,
        id_default_image:            getNodeInt(el, 'id_default_image'),
        id_default_combination:      getNodeInt(el, 'id_default_combination'),
        id_tax_rules_group:          getNodeInt(el, 'id_tax_rules_group') ?? 0,
        position_in_category:        getNodeInt(el, 'position_in_category') ?? 0,
        manufacturer_name:           getNodeText(el, 'manufacturer_name'),
        quantity:                    getNodeInt(el, 'quantity') ?? 0,
        type:                        getNodeText(el, 'type'),
        id_shop_default:             getNodeInt(el, 'id_shop_default') ?? 0,
        reference:                   getNodeText(el, 'reference'),
        supplier_reference:          getNodeText(el, 'supplier_reference'),
        location:                    getNodeText(el, 'location'),
        width:                       getNodeFloat(el, 'width') ?? 0,
        height:                      getNodeFloat(el, 'height') ?? 0,
        depth:                       getNodeFloat(el, 'depth') ?? 0,
        weight:                      getNodeFloat(el, 'weight') ?? 0,
        quantity_discount:           getNodeBool(el, 'quantity_discount'),
        ean13:                       getNodeText(el, 'ean13'),
        isbn:                        getNodeText(el, 'isbn'),
        upc:                         getNodeText(el, 'upc'),
        mpn:                         getNodeText(el, 'mpn'),
        cache_is_pack:               getNodeBool(el, 'cache_is_pack'),
        cache_has_attachments:       getNodeBool(el, 'cache_has_attachments'),
        is_virtual:                  getNodeBool(el, 'is_virtual'),
        on_sale:                     getNodeBool(el, 'on_sale'),
        online_only:                 getNodeBool(el, 'online_only'),
        ecotax:                      getNodeFloat(el, 'ecotax') ?? 0,
        minimal_quantity:            getNodeInt(el, 'minimal_quantity') ?? 1,
        low_stock_threshold:         getNodeInt(el, 'low_stock_threshold'),
        low_stock_alert:             getNodeBool(el, 'low_stock_alert'),
        price:                       getNodeFloat(el, 'price') ?? 0,
        wholesale_price:             getNodeFloat(el, 'wholesale_price') ?? 0,
        unity:                       getNodeText(el, 'unity'),
        unit_price:                  getNodeFloat(el, 'unit_price') ?? 0,
        additional_shipping_cost:    getNodeFloat(el, 'additional_shipping_cost') ?? 0,
        customizable:                getNodeInt(el, 'customizable') ?? 0,
        text_fields:                 getNodeInt(el, 'text_fields') ?? 0,
        uploadable_files:            getNodeInt(el, 'uploadable_files') ?? 0,
        active:                      getNodeBool(el, 'active'),
        redirect_type:               getNodeText(el, 'redirect_type'),
        id_type_redirected:          getNodeInt(el, 'id_type_redirected'),
        available_for_order:         getNodeBool(el, 'available_for_order'),
        available_date:              getNodeText(el, 'available_date'),
        show_condition:              getNodeBool(el, 'show_condition'),
        condition:                   getNodeText(el, 'condition'),
        show_price:                  getNodeBool(el, 'show_price'),
        indexed:                     getNodeBool(el, 'indexed'),
        visibility:                  getNodeText(el, 'visibility'),
        advanced_stock_management:   getNodeBool(el, 'advanced_stock_management'),
        date_add:                    getNodeText(el, 'date_add'),
        date_upd:                    getNodeText(el, 'date_upd'),
        pack_stock_type:             getNodeInt(el, 'pack_stock_type') ?? 0,
        // champs multilingues
        meta_description:            getNodeLangMap(el, 'meta_description'),
        meta_keywords:               getNodeLangMap(el, 'meta_keywords'),
        meta_title:                  getNodeLangMap(el, 'meta_title'),
        link_rewrite:                getNodeLangMap(el, 'link_rewrite'),
        name:                        getNodeLangMap(el, 'name'),
        description:                 getNodeLangMap(el, 'description'),
        description_short:           getNodeLangMap(el, 'description_short'),
        available_now:               getNodeLangMap(el, 'available_now'),
        available_later:             getNodeLangMap(el, 'available_later'),
        price_ttc:                   getNodeFloat(el, 'price_ttc') ?? 0,
        // associations
        categories,
        images,
        combinations,
        product_option_values:       productOptionValues,
        product_features:            productFeatures,
        tags,
        stock_availables:            stockAvailables,
        attachments,
        accessories,
        product_bundle:              productBundle,
    };
}

export function parseProductMyPriceFromElement(el: Element): ProductMyPriceOutput {
    // Associations simples (listes d'IDs)
    const categories = getAssocIds(el, 'associations > categories', 'category');
    const images     = getAssocIds(el, 'associations > images', 'image');
    const combinations = getAssocIds(el, 'associations > combinations', 'combination');
    const productOptionValues = getAssocIds(el, 'associations > product_option_values', 'product_option_value');
    const tags       = getAssocIds(el, 'associations > tags', 'tag');
    const attachments = getAssocIds(el, 'associations > attachments', 'attachment');
    const accessories = getAssocIds(el, 'associations > accessories', 'product');

    // Associations avec plusieurs champs
    const productFeatures = Array.from(
        el.querySelectorAll('associations > product_features > product_feature')
    ).map(f => ({
        id:               parseInt(f.querySelector('id')?.textContent?.trim() ?? '0', 10),
        id_feature_value: parseInt(f.querySelector('id_feature_value')?.textContent?.trim() ?? '0', 10),
    }));

    const stockAvailables = Array.from(
        el.querySelectorAll('associations > stock_availables > stock_available')
    ).map(s => ({
        id:                   parseInt(s.querySelector('id')?.textContent?.trim() ?? '0', 10),
        id_product_attribute: parseInt(s.querySelector('id_product_attribute')?.textContent?.trim() ?? '0', 10),
    }));

    const productBundle = Array.from(
        el.querySelectorAll('associations > product_bundle > product')
    ).map(b => ({
        id:                   parseInt(b.querySelector('id')?.textContent?.trim() ?? '0', 10),
        id_product_attribute: parseInt(b.querySelector('id_product_attribute')?.textContent?.trim() ?? '0', 10),
        quantity:             parseInt(b.querySelector('quantity')?.textContent?.trim() ?? '0', 10),
    }));

    return {
        id:                          getNodeInt(el, 'id') ?? 0,
        id_manufacturer:             getNodeInt(el, 'id_manufacturer'),
        id_supplier:                 getNodeInt(el, 'id_supplier'),
        id_category_default:         getNodeInt(el, 'id_category_default') ?? 0,
        new:                         getNodeBool(el, 'new'),
        cache_default_attribute:     getNodeInt(el, 'cache_default_attribute') ?? 0,
        id_default_image:            getNodeInt(el, 'id_default_image'),
        id_default_combination:      getNodeInt(el, 'id_default_combination'),
        id_tax_rules_group:          getNodeInt(el, 'id_tax_rules_group') ?? 0,
        position_in_category:        getNodeInt(el, 'position_in_category') ?? 0,
        manufacturer_name:           getNodeText(el, 'manufacturer_name'),
        quantity:                    getNodeInt(el, 'quantity') ?? 0,
        type:                        getNodeText(el, 'type'),
        id_shop_default:             getNodeInt(el, 'id_shop_default') ?? 0,
        reference:                   getNodeText(el, 'reference'),
        supplier_reference:          getNodeText(el, 'supplier_reference'),
        location:                    getNodeText(el, 'location'),
        width:                       getNodeFloat(el, 'width') ?? 0,
        height:                      getNodeFloat(el, 'height') ?? 0,
        depth:                       getNodeFloat(el, 'depth') ?? 0,
        weight:                      getNodeFloat(el, 'weight') ?? 0,
        quantity_discount:           getNodeBool(el, 'quantity_discount'),
        ean13:                       getNodeText(el, 'ean13'),
        isbn:                        getNodeText(el, 'isbn'),
        upc:                         getNodeText(el, 'upc'),
        mpn:                         getNodeText(el, 'mpn'),
        cache_is_pack:               getNodeBool(el, 'cache_is_pack'),
        cache_has_attachments:       getNodeBool(el, 'cache_has_attachments'),
        is_virtual:                  getNodeBool(el, 'is_virtual'),
        on_sale:                     getNodeBool(el, 'on_sale'),
        online_only:                 getNodeBool(el, 'online_only'),
        ecotax:                      getNodeFloat(el, 'ecotax') ?? 0,
        minimal_quantity:            getNodeInt(el, 'minimal_quantity') ?? 1,
        low_stock_threshold:         getNodeInt(el, 'low_stock_threshold'),
        low_stock_alert:             getNodeBool(el, 'low_stock_alert'),
        price:                       getNodeFloat(el, 'price') ?? 0,
        wholesale_price:             getNodeFloat(el, 'wholesale_price') ?? 0,
        unity:                       getNodeText(el, 'unity'),
        unit_price:                  getNodeFloat(el, 'unit_price') ?? 0,
        additional_shipping_cost:    getNodeFloat(el, 'additional_shipping_cost') ?? 0,
        customizable:                getNodeInt(el, 'customizable') ?? 0,
        text_fields:                 getNodeInt(el, 'text_fields') ?? 0,
        uploadable_files:            getNodeInt(el, 'uploadable_files') ?? 0,
        active:                      getNodeBool(el, 'active'),
        redirect_type:               getNodeText(el, 'redirect_type'),
        id_type_redirected:          getNodeInt(el, 'id_type_redirected'),
        available_for_order:         getNodeBool(el, 'available_for_order'),
        available_date:              getNodeText(el, 'available_date'),
        show_condition:              getNodeBool(el, 'show_condition'),
        condition:                   getNodeText(el, 'condition'),
        show_price:                  getNodeBool(el, 'show_price'),
        indexed:                     getNodeBool(el, 'indexed'),
        visibility:                  getNodeText(el, 'visibility'),
        advanced_stock_management:   getNodeBool(el, 'advanced_stock_management'),
        date_add:                    getNodeText(el, 'date_add'),
        date_upd:                    getNodeText(el, 'date_upd'),
        pack_stock_type:             getNodeInt(el, 'pack_stock_type') ?? 0,
        // champs multilingues
        meta_description:            getNodeLangMap(el, 'meta_description'),
        meta_keywords:               getNodeLangMap(el, 'meta_keywords'),
        meta_title:                  getNodeLangMap(el, 'meta_title'),
        link_rewrite:                getNodeLangMap(el, 'link_rewrite'),
        name:                        getNodeLangMap(el, 'name'),
        description:                 getNodeLangMap(el, 'description'),
        description_short:           getNodeLangMap(el, 'description_short'),
        available_now:               getNodeLangMap(el, 'available_now'),
        available_later:             getNodeLangMap(el, 'available_later'),
        my_price:                   getNodeFloat(el, 'my_price') ?? 0,
        // associations
        categories,
        images,
        combinations,
        product_option_values:       productOptionValues,
        product_features:            productFeatures,
        tags,
        stock_availables:            stockAvailables,
        attachments,
        accessories,
        product_bundle:              productBundle,
    };
}