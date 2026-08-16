// getting-started.js
const mongoose = require('mongoose');



async function connectDB() {
    try{

         await mongoose.connect(process.env.MONGO_CONECTION);
  console.log("conexion a mongodb exitosa");

}catch(error)
{
    console.error("error de conexion a mongodb: ", error);
    process.exit(1);

};
 

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};

module.exports = {connectDB};