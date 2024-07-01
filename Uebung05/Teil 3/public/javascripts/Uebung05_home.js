"use strict"

/*====================================================================
Elemets displayed and used in the html file
====================================================================*/
// Buttons
const loadC = document.getElementById("clist")
const submit = document.getElementById("submit")

// Visual Elements (divs)
let fileErr = document.getElementById("error")

/*====================================================================
Event handlers
====================================================================*/
loadC.addEventListener("change", loadCities)

/*====================================================================
Functions
====================================================================*/
// the function checks if a json or gejson file is uploaded
// else it gives an error message and prevents the user from clicking the submit button
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
        if(fType == "json" || fType =="geojson"){
            fileErr.classList.add("d-none")
            loadC.classList.replace("btn-danger","btn-primary")
            submit.classList.remove("disabled")
            submit.classList.replace("btn-secondary", "btn-primary")

        }else{
            loadC.classList.replace("btn-primary","btn-danger")
            fileErr.classList.remove("d-none")
            submit.classList.add("disabled")
            submit.classList.replace("btn-primary","btn-secondary")

            console.log("The file type has to be json")
        }
    }
}
