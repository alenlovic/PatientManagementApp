const cancelButton = document.getElementById("btncancel");
cancelButton.addEventListener("click", function () {
    window.location.href = "../view/patients.html";
});

const urlPatient = "https://localhost:44376/api/patient";
const urlPatientRecord = "https://localhost:44376/api/patientrecord" //TODO

const firstName = document.getElementById("firstName"); 
const lastName = document.getElementById("lastName");
const fathersName = document.getElementById("fathersName");
const jmbg = document.getElementById("jmbg");
const placeOfBirth = document.getElementById("placeOfBirth");
const postalAddress = document.getElementById("postalAddress");
const phoneNumber = document.getElementById("phoneNumber");
const yearOfBirth = document.getElementById("yearOfBirth");
const email = document.getElementById("email");

const dentalProthetics = document.getElementById("dentalProthetics");
const previousDiseases = document.getElementById("previousDiseases");
const chronicDiseases = document.getElementById("chronicDiseases");
const allergies = document.getElementById("allergies");
const penicilinAllergie = document.getElementById("penicilinAllergie");
const recordNote = document.getElementById("recordNote");




