import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { Slot } from '../types';

type NearbyShop = {
  _id: string;
  name: string;
  code: string;
  address: {
    street?: string;
    city?: string;
    pincode?: string;
    coordinates?: { lat: number; lng: number };
  };
  operatingHours?: { open: string; close: string };
  rating?: number;
  distanceKm: number | null;
  isNearby: boolean;
};

const RADIUS_KM = 3;

const BookSlot = () => {
  const [nearby, setNearby] = useState<NearbyShop[]>([]);
  const [others, setOthers] = useState<NearbyShop[]>([]);
  const [allShops, setAllShops] = useState<NearbyShop[]>([]);
  const [selectedShop, setSelectedShop] = useState<NearbyShop | null>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<(Slot & { available: boolean })[]>([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [rationCollected, setRationCollected] = useState(false);
  const [bookingInFlight, setBookingInFlight] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    api.get('/distributions/my-history')
      .then(({ data }) => {
        const distributions: any[] = data.distributions || [];
        const collected = distributions.some(
          (d) => d.month === currentMonth && d.year === currentYear
        );
        setRationCollected(collected);
      })
      .catch(() => {});
  }, []);

  // Fallback: load all shops without geolocation (no distance info)
  useEffect(() => {
    api.get('/queue/shops-list')
      .then(({ data }) => {
        const shops: NearbyShop[] = (data.shops || []).map((s: any) => ({
          ...s,
          distanceKm: null,
          isNearby: false,
        }));
        setAllShops(shops);
      })
      .catch(() => {});
  }, []);

  const fetchNearby = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation not supported in this browser');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        try {
          const { data } = await api.get('/shops/nearby', {
            params: { lat: latitude, lng: longitude, radius: RADIUS_KM },
          });
          setNearby(data.nearby || []);
          setOthers(data.others || []);
          setLocationFetched(true);
          toast.success(
            data.nearbyCount > 0
              ? `Found ${data.nearbyCount} shops within ${RADIUS_KM} km`
              : `No shops within ${RADIUS_KM} km — showing nearest`
          );
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to fetch nearby shops');
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Please enable location to see nearby shops.'
            : 'Could not determine your location';
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchSlots = async () => {
    if (!selectedShop || !date) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/queue/available-slots/${selectedShop._id}/${date}`);
      setSlots(data.slots);
    } catch {
      toast.error('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId: string) => {
    if (!selectedShop || bookingInFlight) return;
    setBookingInFlight(true);
    try {
      const { data } = await api.post('/queue/book-slot', {
        shopId: selectedShop._id,
        date,
        slotId,
      });
      toast.success(`Booked! Ticket: ${data.ticketNumber} | Position: ${data.position}`);
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingInFlight(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const ShopCard = ({ shop }: { shop: NearbyShop }) => {
    const isSelected = selectedShop?._id === shop._id;
    return (
      <button
        onClick={() => setSelectedShop(shop)}
        className={`text-left bg-white rounded-xl p-4 border-2 transition-all hover:shadow-md ${
          isSelected
            ? 'border-primary-600 ring-2 ring-primary-200 shadow-lg'
            : 'border-gray-200 hover:border-primary-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{shop.code}</p>
          </div>
          {shop.distanceKm !== null && (
            <span
              className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                shop.isNearby
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 10a5 5 0 11-10 0 5 5 0 0110 0zM12 22s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z" />
              </svg>
              {shop.distanceKm} km
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">
          {shop.address?.street}, {shop.address?.city}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {shop.operatingHours && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {shop.operatingHours.open}–{shop.operatingHours.close}
            </span>
          )}
          {shop.rating && shop.rating > 0 && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
              {shop.rating.toFixed(1)}
            </span>
          )}
        </div>
      </button>
    );
  };

  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book a Time Slot</h1>
          <p className="text-sm text-gray-500 mt-1">
            Find the nearest Fair Price Shop and reserve your slot
          </p>
        </div>
      </div>

      {rationCollected && (
        <div className="flex items-start gap-4 bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6">
          <div className="w-10 h-10 flex-shrink-0 bg-amber-400 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-amber-900">Ration collected for {currentMonthName}</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your ration has already been distributed this month. Slot booking will be available again from the 1st of next month.
            </p>
          </div>
        </div>
      )}

      {/* Location CTA */}
      {!locationFetched && (
        <div className="bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 10a5 5 0 11-10 0 5 5 0 0110 0zM12 22s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z" />
              </svg>
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-semibold text-gray-900">Find shops nearby</h2>
              <p className="text-sm text-gray-600 mt-1">
                Allow location access — we'll show FPS shops within {RADIUS_KM} km first, with exact distance for each.
              </p>
            </div>
            <button
              onClick={fetchNearby}
              disabled={locLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-60 flex items-center gap-2"
            >
              {locLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Locating…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M12 2a10 10 0 11-9.9 11.6M5 5l3 3M2 12h3" />
                  </svg>
                  Use my location
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Shop listings */}
      {locationFetched ? (
        <>
          {/* Nearby shops */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Near you</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  within {RADIUS_KM} km
                </span>
              </div>
              <button
                onClick={fetchNearby}
                className="text-sm text-primary-600 hover:underline font-medium"
              >
                Refresh
              </button>
            </div>
            {nearby.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nearby.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                No FPS shops found within {RADIUS_KM} km of your location. See the nearest shops below.
              </div>
            )}
          </div>

          {/* Other shops */}
          {others.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Other shops</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {others.slice(0, 12).map((shop) => <ShopCard key={shop._id} shop={shop} />)}
              </div>
              {others.length > 12 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Showing 12 of {others.length} other shops · use location to see closer ones
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        // No geolocation yet — show plain list
        allShops.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">All shops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allShops.slice(0, 12).map((shop) => <ShopCard key={shop._id} shop={shop} />)}
            </div>
          </div>
        )
      )}

      {/* Date + View slots + Map preview */}
      {selectedShop && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: shop info + date picker */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary-600 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Selected shop</p>
                  <p className="font-semibold text-gray-900">{selectedShop.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedShop.address?.street}, {selectedShop.address?.city} · {selectedShop.code}
                    {selectedShop.distanceKm !== null && (
                      <span className="ml-2 text-emerald-700 font-semibold">
                        {selectedShop.distanceKm} km away
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchSlots}
                    disabled={!date || loading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Loading slots…' : 'View Available Slots'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: map preview */}
            {selectedShop.address?.coordinates && (
              <div className="lg:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.5-2.2V4l5.5 2.2M9 20l6-2.2M9 20V6.2M15 17.8l5.5 2.2V6.2L15 4M15 17.8V4M15 4L9 6.2" />
                  </svg>
                  Location
                </p>
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
                  {(() => {
                    const { lat, lng } = selectedShop.address!.coordinates!;
                    const d = 0.006;
                    const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
                    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
                    const viewUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
                    return (
                      <>
                        <iframe
                          key={selectedShop._id}
                          title={`Map — ${selectedShop.name}`}
                          src={embedUrl}
                          className="w-full h-48 md:h-56 border-0"
                          loading="lazy"
                        />
                        <a
                          href={viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-xs font-medium text-primary-700 px-3 py-1.5 rounded-lg shadow hover:bg-white opacity-0 group-hover:opacity-100 transition"
                        >
                          Open in OpenStreetMap ↗
                        </a>
                      </>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {selectedShop.address.coordinates.lat.toFixed(4)}, {selectedShop.address.coordinates.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slots grid */}
      {slots.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Available slots</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <div
                key={slot.slotId}
                className={`rounded-xl border-2 p-5 transition ${
                  slot.available
                    ? 'border-green-300 bg-green-50 hover:shadow-md'
                    : 'border-red-200 bg-red-50/70 opacity-75'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-800">{slot.slotId}</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      slot.available ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {slot.available ? 'Available' : 'Full'}
                  </span>
                </div>
                <p className="text-gray-700 font-medium">
                  {slot.startTime} – {slot.endTime}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {slot.currentCount}/{slot.capacity} booked
                </p>
                {slot.available && (
                  <button
                    onClick={() => bookSlot(slot.slotId)}
                    disabled={rationCollected || bookingInFlight}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {bookingInFlight ? 'Booking...' : 'Book This Slot'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state: location fetched but no shop selected */}
      {locationFetched && !selectedShop && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500">
          Select a shop above to see available slots.
        </div>
      )}

    </div>
  );
};

export default BookSlot;
