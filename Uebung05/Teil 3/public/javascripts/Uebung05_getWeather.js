"use strict"

// The function returns the current Temperature at a point
// The input must be a point in the geojson format
async function getWeather(point){
    let temp
    const apiKey = "9d0f6d4d1027ef734f49c80a1b91c332"
    let lonlat = point.geometry.coordinates
    let apiUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lonlat[1]}&lon=${lonlat[0]}&units=metric&appid=${apiKey}`

    try {
        const response = await fetch(apiUrl)
        const data = await response.json()
        temp = data.main.temp

        console.log(`Weather in ${point.properties.cityname}: ${temp}°C`)
    }catch(error){
        console.log("Something went wrong")
    }
    return temp
}