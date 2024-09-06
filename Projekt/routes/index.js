var express = require('express');
const fileUpload = require('express-fileupload');
var router = express.Router();

var turf = require('@turf/turf');

const { MongoClient } = require('mongodb')
const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'Projekt' // database name
const collectionName = 'proj' // collection name


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

// Database
router.use(fileUpload())


// ==================================================================================
// handling post requests
// ==================================================================================
// Input Form
// Name and coordinates are mandatory, url is voluntary
router.post('/form', (req,res) => {
  console.log('receiving data ...')

  // getting contents of the input fields
  var latP = req.body.lat
  var lonP = req.body.lon
  var nameP = req.body.cname
  var urlP = req.body.url
  
  // creating the new point
  let newPoint = turf.point([lonP,latP],{"Place name":nameP})
  if (typeof urlP != 'undefined'){newPoint.properties["Wikipedia article"]=urlP} // adding the  URL to the new Point
  var collection = turf.featureCollection([newPoint])
  console.log(collection)

  // Save Point to DB:
  saveDataDB(collection)
  res.render('index', { title: 'Home' });
})

// HTML Text input field
// the input text gets parsed to Json, so the input must have Json-format
router.post('/input', (req, res) => {
  console.log('receiving data ...')
  var data = JSON.parse(req.body.input_data)

  console.log(data)

  saveDataDB(data)
  res.render('index', { title: 'Home' });
})

// File upload Button:
// file must be a json or geojson
router.post('/file', (req, res) => {
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
