import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotel, clearCurrent } from '../features/hotels/hotelsSlice';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { formatPrice, formatCoord, formatDate } from '../utils/format';
import { ArrowLeftIcon, MapPinIcon, PhotoIcon, ExternalLinkIcon } from '../components/icons';

export default function HotelDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: hotel, currentStatus } = useSelector((state) => state.hotels);
  const [viewMode, setViewMode] = useState('photo'); // 'photo' | 'map'

  useEffect(() => {
    dispatch(fetchHotel(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  if (currentStatus !== 'succeeded') {
    return (
      <div className="container page">
        {currentStatus === 'failed' ? (
          <EmptyState title="Hotel not found" text="It may have been deleted, or the link is wrong.">
            <Link to="/" className="btn btn--primary">
              Back to all hotels
            </Link>
          </EmptyState>
        ) : (
          <Spinner label="Loading hotel…" />
        )}
      </div>
    );
  }

  const mapEmbedUrl = `https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&hl=en&z=15&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`;

  return (
    <>
      <Helmet>
        <title>{hotel.title} — AuraStay</title>
        <meta name="description" content={hotel.description.slice(0, 155)} />
        <meta property="og:title" content={hotel.title} />
        <meta property="og:description" content={hotel.description.slice(0, 155)} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={hotel.image_url} />
      </Helmet>

      <div className="container page">
        <Link to="/" className="back-link">
          <ArrowLeftIcon aria-hidden="true" /> Back to all hotels
        </Link>

        <div className="details-grid">
          <div className="details-media">
            <div className="details-media__tabs" role="tablist" aria-label="Media view options">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'photo'}
                className={`details-media__tab ${viewMode === 'photo' ? 'active' : ''}`}
                onClick={() => setViewMode('photo')}
              >
                <PhotoIcon aria-hidden="true" /> Photo
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'map'}
                className={`details-media__tab ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <MapPinIcon aria-hidden="true" /> Map
              </button>
            </div>

            <div className="details-media__content">
              {viewMode === 'photo' ? (
                <img className="details-img" src={hotel.image_url} alt={hotel.title} />
              ) : (
                <div className="details-map-wrapper">
                  <iframe
                    title={`Map location of ${hotel.title}`}
                    className="details-map-frame"
                    src={mapEmbedUrl}
                    loading="lazy"
                    allowFullScreen
                  />
                  <div className="details-map-bar">
                    <span className="details-map-coords">
                      <MapPinIcon aria-hidden="true" /> {formatCoord(hotel.latitude)}, {formatCoord(hotel.longitude)}
                    </span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="details-map-link"
                    >
                      Open in Google Maps <ExternalLinkIcon aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="details-info">
            <h1>{hotel.title}</h1>
            <p className="details-price">
              {formatPrice(hotel.price)} <span>per night</span>
            </p>
            <p className="details-desc">{hotel.description}</p>

            <dl className="details-meta">
              <div
                className="details-meta__item details-meta__item--clickable"
                onClick={() => setViewMode('map')}
                title="Click to view on map"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setViewMode('map')}
              >
                <dt>Latitude</dt>
                <dd>{formatCoord(hotel.latitude)}</dd>
              </div>
              <div
                className="details-meta__item details-meta__item--clickable"
                onClick={() => setViewMode('map')}
                title="Click to view on map"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setViewMode('map')}
              >
                <dt>Longitude</dt>
                <dd>{formatCoord(hotel.longitude)}</dd>
              </div>
              <div>
                <dt>Added on</dt>
                <dd>{formatDate(hotel.created_at)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(hotel.updated_at)}</dd>
              </div>
            </dl>

            <div className="details-actions">
              <Link to={`/hotels/${hotel.id}/edit`} className="btn btn--primary">
                Edit this hotel
              </Link>
              <button
                type="button"
                className={`btn ${viewMode === 'map' ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setViewMode(viewMode === 'photo' ? 'map' : 'photo')}
              >
                <MapPinIcon aria-hidden="true" />
                {viewMode === 'map' ? 'Show Photo' : 'Show on Map'}
              </button>
              {viewMode === 'map' && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline"
                  title="Open full Google Maps in new tab"
                >
                  <ExternalLinkIcon aria-hidden="true" /> Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
