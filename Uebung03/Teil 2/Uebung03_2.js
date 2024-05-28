"use strict"
/*====================================================================
global objects that are used by multiple functions
====================================================================*/
let cities = {}
let newPoint = {}

/*====================================================================
Elemets displayed and used in the html file
====================================================================*/
// Buttons
let loadC = document.getElementById("clist")
let submitPoint = document.getElementById("submitPoint")
let createTable = document.getElementById("createTable")
let createChart = document.getElementById("createChart")

// Input Elements


// Output elements (chart, table)
let tableOut = document.getElementById("table")
let chartOut = document.getElementById("chart")

// Visual Elements (divs)
let fileErr = document.getElementById("err")

/*====================================================================
Event handlers
====================================================================*/
submitPoint.addEventListener("click", createNewPoint)
createTable.addEventListener("click", distanceTable)
createChart.addEventListener("click", distanceChart)

/*====================================================================
Classes
====================================================================*/
class Point {
    constructor(name, coordinates){
        this.name = name
        this.coordinates = coordinates
    }

    //this function computes the distance between the point and cities in a geojson-file
    // the distances are saved in the distToCity attribute
    distance_to_point(city_array){
        const distToCity = find_nearest_city(city_array.features, this)
        this.distToCity = distToCity
        this.nearest_city() // executes function to set and return the nearestCity-object
    return distToCity
   }
   
   // this function sets and returns the nearestCity attribute, wich contains a city-object
    nearest_city(){
        let nearestCity = this.distToCity[0][0]
        this.nearestCity = nearestCity
    return nearestCity
   }
}

/*====================================================================
In- and output functions
====================================================================*/
// load a geojson-file containing city-informations
// the function gets executed if a new file is uploaded
// the function only works if a json-file is uploaded, else it gives an error message
function loadCities(citiesInput){
    let fileIn = citiesInput.files[0]

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
            }
        }else{
            loadC.classList.replace("btn-primary","btn-danger")
            fileErr.classList.remove("d-none")
        }
    }
}

// create a new Point based on the the input fields
// the distance to the cities will be computed when executed
// this function only works if loadCities was executed before
function createNewPoint(){
    console.log("Creating a new Point...")
    let cname = document.getElementById("cname").value
    let lat = parseFloat(document.getElementById("lat").value)
    let lon = parseFloat(document.getElementById("lon").value)

    newPoint = new Point(cname, [lon, lat])
    newPoint.distance_to_point(cities)
    console.log("New point created", newPoint)
    console.log("nearest city is:", newPoint.nearest_city())
}

// create and display a table containing information about the distance to the new Point
// this function only works if loadCities and createNewPoint were executed before
// if a new point is put in, a new table can be crated
function distanceTable(){
    const tHeadLine = "<tr><th>Stadt</th><th>Entfernung bis "+newPoint.name+" [km]</th></tr>" // Headlines
    let tRow = ""
    let tBody = ""
    for (let i = 0; i<newPoint.distToCity.length; i++){
        tRow = "<tr><td>"+newPoint.distToCity[i][0].properties.cityname+"</td><td>"+newPoint.distToCity[i][1]+"</td></tr>"  // Rows
        tBody = tBody+tRow
    }

    tableOut.innerHTML = tHeadLine+tBody
    console.log("new Table created", table)
}

// create and display a Chart containing information about the distance to the new Point
// this function only works if loadCities and createNewPoint were executed before
// The chart can only be crated once, even if a new point is put in
function distanceChart(){
    var xValues = []
    var yValues = []
    for (let i = 0; i<newPoint.distToCity.length; i++){
        xValues[i] = newPoint.distToCity[i][0].properties.cityname
        yValues[i] = newPoint.distToCity[i][1]
    }
    console.log(xValues)
    console.log(yValues)

    let newChart = new Chart(chart, {
        type: "bar",
        data: {labels: xValues, datasets: [{label: "Entfernung bis "+newPoint.name+" [km]", data: yValues}]},
        options: {legend: {display: false}, scales:{y: {beginAtZero: true}}}
    })

    chartOut.innerHTML = newChart
    console.log("New Chart created", chart)
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

// this function returns an array of cites, sorted by the distance to a point
function find_nearest_city(array_of_cities, new_point)
{
    let distance_to_point = []
    console.log("Array of the cites input:", array_of_cities)
    console.log("The new point:", new_point)
    for (let i = 0; i < array_of_cities.length; i++){ // computing the distance for each city
        console.log("calculating distance between the new point and city", i+1)
        distance_to_point[i] = [array_of_cities[i], compute_geographic_distance(array_of_cities[i].geometry.coordinates, new_point.coordinates, "kilometres")]
    }

    // sorting by the distance for each city
    let sortby
    distance_to_point.sort(sortby = (a,b) => a[1] -b[1])
    console.log("Sorting the cities by distance to the new point:", distance_to_point)

    return distance_to_point // Array with the distances between the Point and the cities
}



console.log("javaScript loaded")