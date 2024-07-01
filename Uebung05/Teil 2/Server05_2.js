
const express = require("express")
const app = express()
const path = require('path')


const { MongoClient } = require('mongodb')
const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'db05_2' // database name
const collectionName = 'uebung05_2' // collection name


const host = "localhost" // 127.0.0.1
const port = 5000


// Routing
// declare the public folder as a static folder
app.use(express.static(path.join(__dirname, '/public')))
console.log("Directory: ", __dirname)

var home_route = require('./routes/home')
var impressum_route = require('./routes/impressum')

app.use('/', home_route)
app.use('/impressum', impressum_route)



// Database
app.use(express.urlencoded({extended: false}))

// handling post request
// the input text gets parsed to Json, so the input must have Json-format
app.post('/', (req, res) => {
    console.log('receiving data ...')
    var data = JSON.parse(req.body.input_data)
    console.log(data)

    saveDataDB(data)
    //res.send(`Data uploaded to Collection ${collectionName} in Databse ${dbName}`)
    res.send("Data uploaded to Database")
})

// Function to save the uploaded data to the Database
// the input data must have the json format
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

app.listen(port)
console.log(`Server is running on ${host}:${port}`)