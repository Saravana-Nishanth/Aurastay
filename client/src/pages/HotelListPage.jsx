import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, deleteHotel, setFilter, PAGE_SIZE } from '../features/hotels/hotelsSlice';
import { showToast } from '../features/ui/uiSlice';
import useDebounce from '../hooks/useDebounce';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { SearchIcon } from '../components/icons';

export default function HotelListPage() {
  const dispatch = useDispatch();
  const { items, total, listStatus, listError, filters } = useSelector((state) => state.hotels);

  // The search box keeps its own local value and only lands in the store
  // after the user stops typing — the rest of the filters go straight in.
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilter({ name: 'search', value: debouncedSearch }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const offset = (filters.page - 1) * PAGE_SIZE;

  useEffect(() => {
    dispatch(
      fetchHotels({
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        limit: PAGE_SIZE,
        offset,
      })
    );
  }, [dispatch, filters.search, filters.minPrice, filters.maxPrice, filters.page, offset]);

  // Deleted the only hotel on this page? Step back one page instead of
  // staring at an empty grid.
  useEffect(() => {
    if (listStatus === 'succeeded' && items.length === 0 && filters.page > 1) {
      dispatch(setFilter({ name: 'page', value: filters.page - 1 }));
    }
  }, [listStatus, items.length, filters.page, dispatch]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteHotel(pendingDelete.id)).unwrap();
      dispatch(showToast('Hotel deleted successfully.'));
      // The slice already dropped the row, but pulling the current page again
      // lets the next listing slide into the emptied slot (and re-syncs total).
      dispatch(
        fetchHotels({
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          limit: PAGE_SIZE,
          offset,
        })
      );
    } catch {
      dispatch(showToast('Could not delete this hotel. Please try again.', 'error'));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const hasFilters = filters.search || filters.minPrice || filters.maxPrice;

  return (
    <>
      <Helmet>
        <title>AuraStay — Browse hotel listings</title>
        <meta
          name="description"
          content="Search hotels by title and price, view photos and details, and manage your own listings."
        />
        <meta property="og:title" content="AuraStay — Browse hotel listings" />
        <meta
          property="og:description"
          content="Search hotels by title and price, view photos and details, and manage your own listings."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container page">
        <div className="page-head">
          <div>
            <h1>Find your next stay</h1>
            <p className="page-sub">
              {listStatus === 'succeeded' ? `${total} hotel${total === 1 ? '' : 's'} available` : 'Loading…'}
            </p>
          </div>
          <Link to="/hotels/add" className="btn btn--primary">
            + Add Hotel
          </Link>
        </div>

        <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
          <label className="filters__search">
            <SearchIcon aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by title…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search hotels by title"
            />
          </label>

          <label className="filters__price">
            <span>Min $</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => dispatch(setFilter({ name: 'minPrice', value: e.target.value }))}
              aria-label="Minimum price"
            />
          </label>

          <label className="filters__price">
            <span>Max $</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => dispatch(setFilter({ name: 'maxPrice', value: e.target.value }))}
              aria-label="Maximum price"
            />
          </label>

          {hasFilters ? (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                setSearchInput('');
                dispatch(setFilter({ name: 'search', value: '' }));
                dispatch(setFilter({ name: 'minPrice', value: '' }));
                dispatch(setFilter({ name: 'maxPrice', value: '' }));
              }}
            >
              Clear
            </button>
          ) : null}
        </form>

        {listStatus === 'loading' ? (
          <Spinner label="Loading hotels…" />
        ) : listError ? (
          <EmptyState title="Something went wrong" text={listError} />
        ) : items.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No hotels match your filters' : 'No hotels yet'}
            text={
              hasFilters
                ? 'Try a different search term or widen the price range.'
                : 'Once a hotel is added it will show up here.'
            }
          >
            {!hasFilters ? (
              <Link to="/hotels/add" className="btn btn--primary">
                Add the first hotel
              </Link>
            ) : null}
          </EmptyState>
        ) : (
          <>
            <div className="card-grid">
              {items.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onDelete={setPendingDelete} />
              ))}
            </div>

            <Pagination
              page={filters.page}
              pageSize={PAGE_SIZE}
              total={total}
              onPage={(p) => dispatch(setFilter({ name: 'page', value: p }))}
            />
          </>
        )}
      </div>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete this hotel?"
        message={`"${pendingDelete?.title ?? ''}" and its photo will be removed permanently.`}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
