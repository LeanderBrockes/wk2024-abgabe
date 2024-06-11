"use strict"
/*====================================================================
global objects that are used by multiple functions
====================================================================*/
let cities = {}         // the cities from the input file
let citiesSel = {}      // the city selection generated at file upload
let ptsWithin = {}    // points within the Bounding Box

/*====================================================================
Elemets displayed and used in the html file
====================================================================*/
// Buttons
const loadC = document.getElementById("clist")

// Map eleements
var map = L.map("map")
var markerLayer = L.layerGroup()

var bBox = new L.FeatureGroup()
var drawControl = new L.Control.Draw({
    draw: {polyline: false, polygon: false, marker: false, circle: false, marker: false, circlemarker: false},
    edit: {featureGroup: bBox, edit: true}
})

// Visual Elements (divs)
let fileErr = document.getElementById("err")

/*====================================================================
Event handlers
====================================================================*/
loadC.addEventListener("change", loadCities)
map.on("draw:created", function(e){e.layer.addTo(bBox); boundingBox()})
map.on("draw:edited", boundingBox)
map.on("draw:deleted", boundingBox)

/*====================================================================
Input functions
====================================================================*/
// load a geojson-file containing city-informations & createing a marker for each city on the map
// 6 cities will be randomly selected
// the function gets executed if a new file is uploaded
// the function only works if a json-file is uploaded, else it gives an error message
function loadCities(){
    let fileIn = loadC.files[0]

    // finding the file-type
    let reader1 = new FileReader()
    reader1.readAsDataURL(fileIn)
    reader1.onload = function(){
        var fType = reader1.result
        console.log(fType)
        fType = fType.substring(fType.indexOf("/")+1,fType.indexOf(";"))
        console.log("File type:", fType)
     
        // loading the content of the file or giving an error message
        if(fType == "json"){
            fileErr.classList.add("d-none")
            loadC.classList.replace("btn-danger","btn-primary")

            let reader2 = new FileReader()
            reader2.readAsText(fileIn)
            reader2.onload = function(){
                cities = JSON.parse(reader2.result)
                console.log("Cities loaded", cities)

                // selecting 6 of the input cities
                citiesSel = turf.sample(cities,6)
                console.log("Selected cities:", citiesSel)

                // creating the marker & checking for a bounding box
                boundingBox()
            }
            
        }else{
            loadC.classList.replace("btn-primary","btn-danger")
            console.log("The file type has to be json")
            fileErr.classList.remove("d-none")
        }
    }
}


/*====================================================================
Map
====================================================================*/
// the following function creates a marker & adds it to the markerLayer
// the point Object needs to be a json object
function createMarker(point){
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
            popup = popup + "<a href='"+value+"' target='_blank'><img style='width: 150px' src='"+ value +"'></a>"
        }else{
            popup = popup + pName+": "+ value+"<br>"
        }
    }

    // binding the popup to the marker
    newMarker.bindPopup(popup)
    newMarker.addTo(markerLayer)
    console.log("Marker created")
}

// this function checks if there is a bounding box on the map
// if it is, than the existing markers are removed and new ones within the bounding box are created
// if there is no bounding box, markers for all pints are created
function boundingBox(){
    markerLayer.clearLayers()

    var bBoxFeature = bBox.toGeoJSON()
    if (bBoxFeature.features.length==0){ // if the Bounding Box is empty all markers are created
        for (let i=0; i<citiesSel.features.length; i++){
            createMarker(citiesSel.features[i])
        }
    }else{ // if there is a bounding box, only the markers within in are created
        console.log("Bounding box:", bBoxFeature)
        ptsWithin = turf.pointsWithinPolygon(citiesSel,bBoxFeature)
        console.log("Points within bounding box:", ptsWithin)

        for (let i=0; i<ptsWithin.features.length; i++){
            createMarker(ptsWithin.features[i])
        }
    }
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

// Draw Control
drawControl.addTo(map)
bBox.addTo(map)

// Layer control
tileL1.addTo(map) //default layer
markerLayer.addTo(map)


var baseMaps = {"OSM":tileL1, "Humanitarian OSM":tileL2, "OpenTopoMap (evtl. lange Ladezeiten)":tileL3}
var overlayMaps = {"Cities":markerLayer, "Bounding Box": bBox}

L.control.layers(baseMaps, overlayMaps).addTo(map)
