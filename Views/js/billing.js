

const urlBilling = "https://localhost:44376/api/billing";

const billingList = document.getElementById("billingList");
const createModal = document.getElementById("createModal");
const createForm = document.getElementById("createForm");

async function fetchAllBillingData() {
    try {
        const response = await fetch(urlBilling);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const billingData = await response.json();
        console.log('Fetched billing data:', billingData); // Debugging log
        displayBillingData(billingData);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function displayBillingData(billingData) {
    billingList.innerHTML = '';

    billingData.forEach(billing => {
        const row = document.createElement('tr');
        row.dataset.billingId = billing.billingId; // Store billingId in data attribute

        const billingId = billing.billingId;
        const patientName = billing.patient ? `${billing.patient.firstName} ${billing.patient.lastName}` : 'N/A';
        const paymentMethod = billing.paymentMethod || 'N/A';
        const currentAmount = billing.currentAmount || 'N/A';
        const dateOfLastPayment = billing.dateOfLastPayment ? new Date(billing.dateOfLastPayment).toLocaleDateString() : 'N/A';
        const remainingAmount = billing.remainingAmount || 'N/A';
        const billingStatus = billing.billingStatus || 'N/A';

        console.log(`Billing ID: ${billing.billingId}`); // Debugging log

        row.innerHTML = `
            <td>${patientName}</td>
            <td>${paymentMethod}</td>
            <td>${currentAmount}</td>
            <td>${dateOfLastPayment}</td>
            <td>${remainingAmount}</td>
            <td>${billingStatus}</td>
            <td>
                <button class="edit-btn" onclick="editBilling(${billingId})">Edit</button>
                <button class="delete-btn" onclick="deleteBilling(${billingId})">Delete</button>
            </td>
        `;

        billingList.appendChild(row);
    });
}

function setupAutocomplete() {
    const patientInput = document.getElementById('createPatientName');
    const patientIdInput = document.getElementById('createPatientId');
    const autocompleteList = document.getElementById('autocomplete-list-appointment');

    if (!patientInput) {
        console.error('Element with ID "createPatientName" not found.');
        return;
    }

    patientInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length < 2) {
            autocompleteList.innerHTML = '';
            autocompleteList.classList.remove('show');
            return;
        }

        fetch(`https://localhost:44376/api/patient/search?name=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                autocompleteList.innerHTML = '';
                if (data.length > 0) {
                    autocompleteList.classList.add('show');
                } else {
                    autocompleteList.classList.remove('show');
                }
                data.forEach(patient => {
                    const item = document.createElement('div');
                    item.textContent = patient.personalName;
                    item.classList.add('autocomplete-item');
                    item.addEventListener('click', function () {
                        patientInput.value = patient.personalName;
                        autocompleteList.innerHTML = '';
                        patientIdInput.value = patient.patientId;
                        autocompleteList.classList.remove('show');
                    });
                    autocompleteList.appendChild(item);
                });
            })
            .catch(error => console.error('Error fetching patient names:', error));
    });
}

function openCreateModal() {
    createModal.style.display = "block";
}

function closeCreateModal() {
    createModal.style.display = "none";
}

function resetCreateForm() {
    createForm.reset();
    const autocompleteList = document.getElementById('autocomplete-list-appointment');
    autocompleteList.innerHTML = '';
    autocompleteList.classList.remove('show');
}

createForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newBilling = {
        patientId: createForm.createPatientId.value,
        paymentMethod: createForm.createPaymentMethod.value,
        currentAmount: createForm.createCurrentAmount.value,
        dateOfLastPayment: createForm.createDateOfLastPayment.value,
        remainingAmount: createForm.createRemainingAmount.value,
        billingStatus: createForm.createBillingStatus.value
    };

    console.log(newBilling);

    try {
        const response = await fetch(urlBilling, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newBilling)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('New billing created:', newBilling); // Debugging log

        closeCreateModal();
        resetCreateForm();
        fetchAllBillingData();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
});

async function deleteBilling(billingId) {
    const confirmDelete = confirm("Da li ste sigurni da želite izbrisati zapis iz tabele?");
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${urlBilling}/${billingId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log(`Billing record with ID ${billingId} deleted`); // Debugging log

        fetchAllBillingData();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fetchAllBillingData();
    setupAutocomplete();
});
