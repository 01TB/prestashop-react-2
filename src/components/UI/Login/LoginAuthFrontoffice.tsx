import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';

function LoginAuthFrontoffice() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useFrontofficeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const success = await login(email);

    if (success) {
      const origin = location.state?.from?.pathname || '/frontoffice/produits';
      navigate(origin, { replace: true });
    } else {
      setError('Aucun client trouve avec cet email.');
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-gradient-primary" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Connexion Frontoffice</h1>
                      </div>

                      {error && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}

                      <form className="user" onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                          <input
                            type="email"
                            className="form-control form-control-user"
                            id="frontofficeEmail"
                            placeholder="Adresse email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary btn-user btn-block w-100"
                          disabled={submitting}
                        >
                          {submitting ? 'Connexion...' : 'Se connecter'}
                        </button>

                        <hr />
                      </form>
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
