import React, { useState } from 'react';
import { useAuth } from '../../../services/backoffice/authService';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginAuthBackoffice() {
  // Initialisation avec les credentials par défaut du .env (ou chaînes vides si absents)
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || '');
  const [password, setPassword] = useState(import.meta.env.VITE_ADMIN_PASSWORD || '');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    
    if (success) {
      // Redirige vers la page demandée initialement ou le dashboard du backoffice
      const origin = location.state?.from?.pathname || '/backoffice/dashboard';
      navigate(origin, { replace: true });
    } else {
      alert("Identifiants incorrects (vérifiez votre .env)");
    }
  };

  return (
    <div className="bg-gradient-primary" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  {/* Image décorative visible uniquement sur large écran */}
                  <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Administration Backoffice</h1>
                      </div>
                      
                      <form className="user" onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                          <input
                            type="email"
                            className="form-control form-control-user"
                            id="exampleInputEmail"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            id="exampleInputPassword"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-user btn-block w-100"
                        >
                          Se connecter
                        </button>
                        
                        <hr />
                      </form>
                      
                      <hr />
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

export default LoginAuthBackoffice;