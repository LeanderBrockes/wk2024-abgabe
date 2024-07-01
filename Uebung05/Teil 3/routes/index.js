var express = require('express');
const fileUpload = require('express-fileupload');
var router = express.Router();

const { MongoClient } = require('mongodb')
const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'db05_3' // database name
const collectionName = 'uebung05_3' // collection name


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

// Database
router.use(fileUpload())

// handling post request
router.post('/', (req, res) => {
  console.log('receiving data ...')
  let dataIn = req.files.input_data
  let buffer = dataIn.data

  console.log(buffer.toString())
  saveDataDB(JSON.parse(buffer.toString()))

  res.render('index', { title: 'Home' });
})

// function to save data to the database
async function saveDataDB(data){
  console.log("Saving to database...")
  console.log(data)

  await client.connect()
  console.log('Connected successfully to server')

  const db = client.db(dbName)

  const collection = db.collection(collectionName)

  // this option prevents additional documents from being inserted if one fails
  const options = { ordered: true }
  const result = await collection.insertMany(data.features, options)
  console.log(`${result.insertedCount} documents were inserted in the collection`)
}

module.exports = router;
