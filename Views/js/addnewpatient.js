const saveButton = document.getElementById("btnsave");
const cancelButton = document.getElementById("btncancel");
const fileUpload = document.getElementById("file-upload");
const fileInfo = document.getElementById("file-info");
const fileName = document.getElementById("file-name");
const removeFileButton = document.getElementById("remove-file");

fileUpload.addEventListener("change", function () {
    const file = fileUpload.files[0];
    if (file) {
        fileName.textContent = file.name;
        fileInfo.style.display = "block";
    }
});

removeFileButton.addEventListener("click", function () {
    fileUpload.value = "";
    fileName.textContent = "";
    fileInfo.style.display = "none";
});

saveButton.addEventListener("click", async function () {
    try {
        // Create patient data
        const patientData = {
            firstName: document.getElementById("firstname").value.trim(),
            lastName: document.getElementById("lastname").value.trim(),
            fathersName: document.getElementById("fathersname").value.trim(),
            jmbg: document.getElementById("jmbg").value.trim(),
            placeOfBirth: document.getElementById("placeofbirth").value.trim(),
            postalAddress: document.getElementById("postaladdress").value.trim(),
            phoneNumber: document.getElementById("phonenumber").value.trim(),
            yearOfBirth: new Date(document.getElementById("yearofbirth").value).toISOString(), 
            email: document.getElementById("email").value.trim(),
            isCritical: false,
            patientNote: document.getElementById("patientNote").value.trim()
        };

        const patientResponse = await fetch("https://localhost:44376/api/patient", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(patientData)
        });

        if (!patientResponse.ok) {
            const errorText = await patientResponse.text();
            throw new Error(errorText);
        }

        const patient = await patientResponse.json();
        console.log("Patient created successfully:", patient);

        // Create patient record data
        const formData = new FormData();
        formData.append("PatientId", document.getElementById("patientId").value.trim());
        formData.append("DentalProsthetics", document.getElementById("dentalprothetics").value.trim());
        formData.append("PreviousDiseases", document.getElementById("previousdiseases").value.trim());
        formData.append("ChronicDiseases", document.getElementById("chronicdiseases").value.trim());
        formData.append("Allergies", document.getElementById("allergies").value.trim());
        formData.append("PenicilinAllergy", document.getElementById("penicilin").value.trim());
        formData.append("RecordNote", document.getElementById("recordnote").value.trim());

        const opgFile = fileUpload.files[0];
        if (opgFile) { // Provera da li je OPG slika prisutna
            console.log("OPG file selected:", opgFile.name);
            formData.append("opgImageFile", opgFile);
        } else {
            console.log("No OPG file selected");
        }

        const patientRecordResponse = await fetch("https://localhost:44376/api/patientrecord", {
            method: "POST",
            body: formData
        });

        if (!patientRecordResponse.ok) {
            const errorText = await patientRecordResponse.text();
            throw new Error(errorText);
        }

        const patientRecord = await patientRecordResponse.json();
        console.log("Patient record created successfully:", patientRecord);

        // Upload OPG file if it exists
        if (opgFile) {
            const formData = new FormData();
            formData.append("opgImageFile", opgFile);

            const fileUploadResponse = await fetch(`https://localhost:44376/api/patientrecord/${patientRecord.patientRecordId}/upload`, {
                method: "POST",
                body: formData
            });

            if (!fileUploadResponse.ok) {
                const errorText = await fileUploadResponse.text();
                throw new Error(errorText);
            }

            const fileUploadResult = await fileUploadResponse.json();
            console.log("File uploaded successfully:", fileUploadResult);
        }

    } catch (error) {
        console.error("Error:", error.message);
        alert(error.message); // Display the error message to the user
    }
});

cancelButton.addEventListener("click", function () {
    window.location.href = "patients.html";
});
