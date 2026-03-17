import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { capitalize, formatDate, getErrorMessage } from '../utils/helpers';
import Loader, { Spinner } from '../components/Loader';

const TABS = ['pets', 'adoptions'];
const SPECIES_OPTIONS = ['dog', 'cat', 'bird', 'rabbit', 'other'];
const EMPTY_PET_FORM = { name: '', species: 'dog', breed: '', age: '', description: '', image: '', status: 'available' };

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pets');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage pets and adoption requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'pets' ? '🐾 Pets' : '📋 Adoptions'}
          </button>
        ))}
      </div>

      {activeTab === 'pets' ? <PetsManager /> : <AdoptionsManager />}
    </div>
  );
};

/* ─────────────────────────────────────────
   Pets Manager
───────────────────────────────────────── */
const PetsManager = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [form, setForm] = useState(EMPTY_PET_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPets = async () => {
    try {
      const { data } = await api.get('/pets?limit=100');
      setPets(data.pets);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPets(); }, []);

  const openCreateForm = () => {
    setEditingPet(null);
    setForm(EMPTY_PET_FORM);
    setShowForm(true);
  };

  const openEditForm = (pet) => {
    setEditingPet(pet);
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      description: pet.description || '',
      image: pet.image || '',
      status: pet.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this pet?')) return;
    try {
      await api.delete(`/pets/${id}`);
      toast.success('Pet removed');
      setPets((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.species || form.age === '') {
      return toast.error('Name, species, and age are required');
    }
    setSaving(true);
    try {
      if (editingPet) {
        const { data } = await api.put(`/pets/${editingPet._id}`, { ...form, age: Number(form.age) });
        setPets((prev) => prev.map((p) => (p._id === data._id ? data : p)));
        toast.success('Pet updated');
      } else {
        const { data } = await api.post('/pets', { ...form, age: Number(form.age) });
        setPets((prev) => [data, ...prev]);
        toast.success('Pet added');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading pets..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{pets.length} pets total</p>
        <button onClick={openCreateForm} className="btn-primary text-sm py-2 px-4">
          + Add Pet
        </button>
      </div>

      {/* Pet Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingPet ? 'Edit Pet' : 'Add New Pet'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. Buddy"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
                    <select
                      value={form.species}
                      onChange={(e) => setForm((p) => ({ ...p, species: e.target.value }))}
                      className="input-field"
                    >
                      {SPECIES_OPTIONS.map((s) => (
                        <option key={s} value={s}>{capitalize(s)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <input
                      type="text"
                      value={form.breed}
                      onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. Labrador"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (years) *</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                      className="input-field"
                      min="0"
                      placeholder="e.g. 2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      className="input-field"
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="adopted">Adopted</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                      className="input-field"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Tell us about this pet..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <Spinner size="sm" /> : null}
                    {saving ? 'Saving...' : editingPet ? 'Save Changes' : 'Add Pet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pets Table */}
      {pets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🐾</div>
          <p>No pets yet. Add your first one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Species', 'Breed', 'Age', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {pets.map((pet) => (
                <tr key={pet._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {pet.image ? (
                        <img src={pet.image} alt={pet.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-sm">🐾</div>
                      )}
                      <span className="font-medium text-gray-800">{pet.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{capitalize(pet.species)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pet.breed}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pet.age}y</td>
                  <td className="px-4 py-3">
                    <span className={`badge-${pet.status}`}>{capitalize(pet.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditForm(pet)} className="text-sm text-blue-500 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(pet._id)} className="text-sm text-red-400 hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Adoptions Manager
───────────────────────────────────────── */
const AdoptionsManager = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAdoptions = async () => {
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/adoption/admin${qs}`);
      setAdoptions(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdoptions(); }, [statusFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/adoption/${id}`, { status: newStatus });
      setAdoptions((prev) => prev.map((a) => (a._id === id ? data : a)));
      toast.success(`Application ${newStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader message="Loading adoption requests..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{adoptions.length} requests</p>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-40 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {adoptions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>No adoption requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {adoptions.map((adoption) => (
            <AdoptionRow
              key={adoption._id}
              adoption={adoption}
              onUpdate={handleStatusUpdate}
              isUpdating={updatingId === adoption._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdoptionRow = ({ adoption, onUpdate, isUpdating }) => {
  const { _id, user, pet, status, message, createdAt } = adoption;

  const statusClass = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' }[status];
  const SPECIES_EMOJI = { dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰', other: '🐾' };

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        {/* Pet thumbnail */}
        <div className="w-14 h-14 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {pet?.image ? (
            <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{SPECIES_EMOJI[pet?.species] || '🐾'}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <p className="font-semibold text-gray-800">{pet?.name}</p>
              <p className="text-sm text-gray-400">{capitalize(pet?.species)} · {pet?.breed}</p>
            </div>
            <span className={statusClass}>{capitalize(status)}</span>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{user?.name}</span>{' '}
            <span className="text-gray-400">({user?.email})</span>
          </div>

          {message && (
            <p className="text-sm text-gray-400 italic mt-1 truncate">"{message}"</p>
          )}

          <p className="text-xs text-gray-400 mt-1">Applied {formatDate(createdAt)}</p>
        </div>
      </div>

      {/* Actions */}
      {status === 'pending' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onUpdate(_id, 'approved')}
            disabled={isUpdating}
            className="btn-primary text-sm py-1.5 px-4 flex items-center gap-1"
          >
            {isUpdating ? <Spinner size="sm" /> : '✓'} Approve
          </button>
          <button
            onClick={() => onUpdate(_id, 'rejected')}
            disabled={isUpdating}
            className="btn-danger text-sm py-1.5 px-4 flex items-center gap-1"
          >
            {isUpdating ? <Spinner size="sm" /> : '✗'} Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
