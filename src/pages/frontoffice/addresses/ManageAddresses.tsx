import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';
import {
  listAddresses,
  updateAddress,
  deleteAddress,
} from '../../../resources/addresses/addresses.service';
import type { AddressOutput } from '../../../resources/addresses/addresses.types';

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

const emptyForm: AddressFormState = {
  alias: '',
  firstname: '',
  lastname: '',
  address1: '',
  postcode: '',
  phone: '',
  phone_mobile: '',
  city: '',
};

const toFormState = (address: AddressOutput): AddressFormState => ({
  alias: address.alias ?? '',
  firstname: address.firstname ?? '',
  lastname: address.lastname ?? '',
  address1: address.address1 ?? '',
  postcode: address.postcode ?? '',
  phone: address.phone ?? '',
  phone_mobile: address.phone_mobile ?? '',
  city: address.city ?? '',
});

function ManageAddresses() {
  const { customer } = useFrontofficeAuth();
  const [addresses, setAddresses] = useState<AddressOutput[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = async () => {
    if (!customer) return;
    setLoading(true);
    setError(null);

    try {
      const list = await listAddresses({
        'filter[id_customer]': `[${customer.id}]`,
      });
      setAddresses(list);

      if (list.length === 0) {
        setSelectedId(null);
        setForm(emptyForm);
        return;
      }

      const active = selectedId
        ? list.find(address => address.id === selectedId)
        : list[0];
      if (active) {
        setSelectedId(active.id);
        setForm(toFormState(active));
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [customer]);

  const handleSelect = (address: AddressOutput) => {
    setSelectedId(address.id);
    setForm(toFormState(address));
  };

  const handleChange = (field: keyof AddressFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm(current => ({ ...current, [field]: event.target.value }));
    };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!customer || !selectedId) return;

    setSaving(true);
    setError(null);

    try {
      await updateAddress(selectedId, {
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
      await loadAddresses();
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

  const handleDelete = async (addressId: number) => {
    if (!customer) return;
    const confirmed = window.confirm('Supprimer cette adresse ?');
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      await deleteAddress(addressId);
      if (selectedId === addressId) {
        setSelectedId(null);
        setForm(emptyForm);
      }
      await loadAddresses();
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
      <FrontofficeLayout title="Adresses">
        <div className="alert alert-warning" role="alert">
          Veuillez vous connecter pour gerer vos adresses.
        </div>
        <Link to="/frontoffice/login" className="btn btn-primary">
          Se connecter
        </Link>
      </FrontofficeLayout>
    );
  }

  return (
    <FrontofficeLayout title="Adresses">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && <div className="text-center py-4">Chargement...</div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-6">
            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 font-weight-bold text-primary">Vos adresses</h6>
                <Link to="/frontoffice/adresses/nouveau" className="btn btn-sm btn-primary">
                  Nouvelle adresse
                </Link>
              </div>
              <div className="card-body">
                {addresses.length === 0 && (
                  <div className="alert alert-info" role="alert">
                    Aucune adresse enregistree.
                  </div>
                )}
                {addresses.length > 0 && (
                  <div className="list-group">
                    {addresses.map(address => (
                      <div
                        key={address.id}
                        className={`list-group-item ${address.id === selectedId ? 'active' : ''}`}
                      >
                        <div className="d-flex w-100 justify-content-between align-items-center">
                          <div>
                            <div className="font-weight-bold">{address.alias}</div>
                            <div className="small">
                              {address.address1} {address.postcode} {address.city}
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              className={`btn btn-sm ${address.id === selectedId ? 'btn-light' : 'btn-outline-primary'} mr-2`}
                              onClick={() => handleSelect(address)}
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(address.id)}
                              disabled={saving}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Modifier</h6>
              </div>
              <div className="card-body">
                {!selectedId && (
                  <div className="text-gray-500">Selectionnez une adresse.</div>
                )}

                {selectedId && (
                  <form onSubmit={handleUpdate}>
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
                      {saving ? 'Enregistrement...' : 'Mettre a jour'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </FrontofficeLayout>
  );
}

export default ManageAddresses;
