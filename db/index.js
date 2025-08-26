// const knex = require('knex');
// require('dotenv').config() 

// const {DB_HOST , DB_USER , DB_PASSWORD , DB_PORT , DB_NAME , DB_TIMEZONE} = process.env
// // const DB_USER = process.env.DB_USER ได้เหมือนกัน

// // console.log(DB_USER + DB_PASSWORD)
// const db = knex.default({
//     client: 'mysql2',
//     connection: {
//         user: DB_USER,
//         password: DB_PASSWORD,
//         host: DB_HOST,
//         port: DB_PORT,
//         database: DB_NAME,
//         timezone: DB_TIMEZONE
//     }
// })
// module.exports = db;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config() 
const {MONGODB_USERNAME , MONGODB_PASSWORD} = process.env
const uri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@expressfeelgay.5rpy0qx.mongodb.net/?retryWrites=true&w=majority&appName=ExpressFeelgay"`

const db = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function connectDB() {
  try {
    await db.connect();
    console.log('✅ MongoDB connected')
    return db.db(process.env.MONGODB_DBNAME);
    } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

module.exports = connectDB;