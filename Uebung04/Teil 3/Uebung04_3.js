"use strict"
/*====================================================================
global objects that are used by multiple functions
====================================================================*/
let cities = {}

/*====================================================================
Elemets displayed and used in the html file
====================================================================*/
// Buttons
const loadC = document.getElementById("clist")
const submitPoint = document.getElementById("submitPoint")

// Map eleements
var map = L.map("map")
var markerLayer = L.layerGroup()

// Visual Elements (divs)
let fileErr = document.getElementById("err")

/*====================================================================
Event handlers
====================================================================*/
loadC.addEventListener("change", loadCities)
submitPoint.addEventListener("click", function(){
    createNewPoint(
        parseFloat(document.getElementById("lat").value), 
        parseFloat(document.getElementById("lon").value), 
        document.getElementById("cname").value, 
        document.getElementById("pic").value)
})

/*====================================================================
Input functions
====================================================================*/
// load a geojson-file containing city-informations & createing a marker for each city on the map
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
            loadC.classList.replace("btn-danger","btn-primary")

            let reader2 = new FileReader()
            reader2.readAsText(fileIn)
            reader2.onload = function(){
                fileErr.classList.add("d-none")
                cities = JSON.parse(reader2.result)
                console.log("Cities loaded", cities)

                for (let i=0; i<cities.features.length; i++){
                    createMarker(cities.features[i])
                }
            }
            
        }else{
            loadC.classList.replace("btn-primary","btn-danger")
            console.log("The file type has to be json")
            fileErr.classList.remove("d-none")
        }
    }
}

// This function creates a new Pooint with its coordinates and the properties cityname & picture
// additional properties are the distance to Berlin using the haversine formula & the trf.distance function
// The point is displayed with a marker on the map
function createNewPoint(lat, lon, name, url){
    console.log("Creating a new Point...")
    let newPoint = turf.point([lon,lat],{"cityname":name})

    // compuing the distance to Berlin
    if (cities.features != undefined) {
        let j = 0
        while (cities.features[j].properties.cityname != "Berlin"){
            j++
        }
        let berlin = cities.features[j]
        newPoint.properties.berlinHaversine = compute_geographic_distance([lon,lat],berlin.geometry.coordinates,"kilometres")
        newPoint.properties.berlinTurf = Math.round(turf.distance(newPoint,berlin)*1000)/1000
    }

    if (url != ""){newPoint.properties.picture=url} // adding the picture URL to the new Point
    console.log(newPoint)
    createMarker(newPoint)
}

/*====================================================================
Distance computation functions
====================================================================*/
// function to convert from m to km, rounding to 3 digits after komma
let convert_distance_to_kilometers = (distance_in_m) => Math.round(distance_in_m)/1000;

// function to compute the geographic distance between to points
// unit must be metres or kilometres
function compute_geographic_distance(point1, point2, unit)
{
    const R = 6371e3; // metres
    // coordinates & -differences in radian:
    const lat1 = point1[1] * Math.PI/180;
    const lat2 = point2[1] * Math.PI/180;
    const dlat = (point2[1]-point1[1]) * Math.PI/180;
    const dlon = (point2[0]-point1[0]) * Math.PI/180;

    // haversine formula:
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dlon/2) * Math.sin(dlon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    // distance:
    let geographic_distance = R * c; // metres
    if (unit == "kilometres"){ // distance in kilomtres
        geographic_distance = convert_distance_to_kilometers(geographic_distance)
        console.log("converting from m to km")
    } else if (unit != "metres"){ // error message if unit is neither metres or kilometres
        console.log("wrong unit input, output is in metres") 
    }
    console.log(geographic_distance, unit)

    return geographic_distance // geographic distance in the given unit (meter/kilometer)
}

/*====================================================================
Map
====================================================================*/
// the following function creates a marker
// the point Object needs to be a json feature
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
        if (pName == "Picture" && value !="") {
            popup = popup + "<a href='"+value+"' target='_blank'><img style='width: 150px' src='"+ value +"'></a>"
        }else if (pName != "Picture"){
            popup = popup + pName+": "+ value+"<br>"
        }
    }

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
