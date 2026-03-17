import { Link } from 'react-router-dom';
import { capitalize } from '../utils/helpers';

const SPECIES_EMOJI = {
  dog: '🐶',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

const PetCard = ({ pet }) => {
  const { _id, name, species, breed, age, image, status } = pet;

  const statusClass = {
    available: 'badge-available',
    pending: 'badge-pending',
    adopted: 'badge-adopted',
  }[status] || 'badge';

  return (
    <Link to={`/pets/${_id}`} className="card block group overflow-hidden">
      {/* Pet image */}
      <div className="relative h-36 bg-orange-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {SPECIES_EMOJI[species] || '🐾'}
          </div>
        )}
        <span className={`absolute top-2 right-2 ${statusClass} text-[10px] px-2 py-0.5`}>
          {capitalize(status)}
        </span>
      </div>

      {/* Pet info */}
      <div className="px-3 py-2.5">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {capitalize(species)} · {breed}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {age === 0 ? 'Under 1 yr' : `${age} ${age === 1 ? 'yr' : 'yrs'} old`}
          </span>
          <span className="text-orange-500 text-xs font-medium group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PetCard;
