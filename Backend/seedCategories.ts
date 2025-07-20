import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category';

dotenv.config();

const categories = [
  { name: 'Alimentação', color: '#FF9800' },
  { name: 'Transporte', color: '#03A9F4' },
  { name: 'Saúde', color: '#4CAF50' },
  { name: 'Moradia', color: '#9C27B0' },
  { name: 'Lazer', color: '#E91E63' },
  { name: 'Educação', color: '#00BCD4' },
  { name: 'Outros', color: '#607D8B' }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI ?? '');
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log('Categorias inseridas com sucesso!');
  process.exit();
}

seed();
