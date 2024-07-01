"use strict"

/*====================================================================
Functions
====================================================================*/
// create and display a Chart containing information about the Temperature
// every time the chart page gets loaded the functions gets the temperature for each city
async function tempChart(cities){
    var xValues = []
    var yValues = []
    for (let i = 0; i<cities.features.length; i++){  // x ersetzen
        xValues[i] = cities.features[i].properties.cityname
        yValues[i] = await getWeather(cities.features[i])
    }
    console.log(xValues)
    console.log(yValues)

    let newChart = new Chart(chart, {
        type: "bar",
        data: {labels: xValues, datasets: [{label: "Temperatur [°C]", data: yValues}]},
        options: {legend: {display: false}, scales:{y: {beginAtZero: true}}}
    })

    document.getElementById("chart").innerHTML = newChart
    console.log("New Chart created", chart)
}

// executing th function to create and display a chart
// the data is taken from the database
tempChart(cities)