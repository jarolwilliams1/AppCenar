const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_CONECTION || 'mongodb://127.0.0.1:27017/AppCenarDB_Dev';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(' Conexión a MongoDB exitosa en:', uri);
  } catch (error) {
    console.error('===============================================================');
    console.error(' Error de conexión a MongoDB (ECONNREFUSED):');
    console.error('El servidor MongoDB no está corriendo en el puerto 27017.');
    console.error(' Para iniciarlo en Windows:');
    console.error('   1. Abre una terminal y ejecuta: mongod --dbpath C:\\data\\db');
    console.error('   2. O inicia el servicio: net start MongoDB');
    console.error('===============================================================');
    throw error;
  }
}

module.exports = { connectDB };
