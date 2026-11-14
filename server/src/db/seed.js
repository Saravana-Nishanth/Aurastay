// Seeds a set of demo hotels across India so the list page has rich content to show.
// Photos live in server/uploads/seed and ship with the repo.
// Skips itself when the table already has rows, or pass --force to reseed.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool, q } = require('./pool');

const DEMO_HOTELS = [
  {
    title: 'Lake Pichola Heritage Suite',
    description:
      'A restored haveli room right on the water in Udaipur, with arched windows opening onto the City Palace skyline. Rooftop breakfast and a sunset boat ride are included with every stay.',
    price: 18500.0,
    latitude: 24.5764,
    longitude: 73.6835,
    image: '/uploads/seed/hotel-01.jpg',
  },
  {
    title: 'Candolim Beach House',
    description:
      'Two minutes on foot from Candolim beach, this airy Goan house has a shaded veranda and an outdoor shower. Comes with bicycles for the short ride to Sinquerim Fort.',
    price: 8500.0,
    latitude: 15.5156,
    longitude: 73.7655,
    image: '/uploads/seed/hotel-02.jpg',
  },
  {
    title: 'Mumbai Marine Drive Luxury Suites',
    description:
      'Compact business hotel on Marine Drive with floor-to-ceiling views over the Arabian Sea. Fast Wi-Fi, late checkout on request and a filter-coffee counter that never closes.',
    price: 14500.0,
    latitude: 18.9432,
    longitude: 72.8234,
    image: '/uploads/seed/hotel-03.jpg',
  },
  {
    title: 'Jaipur Haveli Boutique',
    description:
      'Twelve rooms wrapped around a 200-year-old courtyard in the old city. Hand-painted frescoes, a small plunge pool and rooftop dinners under the Aravalli sky.',
    price: 7200.0,
    latitude: 26.9124,
    longitude: 75.7873,
    image: '/uploads/seed/hotel-04.jpg',
  },
  {
    title: 'Manali Pine Lodge',
    description:
      'Timber cottages under deodar trees, ten minutes from Old Manali bridge. Wood-burning stoves in every room and paragliding pickup from the gate in season.',
    price: 5200.0,
    latitude: 32.2432,
    longitude: 77.1892,
    image: '/uploads/seed/hotel-05.jpg',
  },
  {
    title: 'Rishikesh Riverside Camp',
    description:
      'Safari tents on a sandy Ganga beach with morning yoga on the deck. Rafting runs leave twice a day and the bonfire kitchen serves till midnight.',
    price: 3600.0,
    latitude: 30.0869,
    longitude: 78.2676,
    image: '/uploads/seed/hotel-06.jpg',
  },
  {
    title: 'Kochi Backwater Villa',
    description:
      'A converted spice warehouse on the Fort Kochi shoreline, all teak and laterite. Chinese fishing nets are visible from the breakfast deck at high tide.',
    price: 6800.0,
    latitude: 9.9312,
    longitude: 76.2673,
    image: '/uploads/seed/hotel-07.jpg',
  },
  {
    title: 'Delhi Aerocity Transit Hotel',
    description:
      'Soundproofed rooms a five-minute shuttle from Terminal 3, booked in flexible hourly blocks. Ideal for layovers — wake-up calls, hot showers and a 24-hour gym.',
    price: 4900.0,
    latitude: 28.5562,
    longitude: 77.1,
    image: '/uploads/seed/hotel-08.jpg',
  },
  {
    title: 'Varanasi Ghat View Inn',
    description:
      'Balconies hang directly over Dashashwamedh Ghat, so the evening aarti happens right in front of you. Small, spotless rooms with jasmine-scented linen.',
    price: 3200.0,
    latitude: 25.3176,
    longitude: 82.9739,
    image: '/uploads/seed/hotel-09.jpg',
  },
  {
    title: 'Mysore Heritage Palace Residency',
    description:
      'Colonial-era bungalow a short walk from the Amba Vilas palace gates. Masala dosas at dawn, filter coffee all day, and a courtyard library for slow evenings.',
    price: 4400.0,
    latitude: 12.2958,
    longitude: 76.6394,
    image: '/uploads/seed/hotel-10.jpg',
  },
  {
    title: 'Bengaluru Silicon Valley Suites',
    description:
      'Modern tech-hub stay in Indiranagar with high-speed fiber internet, rooftop microbrewery access, ergonomic workstations, and garden terraces.',
    price: 6500.0,
    latitude: 12.9716,
    longitude: 77.5946,
    image: '/uploads/seed/hotel-11.jpg',
  },
  {
    title: 'Chennai Marina Beach Resort',
    description:
      'Coastal retreat located along East Coast Road overlooking the Bay of Bengal. Private beach cabanas, fresh Chettinad seafood dining, and infinity pool.',
    price: 5800.0,
    latitude: 13.0475,
    longitude: 80.2824,
    image: '/uploads/seed/hotel-12.jpg',
  },
  {
    title: 'Agra Taj View Palace',
    description:
      'Uninterrupted views of the iconic Taj Mahal from private balconies and the rooftop lounge. Mughal-inspired architecture with marble courtyards and sunset high tea.',
    price: 9800.0,
    latitude: 27.1751,
    longitude: 78.0421,
    image: '/uploads/seed/hotel-01.jpg',
  },
  {
    title: 'Ooty Nilgiri Tea Estate Villa',
    description:
      'Colonial-style planter bungalow nestled inside rolling tea gardens of the Blue Mountains. Fireplace in every bedroom, homemade scones, and toy train views.',
    price: 5600.0,
    latitude: 11.4102,
    longitude: 76.695,
    image: '/uploads/seed/hotel-02.jpg',
  },
  {
    title: 'Munnar Cloud Valley Resort',
    description:
      'Hillside chalets perched over misty cardamom valleys. Wake up above the clouds with guided plantation treks, birdwatching walks, and Ayurvedic spa sessions.',
    price: 6200.0,
    latitude: 10.0889,
    longitude: 77.0595,
    image: '/uploads/seed/hotel-03.jpg',
  },
  {
    title: 'Darjeeling Himalayan View Retreat',
    description:
      'Historic hillside lodge offering panoramic vistas of Mount Kanchenjunga. Fresh Darjeeling first-flush tea served on the glass-walled deck every morning.',
    price: 5400.0,
    latitude: 27.041,
    longitude: 88.2663,
    image: '/uploads/seed/hotel-04.jpg',
  },
  {
    title: 'Shimla Mall Road Heritage Lodge',
    description:
      'Victorian-era timber building located steps from Christ Church on the Ridge. Cedar forest walking trails, indoor heated conservatory, and evening bonfire storytelling.',
    price: 6800.0,
    latitude: 31.1048,
    longitude: 77.1734,
    image: '/uploads/seed/hotel-05.jpg',
  },
  {
    title: 'Pondicherry French Quarter Inn',
    description:
      'Restored Franco-Tamil villa with vibrant yellow mustard walls and bougainvillea balconies in White Town. Fresh croissants and espresso served in the sunlit atrium.',
    price: 4900.0,
    latitude: 11.934,
    longitude: 79.8306,
    image: '/uploads/seed/hotel-06.jpg',
  },
  {
    title: 'Hyderabad Royal Charminar Suites',
    description:
      'Nizami grandeur reimagined in Banjara Hills. Features artisanal Hyderabadi biryani masterclasses, crystal chandelier suites, and peaceful courtyard fountains.',
    price: 7400.0,
    latitude: 17.3616,
    longitude: 78.4747,
    image: '/uploads/seed/hotel-07.jpg',
  },
  {
    title: 'Kolkata Victoria Heritage Hotel',
    description:
      'Grand old-world landmark overlooking the Maidan park and Victoria Memorial. High-ceilinged suites with antique teak furniture and classic afternoon tea service.',
    price: 5800.0,
    latitude: 22.5448,
    longitude: 88.3426,
    image: '/uploads/seed/hotel-08.jpg',
  },
  {
    title: 'Jaisalmer Golden Dunes Camp',
    description:
      'Luxury Swiss desert tents in the Thar sand dunes. Evening folk dance performances under starlit desert skies, camel desert safaris, and traditional Rajasthani thali dinners.',
    price: 4500.0,
    latitude: 26.9157,
    longitude: 70.9083,
    image: '/uploads/seed/hotel-09.jpg',
  },
  {
    title: 'Amritsar Golden Temple Haven',
    description:
      'Serene hotel just 400 metres from Sri Harmandir Sahib. Offers complimentary electric shuttles to the temple complex, traditional Punjabi kulcha breakfasts, and peaceful rooms.',
    price: 3800.0,
    latitude: 31.62,
    longitude: 74.8765,
    image: '/uploads/seed/hotel-10.jpg',
  },
  {
    title: 'Andaman Havelock Coral Cove',
    description:
      'Beachfront eco-villas on Radhanagar Beach. White sand doorstep access, scuba diving reef excursions, fresh coconut water on arrival, and sunset cocktail cabanas.',
    price: 11500.0,
    latitude: 11.9761,
    longitude: 92.9876,
    image: '/uploads/seed/hotel-11.jpg',
  },
  {
    title: 'Coorg Coffee Country Cottage',
    description:
      'Rustic stone cottages inside an active 80-acre Robusta coffee plantation. River stream walks, Kodava homemade cuisine, and evening campfires with fresh brew tastings.',
    price: 5300.0,
    latitude: 12.3375,
    longitude: 75.8069,
    image: '/uploads/seed/hotel-12.jpg',
  },
  {
    title: 'Leh Ladakh Mountain View Inn',
    description:
      'Traditional Ladakhi mud-brick lodge with double-glazed glass windows looking directly at snow-capped Stok Kangri range. Oxygen-enriched suites and herbal Tibetan tea.',
    price: 6400.0,
    latitude: 34.1526,
    longitude: 77.5771,
    image: '/uploads/seed/hotel-01.jpg',
  },
  {
    title: 'Alappuzha Houseboat & Lagoon Resort',
    description:
      'Authentic Kerala backwater resort with private kettuvallam houseboats docked on the Vembanad Lake. Traditional Karimeen fish fry and sunset canoe trails.',
    price: 8200.0,
    latitude: 9.4981,
    longitude: 76.3388,
    image: '/uploads/seed/hotel-02.jpg',
  },
  {
    title: 'Shillong Pine Valley Resort',
    description:
      'Charming pine cottage retreat near Umiam Lake in Scotland of the East. Live acoustic music evenings, misty forest hiking trails, and locally sourced Khasi delicacies.',
    price: 4800.0,
    latitude: 25.5788,
    longitude: 91.8933,
    image: '/uploads/seed/hotel-03.jpg',
  },
  {
    title: 'Mahabalipuram Sea Shore Retreat',
    description:
      'Coastal sanctuary located near UNESCO Shore Temples. Stone-carved courtyards, seaside dining, yoga pavilions, and guided cycling tours through historic rock-cut sanctuaries.',
    price: 7600.0,
    latitude: 12.6269,
    longitude: 80.1927,
    image: '/uploads/seed/hotel-04.jpg',
  },
  {
    title: 'Pushkar Holy Lake Heritage Stay',
    description:
      'Whitewashed haveli overlooking the sacred Pushkar Sarovar. Rooftop meditation, organic cafe, colorful desert fair excursions, and panoramic sunset viewpoints.',
    price: 3600.0,
    latitude: 26.4897,
    longitude: 74.5511,
    image: '/uploads/seed/hotel-05.jpg',
  },
  {
    title: 'Gangtok Kanchenjunga Suites',
    description:
      'Contemporary mountain-facing hotel near MG Marg. Large bay windows framing the Himalayan range, heated bathroom floors, and traditional Sikkimese momos on order.',
    price: 5900.0,
    latitude: 27.3389,
    longitude: 88.6065,
    image: '/uploads/seed/hotel-06.jpg',
  },
  {
    title: 'Kaziranga Jungle Safari Lodge',
    description:
      'Thatch-roofed stilt cottages on the edge of Kaziranga National Park. Early morning elephant safari bookings, rhino spotting vantage decks, and Assamese tea garden strolls.',
    price: 6700.0,
    latitude: 26.5775,
    longitude: 93.1711,
    image: '/uploads/seed/hotel-07.jpg',
  },
  {
    title: 'Khajuraho Temple Sanctuary',
    description:
      'Peaceful garden resort surrounded by mango groves, located 5 minutes from the Western Group of Temples. Swimming pool, spa, and guided archaeological walking tours.',
    price: 4300.0,
    latitude: 24.8318,
    longitude: 79.9199,
    image: '/uploads/seed/hotel-08.jpg',
  },
];

async function main() {
  const force = process.argv.includes('--force');
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM hotels');

  if (force) {
    await pool.query('TRUNCATE TABLE hotels RESTART IDENTITY CASCADE');
    console.log('Cleared existing hotels table for fresh seed.');
  } else if (rows[0].count > 0) {
    console.log(
      `Table "hotels" already has ${rows[0].count} row(s) — skipping seed. Run "npm run db:reseed" to replace with all ${DEMO_HOTELS.length} Indian hotels.`
    );
    return;
  }

  for (const hotel of DEMO_HOTELS) {
    await q(
      `INSERT INTO hotels (title, description, price, latitude, longitude, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [hotel.title, hotel.description, hotel.price, hotel.latitude, hotel.longitude, hotel.image]
    );
  }
  console.log(`Seeded ${DEMO_HOTELS.length} hotels in India with INR pricing.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
