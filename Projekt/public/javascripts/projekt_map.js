"use strict"
/*====================================================================
global objects that are used by multiple functions
====================================================================*/
const apiKey = "9d0f6d4d1027ef734f49c80a1b91c332"
let ptsWithin = {}    // points within the Bounding Box


/*====================================================================
Elemets displayed and used in the html file
====================================================================*/
// Map elements
var map = L.map("map")
var markerLayer = L.layerGroup()

var bBox = new L.FeatureGroup()
var drawControl = new L.Control.Draw({
    draw: {polyline: false, polygon: false, marker: false, circle: false, marker: false, circlemarker: false},
    edit: {featureGroup: bBox, edit: true}
})

// empty forecast chart
let forecastChart = new Chart(chart) 

/*====================================================================
Event handlers
====================================================================*/
map.on("draw:created", function(e){e.layer.addTo(bBox); boundingBox()})
map.on("draw:edited", boundingBox)
map.on("draw:deleted", boundingBox)

/*====================================================================
Map
====================================================================*/
// default map position
map.setView([50.92958, 13.458505], 8)

// Tile layers
var tileL1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})
var tileL2 = new L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom:17,
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors. Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team'
})
var tileL3 = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
})

// Draw Control
drawControl.addTo(map)
bBox.addTo(map)
// Layer control
tileL1.addTo(map) //default layer
markerLayer.addTo(map)

var baseMaps = {"OSM":tileL1, "Humanitarian OSM":tileL2, "OpenTopoMap (evtl. lange Ladezeiten)":tileL3}
var overlayMaps = {"Cities": markerLayer, "Bounding Box": bBox}

L.control.layers(baseMaps, overlayMaps).addTo(map)

/*====================================================================
Functions
====================================================================*/
// this function checks if there is a bounding box on the map
// if it is, than the existing markers are removed and new ones within the bounding box are created
// if there is no bounding box, markers for all pints are created
function boundingBox(){
    markerLayer.clearLayers()

    var bBoxFeature = bBox.toGeoJSON()
    if (bBoxFeature.features.length==0){ // if the Bounding Box is empty all markers are created
        for (let i=0; i<places.features.length; i++){
            createMarker(places.features[i])
        }
    }else{ // if there is a bounding box, only the markers within in are created
        console.log("Bounding box:", bBoxFeature)
        ptsWithin = turf.pointsWithinPolygon(places,bBoxFeature)
        console.log("Points within bounding box:", ptsWithin)

        for (let i=0; i<ptsWithin.features.length; i++){
            createMarker(ptsWithin.features[i])
        }
    }
}

// The function returns the current weather/forecast at a point
// The input must be a point in the geojson format
// type must be weather for current weather and forecast for weather forecast
// the return value ist the entire content of the API return
async function getWeather(point,type){
    let weather
    let lonlat = point.geometry.coordinates
    let apiUrl = `http://api.openweathermap.org/data/2.5/${type}?lat=${lonlat[1]}&lon=${lonlat[0]}&units=metric&appid=${apiKey}`

    try {
        const response = await fetch(apiUrl)
        const data = await response.json()
        weather = data

        console.log(data)
        console.log(`Returning ${type} for ${point.properties["Place name"]}`)
    }catch(error){
        console.log("Something went wrong")
    }
    return weather
}

// the following function creates a marker
// the point Object needs to be a json object
// the current temperature gets added to the marker
async function createMarker(point){
    var newMarker = L.marker([point.geometry.coordinates[1],point.geometry.coordinates[0]]).on("click", weatherChart)
    let popup = ""
    
    // Creating the popup
    // adding informations from the database
    for (const [key, value] of Object.entries(point.properties)) {
        // converting the property name to string
        let pName = JSON.stringify(key)
        pName = pName.substring(1,pName.length-1)
        pName = pName.charAt(0).toUpperCase() + pName.slice(1)

        // adding the property to the popup
        if (pName == "Wikipedia article") {
            popup = popup + pName+": <a href="+value+">Link</a><br>"
            //popup = popup + pName+":<a href='"+value+"'>'"+value+"'</a><br>"
        }else{
            popup = popup + pName+": "+value+"<br>"
        }
        console.log(pName, "added to Popup")
    }

    // adding distance to Dresden to the popup
    let distDD = Math.round(turf.distance(point,dresden.features[0])*1000)/1000
    console.log("Distance to Dresden:",distDD,"km")
    popup = popup + "Distance DD: "+distDD+" km<br>"
    console.log("distance to Dresden added to Popup")

    // adding the current temperature to the popup
    let weather = await getWeather(point,'weather')
    console.log(weather)
    var temp = weather.main.temp
    popup = popup + "Temperature: "+ temp+" °C<br>"
    console.log("temperature added to Popup")


    // binding the popup to the marker
    newMarker.bindPopup(popup)
    newMarker.addTo(markerLayer)
    console.log("Marker created")
}

// create and display a Chart containing information about the weather forecast
// 3 Hour intervall for next five Days
// shows current temperature an how the temperature feels like for the human body
// every time a Marker is selected the chart gets reloaded
async function weatherChart(e){
    console.log("weather chart")

    forecastChart.destroy() // destroying the existing chart, to create a new one

    // getting the forecast informations
    console.log(e)
    console.log(e.latlng)
    let place = turf.point([e.latlng.lng, e.latlng.lat])
    let forecast = await getWeather(place,'forecast')
    console.log(forecast)

    // sort the forecast informations to create the chart from
    let temp = []
    let feels_like = []
    let timeStamps = []
    for (let i=0; i<forecast.list.length; i++){ // going through each entry in the forecast data
        temp[i] = forecast.list[i].main.temp
        feels_like[i] = forecast.list[i].main.feels_like
        timeStamps[i] = forecast.list[i].dt_txt
    }
  
    // creating the chart
    forecastChart = new Chart(chart, {
        type: "line",
        data: {labels:timeStamps, datasets: [{label:'Temperatur [°C]',data:temp},{label:'Gefühlt [°C]',data:feels_like}]},
        options: {responsive:true,maintainAspectRatio:false}
    })

    console.log("New Chart created", chart)
}

// this funtion ads the data from the databse as a marker to the map
function addData(data){
    for (let i=0; i<data.features.length; i++){
        createMarker(data.features[i])
    }
    console.log(data)
}

// the data gets added when the map site is loaded
addData(places)