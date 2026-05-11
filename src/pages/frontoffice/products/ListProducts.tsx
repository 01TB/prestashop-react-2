import { useEffect, useState } from 'react';
import SidebarFrontoffice from '../../../components/UI/Navigation/frontoffice/SidebarFrontoffice';
import TopbarFrontoffice from '../../../components/UI/Navigation/frontoffice/TopbarFrontoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { listProducts } from '../../../resources/products/products.service';
import api from '../../../services/api';
import { parseXml } from '../../../utils/xml-utils';
import type { ProductOutput } from '../../../resources/products/products.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

const getImageIdsFromDoc = (doc: Document): number[] => {
  const declinationIds = Array.from(doc.querySelectorAll('declination'))
    .map(node => parseInt(node.getAttribute('id') ?? '0', 10))
    .filter(id => id > 0);
  if (declinationIds.length > 0) return declinationIds;

  return Array.from(doc.querySelectorAll('image'))
    .map(node => parseInt(node.getAttribute('id') ?? '0', 10))
    .filter(id => id > 0);
};

const fetchPrimaryImageUrl = async (productId: number): Promise<string | null> => {
  const response = await api.get<string>(`images/products/${productId}`, {
    params: { display: 'full' },
  });
  const doc = parseXml(response.data);
  const imageIds = getImageIdsFromDoc(doc);
  if (imageIds.length === 0) return null;
  return `/api/images/products/${productId}/${imageIds[0]}`;
};

function ListProductsFrontoffice() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [productImages, setProductImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await listProducts();
        if (!isActive) return;
        setProducts(result);

        const imageEntries = await Promise.all(
          result.map(async product => {
            try {
              const imageUrl = await fetchPrimaryImageUrl(product.id);
              return [product.id, imageUrl] as const;
            } catch {
              return [product.id, null] as const;
            }
          })
        );

        if (!isActive) return;
        const imageMap: Record<number, string> = {};
        for (const [productId, url] of imageEntries) {
          if (url) imageMap[productId] = url;
        }
        setProductImages(imageMap);
      } catch (err: unknown) {
        if (!isActive) return;
        if (err && typeof err === 'object' && 'message' in err) {
          setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
        } else {
          setError('Erreur inconnue');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, []);

  const visibleProducts = products.filter(product => product.active);

  return (
    <div>
      {/* <!-- Page Wrapper --> */}
      <div id="wrapper">
        {/* <!-- SidebarFrontoffice --> */}
        <SidebarFrontoffice />
        {/* <!-- End of SidebarFrontoffice --> */}

        {/* <!-- Content Wrapper --> */}
        <div id="content-wrapper" className="d-flex flex-column">
          {/* <!-- Main Content --> */}
          <div id="content">
            {/* <!-- TopbarFrontoffice --> */}
            <TopbarFrontoffice />
            {/* <!-- End of TopbarFrontoffice --> */}

            {/* <!-- Begin Page Content --> */}
            <div className="container-fluid">
              <PageHeading title="Produits" />

              {loading && (
                <div className="text-center py-4">Chargement...</div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <div className="row">
                  {visibleProducts.length === 0 && (
                    <div className="col-12">
                      <div className="alert alert-info" role="alert">
                        Aucun produit disponible.
                      </div>
                    </div>
                  )}

                  {visibleProducts.map(product => {
                    const name = getLangValue(product.name);
                    const imageUrl = productImages[product.id];
                    const showNew = product.new;
                    const showSale = product.on_sale;

                    return (
                      <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={product.id}>
                        <div className="card border-0 shadow h-100">
                          <div className="position-relative">
                            {imageUrl ? (
                              <img
                                className="card-img-top"
                                src={imageUrl}
                                alt={name}
                                style={{ height: '220px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center"
                                style={{ height: '220px' }}
                              >
                                <span className="text-gray-500 small">Aucune image</span>
                              </div>
                            )}

                            {showNew && (
                              <span
                                className="badge badge-info position-absolute"
                                style={{ top: '8px', left: '8px' }}
                              >
                                NOUVEAU
                              </span>
                            )}

                            {showSale && (
                              <span
                                className="badge badge-warning position-absolute"
                                style={{ top: showNew ? '36px' : '8px', left: '8px' }}
                              >
                                PROMO
                              </span>
                            )}

                            <span
                              className="btn btn-light btn-circle btn-sm position-absolute"
                              style={{ top: '8px', right: '8px' }}
                            >
                              <i className="far fa-heart"></i>
                            </span>
                          </div>

                          <div className="card-body text-center">
                            <div className="text-gray-900 small mb-1">{name}</div>
                            <div className="font-weight-bold">{(product.price*1.2).toFixed(2)} € TTC</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

export default ListProductsFrontoffice;
