var express = require('express');
var router = express.Router();

const turf = require("@turf/helpers")

const { MongoClient } = require('mongodb')
const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'db05_3' // database name
const collectionName = 'uebung05_3' // collection name

/* GET map page. */
router.get('/', async function(req, res, next) {
  const result = await getDataDB()
      
  const resultAsFc = turf.featureCollection(result);
  
  res.render('map', { data: JSON.stringify(resultAsFc)})
});

// Get Data
async function getDataDB()
{
    await client.connect()
    console.log('Connected successfully to server')

    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    const cursor = collection.find({})
    const results = await cursor.toArray()

    if (results.length == 0) {
        console.log("No documents found!")
    }
    else {
        console.log(`Found ${results.length} documents in the collection...`);
        //console.log(results)
    }

    return results
}

module.exports = router;
