import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { capitalize, formatDate, getErrorMessage } from '../utils/helpers';
import Loader, { Spinner } from '../components/Loader';

const SPECIES_EMOJI = {
  dog: '🐶',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

const PetDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await api.get(`/pets/${id}`);
        setPet(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id, navigate]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please log in to apply for adoption');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await api.post(`/adoption/${id}`, { message });
      toast.success('Application submitted successfully! 🎉');
      // Refresh pet to show updated status
      const { data } = await api.get(`/pets/${id}`);
      setPet(data);
      setMessage('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader message="Loading pet details..." />;
  if (!pet) return null;

  const statusClass = {
    available: 'badge-available',
    pending: 'badge-pending',
    adopted: 'badge-adopted',
  }[pet.status];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-orange-500 mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back to listings
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left — Image */}
        <div className="rounded-2xl overflow-hidden bg-orange-50 h-72 md:h-[420px] w-full flex items-center justify-center flex-shrink-0">
          {pet.image ? (
            <img
              src={pet.image}
              alt={pet.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <span className="text-9xl">{SPECIES_EMOJI[pet.species] || '🐾'}</span>
          )}
        </div>

        {/* Right — Details */}
        <div className="flex flex-col gap-4">

          {/* Name + status */}
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-800">{pet.name}</h1>
            <span className={statusClass}>{capitalize(pet.status)}</span>
          </div>

          {/* Info grid — compact */}
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="Species" value={capitalize(pet.species)} />
            <InfoItem label="Breed" value={pet.breed} />
            <InfoItem
              label="Age"
              value={pet.age === 0 ? 'Under 1 yr' : `${pet.age} ${pet.age === 1 ? 'yr' : 'yrs'}`}
            />
            <InfoItem label="Added on" value={formatDate(pet.createdAt)} />
          </div>

          {/* Description */}
          {pet.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">About</p>
              <p className="text-sm text-gray-600 leading-relaxed">{pet.description}</p>
            </div>
          )}

          {/* Adoption form */}
          {pet.status === 'available' && user?.role !== 'admin' && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Interested in adopting {pet.name}?
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Why would you be a great match? (optional)"
                rows={2}
                className="input-field mb-2 resize-none text-sm"
              />
              <button
                onClick={handleApply}
                disabled={applying}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2"
              >
                {applying ? <Spinner size="sm" /> : null}
                {applying ? 'Submitting...' : `Apply to Adopt ${pet.name}`}
              </button>
            </div>
          )}

          {pet.status === 'pending' && (
            <div className="bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-200 text-yellow-700 text-sm">
              ⏳ This pet has a pending adoption review.
            </div>
          )}

          {pet.status === 'adopted' && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 text-blue-700 text-sm">
              🏠 {pet.name} has found a loving home!
            </div>
          )}

          {!user && pet.status === 'available' && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-sm text-gray-500">
              <button
                onClick={() => navigate('/login')}
                className="text-orange-500 font-medium hover:underline"
              >
                Sign in
              </button>{' '}
              to apply for adoption.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg px-3 py-2">
    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">{label}</p>
    <p className="text-sm text-gray-700 font-semibold">{value}</p>
  </div>
);

export default PetDetails;
