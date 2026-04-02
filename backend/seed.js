require('dotenv').config();
const mongoose = require('mongoose');
const Bike     = require('./models/Bike');
const connectDB = require('./config/db');

const SEED_BIKES = [
  { name: 'Royal Enfield Classic 350', category: 'cruiser',   price: 699, location: 'Balkampet', status: 'available', img: 'assets/Royal-Enfield.webp', rating: 4.8, reviews: 124, badge: 'Popular',   engine: '349cc', desc: 'Iconic cruiser with timeless style and powerful engine.' },
  { name: 'Honda Activa 6G',           category: 'scooter',   price: 299, location: 'Balkampet', status: 'available', img: 'assets/Activa.webp',        rating: 4.5, reviews: 210, badge: 'Popular',   engine: '109cc', desc: 'India\'s best-selling scooter. Smooth, reliable, fuel-efficient.' },
  { name: 'Honda CB Shine',            category: 'commuter',  price: 349, location: 'Balkampet', status: 'available', img: 'assets/Honda.webp',         rating: 4.6, reviews: 89,  badge: 'Hot',        engine: '124cc', desc: 'Reliable commuter bike with excellent mileage.' },
  { name: 'KTM Duke 200',              category: 'sport',     price: 799, location: 'Balkampet', status: 'available', img: 'assets/KTM.webp',           rating: 4.7, reviews: 67,  badge: 'Premium',   engine: '199cc', desc: 'Aggressive sport bike built for thrill seekers.' },
  { name: 'Bajaj Pulsar NS200',        category: 'sport',     price: 599, location: 'Balkampet', status: 'available', img: 'assets/Pulsar.webp',        rating: 4.5, reviews: 98,  badge: 'Hot',        engine: '199cc', desc: 'Sporty naked street fighter with punchy performance.' },
  { name: 'Suzuki Gixxer',             category: 'sport',     price: 649, location: 'Balkampet', status: 'available', img: 'assets/Suzuki.webp',        rating: 4.4, reviews: 54,  badge: 'Available',  engine: '155cc', desc: 'Sleek and sporty with refined performance.' },
  { name: 'Suzuki Access 125',         category: 'scooter',   price: 279, location: 'Balkampet', status: 'available', img: 'assets/Suzuki2.webp',       rating: 4.3, reviews: 42,  badge: 'New',        engine: '124cc', desc: 'Premium scooter with smooth ride and great mileage.' },
];

const seed = async () => {
  await connectDB();
  await Bike.deleteMany({});
  await Bike.insertMany(SEED_BIKES);
  console.log(`✅ Seeded ${SEED_BIKES.length} bikes`);
  process.exit(0);
};

seed();
