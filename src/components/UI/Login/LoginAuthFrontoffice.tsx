import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';
import { listCustomers } from '../../../resources/customers/customers.service';
import type { CustomerOutput } from '../../../resources/customers/customers.types';

function LoginAuthFrontoffice() {
  const [customers, setCustomers] = useState<CustomerOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { login, loginAnonymous } = useFrontofficeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await listCustomers();
        if (mounted) setCustomers(list);
      } catch (e) {
        if (mounted) setError('Impossible de charger la liste des clients.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleLogin = async (email?: string) => {
    setError(null);
    const origin = location.state?.from?.pathname || '/frontoffice/produits';
    if (email) {
      const ok = await login(email);
      if (ok) navigate(origin, { replace: true });
      else setError('Echec de connexion pour ce client.');
      return;
    }

    const ok = await loginAnonymous();
    if (ok) navigate(origin, { replace: true });
    else setError('Impossible de creer un utilisateur anonyme.');
  };

  return (
    <div className="bg-gradient-primary" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Choisir un client / Connexion</h1>
                      </div>

                      {error && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}

                      <div>
                        <div className="mb-3">
                          <button className="btn btn-secondary w-100" onClick={() => handleLogin(undefined)}>
                            Utilisateur anonyme
                          </button>
                        </div>

                        <hr />

                        {loading ? (
                          <div>Chargement des clients...</div>
                        ) : (
                          <div className="list-group">
                            {customers.map((c) => (
                              <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                  <div><strong>{c.firstname} {c.lastname}</strong></div>
                                  <div className="text-muted">{c.email}</div>
                                </div>
                                <div>
                                  <button className="btn btn-primary" onClick={() => handleLogin(c.email)}>
                                    Se connecter
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAuthFrontoffice;
