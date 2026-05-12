import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';
import { createAddress } from '../../../resources/addresses/addresses.service';

interface AddressFormState {
  alias: string;
  firstname: string;
  lastname: string;
  address1: string;
  postcode: string;
  phone: string;
  phone_mobile: string;
  city: string;
}

const initialState: AddressFormState = {
  alias: '',
  firstname: '',
  lastname: '',
  address1: '',
  postcode: '',
  phone: '',
  phone_mobile: '',
  city: '',
};

function CreateAddress() {
  const navigate = useNavigate();
  const { customer } = useFrontofficeAuth();
  const [form, setForm] = useState<AddressFormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof AddressFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm(current => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!customer) {
      setError('Veuillez vous connecter pour ajouter une adresse.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createAddress({
        id_customer: customer.id,
        id_country: 8,
        alias: form.alias.trim(),
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        address1: form.address1.trim(),
        postcode: form.postcode.trim(),
        phone: form.phone.trim(),
        phone_mobile: form.phone_mobile.trim(),
        city: form.city.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/frontoffice/checkout');
      }, 400);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!customer) {
    return (
      <FrontofficeLayout title="Nouvelle adresse">
        <div className="alert alert-warning" role="alert">
          Veuillez vous connecter pour ajouter une adresse.
        </div>
        <Link to="/frontoffice/login" className="btn btn-primary">
          Se connecter
        </Link>
      </FrontofficeLayout>
    );
  }

  return (
    <FrontofficeLayout title="Nouvelle adresse">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          Adresse ajoutee. Redirection...
        </div>
      )}

      <div className="card shadow mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Alias</label>
              <input
                className="form-control"
                value={form.alias}
                onChange={handleChange('alias')}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Prenom</label>
                <input
                  className="form-control"
                  value={form.firstname}
                  onChange={handleChange('firstname')}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label>Nom</label>
                <input
                  className="form-control"
                  value={form.lastname}
                  onChange={handleChange('lastname')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Adresse</label>
              <input
                className="form-control"
                value={form.address1}
                onChange={handleChange('address1')}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Code postal</label>
                <input
                  className="form-control"
                  value={form.postcode}
                  onChange={handleChange('postcode')}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Ville</label>
                <input
                  className="form-control"
                  value={form.city}
                  onChange={handleChange('city')}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Telephone</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange('phone')}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Mobile</label>
                <input
                  className="form-control"
                  value={form.phone_mobile}
                  onChange={handleChange('phone_mobile')}
                />
              </div>
            </div>

            <div className="text-gray-500 small mb-3">Pays par defaut: France</div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Ajouter l\'adresse'}
            </button>
            <Link to="/frontoffice/checkout" className="btn btn-link">
              Retour au checkout
            </Link>
          </form>
        </div>
      </div>
    </FrontofficeLayout>
  );
}

export default CreateAddress;
