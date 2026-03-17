import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import PetCard from '../components/PetCard';
import Loader from '../components/Loader';
import { buildQueryString, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const SPECIES_OPTIONS = ['dog', 'cat', 'bird', 'rabbit', 'other'];

const Home = () => {
  const [pets, setPets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    species: '',
    breed: '',
    minAge: '',
    maxAge: '',
    status: 'available',
  });

  const [page, setPage] = useState(1);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQueryString({ ...filters, page, limit: 9 });
      const { data } = await api.get(`/pets?${qs}`);
      setPets(data.pets);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // reset to page 1 when filters change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPets();
  };

  const clearFilters = () => {
    setFilters({ search: '', species: '', breed: '', minAge: '', maxAge: '', status: 'available' });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Find Your Perfect Companion 🐾
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Browse our adorable pets waiting for a loving home. Filter by species, age, or breed to find your match.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name, breed, or description..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary px-6">
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <select
            name="species"
            value={filters.species}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All species</option>
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="breed"
            value={filters.breed}
            onChange={handleFilterChange}
            placeholder="Breed"
            className="input-field"
          />

          <input
            type="number"
            name="minAge"
            value={filters.minAge}
            onChange={handleFilterChange}
            placeholder="Min age"
            min="0"
            className="input-field"
          />

          <input
            type="number"
            name="maxAge"
            value={filters.maxAge}
            onChange={handleFilterChange}
            placeholder="Max age"
            min="0"
            className="input-field"
          />

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="adopted">Adopted</option>
          </select>
        </div>

        <button onClick={clearFilters} className="mt-3 text-sm text-gray-400 hover:text-orange-500 transition-colors">
          Clear filters
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${pagination.total} pet${pagination.total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Pet Grid */}
      {loading ? (
        <Loader message="Fetching pets..." />
      ) : pets.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pets.map((pet) => (
            <PetCard key={pet._id} pet={pet} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`py-1.5 px-3.5 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
            disabled={page === pagination.pages}
            className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="text-6xl mb-4">🐾</div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">No pets found</h3>
    <p className="text-gray-400 text-sm">Try adjusting your search filters</p>
  </div>
);

export default Home;
