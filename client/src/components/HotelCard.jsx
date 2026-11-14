import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import { PencilIcon, TrashIcon } from './icons';

export default function HotelCard({ hotel, onDelete }) {
  return (
    <article className="card hotel-card">
      <Link to={`/hotels/${hotel.id}`} className="hotel-card__img-link" aria-label={`View ${hotel.title}`}>
        <img className="hotel-card__img" src={hotel.image_url} alt={hotel.title} loading="lazy" />
      </Link>

      <div className="hotel-card__body">
        <h3 className="hotel-card__title">
          <Link to={`/hotels/${hotel.id}`}>{hotel.title}</Link>
        </h3>

        <p className="hotel-card__desc">{hotel.description}</p>

        <p className="hotel-card__price">{formatPrice(hotel.price)}</p>

        <div className="hotel-card__actions">
          <Link className="btn btn--primary btn--sm" to={`/hotels/${hotel.id}`}>
            View details
          </Link>

          <div className="hotel-card__tools">
            <Link className="icon-btn" to={`/hotels/${hotel.id}/edit`} aria-label={`Edit ${hotel.title}`} title="Edit">
              <PencilIcon />
            </Link>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => onDelete(hotel)}
              aria-label={`Delete ${hotel.title}`}
              title="Delete"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
