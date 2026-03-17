import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { capitalize, formatDate, getErrorMessage } from '../utils/helpers';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdoptions = async () => {
      try {
        const { data } = await api.get('/adoption');
        setAdoptions(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchAdoptions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Hello, <span className="font-medium text-gray-700">{user?.name}</span> — here are all your adoption requests.
        </p>
      </div>

      {loading ? (
        <Loader message="Loading your applications..." />
      ) : adoptions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {adoptions.map((adoption) => (
            <AdoptionCard key={adoption._id} adoption={adoption} />
          ))}
        </div>
      )}
    </div>
  );
};

const AdoptionCard = ({ adoption }) => {
  const { pet, status, message, createdAt } = adoption;

  const statusClass = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }[status];

  const SPECIES_EMOJI = { dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰', other: '🐾' };

  return (
    <div className="card p-5 flex items-start gap-4">
      {/* Pet thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {pet?.image ? (
          <img src={pet.image} alt={pet.name} className="w-full h-full object-cover object-center" />
        ) : (
          <span className="text-3xl">{SPECIES_EMOJI[pet?.species] || '🐾'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <Link
              to={`/pets/${pet?._id}`}
              className="font-semibold text-gray-800 hover:text-orange-500 transition-colors"
            >
              {pet?.name}
            </Link>
            <p className="text-sm text-gray-400 mt-0.5">
              {capitalize(pet?.species)} · {pet?.breed}
            </p>
          </div>
          <span className={statusClass}>{capitalize(status)}</span>
        </div>

        {message && (
          <p className="text-sm text-gray-500 mt-2 italic truncate">"{message}"</p>
        )}

        <p className="text-xs text-gray-400 mt-2">Applied on {formatDate(createdAt)}</p>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="text-6xl mb-4">📋</div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
    <p className="text-gray-400 text-sm mb-6">Browse our available pets and apply for adoption</p>
    <Link to="/" className="btn-primary inline-block">
      Browse Pets
    </Link>
  </div>
);

export default Dashboard;
