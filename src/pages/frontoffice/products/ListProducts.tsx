import { useEffect, useState } from 'react';
import SidebarFrontoffice from '../../../components/UI/Navigation/frontoffice/SidebarFrontoffice';
import TopbarFrontoffice from '../../../components/UI/Navigation/frontoffice/TopbarFrontoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { listProducts } from '../../../resources/products/products.service';
import type { ProductOutput } from '../../../resources/products/products.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

function ListProductsFrontoffice() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
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
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Liste des produits</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Reference</th>
                            <th>Prix</th>
                            <th>Stock</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product.id}>
                              <td>{product.id}</td>
                              <td>{getLangValue(product.name)}</td>
                              <td>{product.reference || '-'}</td>
                              <td>{product.price.toFixed(2)} €</td>
                              <td>{product.quantity}</td>
                              <td>{product.active ? 'Actif' : 'Inactif'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
