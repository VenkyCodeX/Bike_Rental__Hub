const mongoose = require('mongoose');

const BikeSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  category:         { type: String, required: true, enum: ['cruiser', 'sport', 'scooter', 'adventure', 'commuter'] },
  price:            { type: Number, required: true, min: 1 },
  location:         { type: String, required: true, trim: true },
  status:           { type: String, enum: ['available', 'rented', 'maintenance'], default: 'available' },
  img:              { type: String, default: 'assets/placeholder.svg' },
  badge:            { type: String, default: 'Available' },
  rating:           { type: Number, default: 4.5, min: 0, max: 5 },
  reviews:          { type: Number, default: 0 },
  engine:           { type: String, default: '' },
  desc:             { type: String, default: '' },
  // Status dates
  maintenanceFrom:  { type: String, default: '' },
  maintenanceUntil: { type: String, default: '' },
  rentedFrom:       { type: String, default: '' },
  rentedUntil:      { type: String, default: '' },
  // New card fields
  transmission:     { type: String, default: 'Manual' },
  seats:            { type: String, default: '2 Seater' },
  fuelType:         { type: String, default: 'Petrol' },
  availableAt:      { type: String, default: '' },
  kmLimit:          { type: Number, default: 0 },
  extraPerKm:       { type: Number, default: 0 },
  fuelIncluded:     { type: Boolean, default: false },
  deposit:          { type: Number, default: 0 },
  manufacturedYear: { type: String, default: '' },
  payAtPickup:      { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Bike', BikeSchema);
