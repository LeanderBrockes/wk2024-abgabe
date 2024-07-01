"use strict"

/*====================================================================
Elemets displayed and used in the html file
====================================================================*/
// Map elements
var map = L.map("map")
var markerLayer = L.layerGroup()

/*====================================================================
Map
====================================================================*/
// the following function creates a marker
// the point Object needs to be a json object
// the current temperature gets added to the marker
async function createMarker(point){
    var newMarker = L.marker([point.geometry.coordinates[1],point.geometry.coordinates[0]])
    let popup = ""
    
    // Creating the popup
    for (const [key, value] of Object.entries(point.properties)) {
        // converting the property name to string
        let pName = JSON.stringify(key)
        pName = pName.substring(1,pName.length-1)
        pName = pName.charAt(0).toUpperCase() + pName.slice(1)

        // adding the property to the popup
        if (pName == "Picture") {
            popup = popup + "<a href='"+value+"' target='_blank'><img class='image' src='"+ value +"'></a><br>"
        }else{
            popup = popup + pName+": "+ value+"<br>"
        }
        console.log(pName, "added to Popup")
    }

    // adding the current temperature to the popup
    let temp = await getWeather(point)
    popup = popup + "Temperature: "+ temp+" °C<br>"

    // binding the popup to the marker
    newMarker.bindPopup(popup)
    newMarker.addTo(markerLayer)
    console.log("Marker created")
}

// default map position
map.setView([53, 13], 4)

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


// Layer control
tileL1.addTo(map) //default layer
markerLayer.addTo(map)

var baseMaps = {"OSM":tileL1, "Humanitarian OSM":tileL2, "OpenTopoMap (evtl. lange Ladezeiten)":tileL3}
var overlayMaps = {"Cities": markerLayer}

L.control.layers(baseMaps, overlayMaps).addTo(map)

/*====================================================================
Functions
====================================================================*/
// this funtion ads the data from the databes as a marker to the map
function addData(data){
    for (let i=0; i<data.features.length; i++){
        createMarker(data.features[i])
    }
}

// the data gets added when the map site is loaded
addData(cities)