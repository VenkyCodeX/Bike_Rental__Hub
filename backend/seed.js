require('dotenv').config();
const mongoose = require('mongoose');
const Bike     = require('./models/Bike');
const connectDB = require('./config/db');

const SEED_BIKES = [
  { name: 'Royal Enfield Classic 350', category: 'cruiser',  price: 699, location: 'Balkampet', status: 'available', img: 'assets/Royal Enfield.jpeg', rating: 4.8, reviews: 124, badge: 'Popular',  engine: '349cc', desc: 'Iconic cruiser with timeless style and powerful engine.' },
  { name: 'KTM Duke 250',              category: 'sport',    price: 799, location: 'Balkampet', status: 'available', img: 'assets/Duke 250.jpeg',      rating: 4.7, reviews: 67,  badge: 'Premium',  engine: '248cc', desc: 'Aggressive sport bike built for thrill seekers.' },
  { name: 'Yamaha R15',                category: 'sport',    price: 649, location: 'Balkampet', status: 'available', img: 'assets/Yamaha R15.jpeg',    rating: 4.6, reviews: 54,  badge: 'Hot',      engine: '155cc', desc: 'Sporty full-fairing bike with refined performance.' },
];

const seed = async () => {
  await connectDB();
  await Bike.deleteMany({});
  await Bike.insertMany(SEED_BIKES);
  console.log(`✅ Seeded ${SEED_BIKES.length} bikes`);
  process.exit(0);
};

seed();
