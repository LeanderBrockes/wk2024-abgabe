"use strict"

/*====================================================================
Elemets displayed and used in the html file
====================================================================*/
// Input Form
const loadPName = document.getElementById("cname")
const loadPLat  = document.getElementById("lat")
const loadPLon  = document.getElementById("lon")
const submitPoint = document.getElementById("submitPoint")
// Input Textfield
const loadText = document.getElementById("text_input")
const submitText = document.getElementById("submitText")
// Fileupload
const loadFile = document.getElementById("clist")
const submitFile = document.getElementById("submitFile")

// Visual Elements (divs)
const formErr = document.getElementById("formError")
const textErr = document.getElementById("textError")
const fileErr = document.getElementById("fileError")

/*====================================================================
Event handlers
====================================================================*/
loadPName.addEventListener("change", checkForm)
loadPLat.addEventListener("change", checkForm)
loadPLon.addEventListener("change", checkForm)
loadText.addEventListener("change", checkText)
loadFile.addEventListener("change", checkFile)

/*====================================================================
Functions
====================================================================*/
// this function checks if the input in a Form is correct
// if not it gives an error message
function checkForm(){
    let name = loadPName.value
    let lat = loadPLat.value
    let lon = loadPLon.value
    console.log("form input changed")
    console.log("name: ",name,", latitude: ",lat,", longitude: ", lon)

    // checking for empty form entries and if all points are within saxony
    if(name==""||lat==""||lon==""){// checking for empty form entries
        errMessageForm(true)
        console.log("empty form field detected")
    }else{
        if(inSaxony(turf.featureCollection([turf.point([lon,lat])]))==true){  // if all reqirded inputs are made check if all points are within saxony
            errMessageForm(true)
            console.log("the place is outside saxony")
        }else{
            errMessageForm(false)
        }
    }
}

// this function checks if the input in the textfield is correct
// if not it gives an error message
function checkText(){
    console.log("text input changed")
    let input = loadText.value
    console.log(input)

    // checking for empty text field or invalid json and if all points are within saxony
    if(emptyInvalid(input)==true){ // checking for empty or invalid input
        errMessageText(true)
        console.log("The input in the text field is empty or invalid json")
    }else{
        if(inSaxony(JSON.parse(input))==true){  // if input is valid json check if all points are within saxony
            errMessageText(true)
            console.log("a place is outside saxony")
        }else{
            errMessageText(false)
        }
    }

}

// this function checks if the uploaded file is correct
// if not it gives an error message
function checkFile(){
    let fileIn = loadFile.files[0]

    // checking the file-type
    let fName = fileIn.name
    console.log("file selected:", fName)
    let fType = fName.substring(fName.lastIndexOf(".")+1,fName.length)
    console.log(fType)
    if(fType == "json" || fType =="geojson"){
        errMessageFile(false)
    }else{
        errMessageFile(true)
        console.log("The file type has to be json or geojson")
    }

    // checking for empty or invalid file and if all points are within saxony
    let reader = new FileReader()
    reader.readAsText(fileIn)
    reader.onload = function(){
        console.log(reader.result)
        if(emptyInvalid(reader.result)==true){  // checking for empty or invalid file
            errMessageFile(true)
            console.log("The file is empty or invalid json")
        }else{
            if(inSaxony(JSON.parse(reader.result))==true){  // if file is valid json check if all points are within saxony
                errMessageFile(true)
                console.log("a place in the file is outside saxony")
            }else{
                errMessageFile(false)
            }
        }
    }
}


// this functions checks an input if it´s empty or invalid json format
// returns true if error is detectet
// returns false if no error is detectet
function emptyInvalid(input){
    try {
        JSON.parse(input)
        return false
    } catch(e) {
        return true
    }
}

// this function checks if a place is within saxony
// data must be a geojson featurecollection
// returns true if a place outside saxony is detected
// returns false if all places are within saxony
function inSaxony(data){
    console.log(data)

    let outside = false
    let i = 0
    while(outside==false && i<data.features.length){
        if(turf.booleanPointInPolygon(data.features[i],sachsen.features[0])==false){
            outside = true
            console.log("point outside")
        }else{
            console.log("point inside")
        }
        i++
    }
    return outside
}

// this function enables or disables the error message for the file upload
// det needs to be true if an error was detectet, det needs to be false if no error is detectet
function errMessageFile(det){
    if(det==true){
        loadFile.classList.replace("btn-primary","btn-danger")
        fileErr.classList.remove("d-none")
        submitFile.classList.add("disabled")
        submitFile.classList.replace("btn-primary","btn-secondary")
    }else{
        fileErr.classList.add("d-none")
        loadFile.classList.replace("btn-danger","btn-primary")
        submitFile.classList.remove("disabled")
        submitFile.classList.replace("btn-secondary","btn-primary")
    }
}
// this function enables or disables the error message for the Text input field
// det needs to be true if an error was detectet, det needs to be false if no error is detectet
function errMessageText(det){
    if(det==true){
        textErr.classList.remove("d-none")
        submitText.classList.add("disabled")
        submitText.classList.replace("btn-primary","btn-secondary")
    }else{
        textErr.classList.add("d-none")
        submitText.classList.remove("disabled")
        submitText.classList.replace("btn-secondary","btn-primary")
    }
}
// this function enables or disables the error message for the input Form
// det needs to be true if an error was detectet, det needs to be false if no error is detectet
function errMessageForm(det){
    if(det==true){
        formErr.classList.remove("d-none")
        submitPoint.classList.add("disabled")
        submitPoint.classList.replace("btn-primary","btn-secondary")
    }else{
        formErr.classList.add("d-none")
        submitPoint.classList.remove("disabled")
        submitPoint.classList.replace("btn-secondary","btn-primary")
    }
}