const saveButton = document.getElementById("btnsave");
const cancelButton = document.getElementById("btncancel");

saveButton.addEventListener("click", async function () {
    try {
        // Create patient data
        const patientData = {
            firstName: document.getElementById("firstname").value,
            lastName: document.getElementById("lastname").value,
            fathersName: document.getElementById("fathersname").value,
            jmbg: document.getElementById("jmbg").value,
            placeOfBirth: document.getElementById("placeofbirth").value,
            postalAddress: document.getElementById("postaladdress").value,
            phoneNumber: document.getElementById("phonenumber").value,
            yearOfBirth: document.getElementById("yearofbirth").value,
            email: document.getElementById("email").value,
            isCritical: false, // Assuming default value
            patientNote: "", // Assuming default value
        };

        // Upload patient data
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
        const patientRecordData = {
            patientId: patient.patientId,
            dentalProsthetics: document.getElementById("dentalprothetics").value,
            previousDiseases: document.getElementById("previousdiseases").value,
            chronicDiseases: document.getElementById("chronicdiseases").value,
            allergies: document.getElementById("allergies").value,
            penicilinAllergy: document.getElementById("penicilin").value,
            recordNote: document.getElementById("recordnote").value,
        };

        const opgFile = document.getElementById("file-upload").files[0];

        // Upload patient record data
        const patientRecordResponse = await fetch("https://localhost:44376/api/patientrecord", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(patientRecordData)
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
    }
});

cancelButton.addEventListener("click", function () {
    window.location.href = "patients.html";
});
