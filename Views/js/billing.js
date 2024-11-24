const urlBilling = "https://localhost:44376/api/billing";
const urlPatient = "https://localhost:44376/api/patient";

const billingList = document.getElementById("billingList");
const createModal = document.getElementById("createModal");
const createForm = document.getElementById("createForm");
const paginationContainer = document.getElementById("pagination");

let allBillingData = [];
let currentPage = 1;
const itemsPerPage = 5;

async function fetchAllBillingData() {
    try {
        const response = await fetch(urlBilling);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const billingData = await response.json();
        allBillingData = billingData;
        displayBillingData(billingData);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function displayBillingData(billingData) {
    billingList.innerHTML = '';

    if (billingData.length === 0) {
        const row = billingList.insertRow();
        row.innerHTML = `<td colspan="7" style="text-align:center;">No billing records found</td>`;
        return;
    }

    billingData.forEach(billing => {
        const row = billingList.insertRow();
        row.dataset.billingId = billing.billingId; // Store billingId in data attribute

        const billingId = billing.billingId;
        const patientName = billing.patient ? `${billing.patient.firstName} ${billing.patient.lastName}` : 'N/A';
        const serviceName = billing.serviceName || '';
        const serviceCost = billing.serviceCost || '';
        const paymentMethod = billing.paymentMethod || '';
        const payedAmount = billing.payedAmount || '0';
        const dateOfLastPayment = billing.dateOfLastPayment ? new Date(billing.dateOfLastPayment).toLocaleDateString() : 'N/A';
        const remainingAmount = billing.remainingAmount || '0';
        const billingNote = billing.billingNote || '';

        row.innerHTML = `
            <td>${patientName}</td>
            <td>${serviceName}</td>
            <td>${serviceCost}</td>
            <td>${paymentMethod}</td>
            <td>${payedAmount}</td>
            <td>${dateOfLastPayment}</td>
            <td>${remainingAmount}</td>
            <td>${billingNote}</td>
            <td>
                <button class="edit-btn" onclick="editBilling('${billingId}')"><i class="fas fa-pen"></i></button>
                <button class="delete-btn" onclick="deleteBilling('${billingId}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });

    displayTableRows();
}

function displayTableRows() {
    const rows = billingList.getElementsByTagName('tr');
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / itemsPerPage);

    // Hide all rows
    for (let i = 0; i < totalRows; i++) {
        rows[i].style.display = 'none';
    }

    // Show only the rows for the current page
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    for (let i = start; i < end && i < totalRows; i++) {
        rows[i].style.display = '';
    }

    // Update page info
    document.getElementById('pageInfo').innerText = `Stranica ${currentPage} od ${totalPages}`;

    // Disable/Enable buttons
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTableRows();
    }
}

function nextPage() {
    const totalRows = billingList.getElementsByTagName('tr').length;
    const totalPages = Math.ceil(totalRows / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTableRows();
    }
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
        serviceName: createForm.createServiceName.value,
        serviceCost: createForm.createServiceCost.value,
        paymentMethod: createForm.createPaymentMethod.value,
        payedAmount: createForm.createPayedAmount.value,
        dateOfLastPayment: createForm.createDateOfLastPayment.value,
        remainingAmount: createForm.createRemainingAmount.value,
        billingNote: createForm.createBillingNote.value
    };

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

        closeCreateModal();
        resetCreateForm();
        fetchAllBillingData();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
});

async function deleteBilling(billingId) {
    const confirmDelete = confirm("Are you sure you want to delete this record?");
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

        fetchAllBillingData();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAllBillingData();
    setupAutocomplete();

    // Autocomplete functionality for search box
    const searchBox = document.getElementById("searchBox");
    searchBox.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const filteredBillingData = allBillingData.filter(billing => {
            const patientName = billing.patient ? `${billing.patient.firstName} ${billing.patient.lastName}`.toLowerCase() : '';
            return patientName.includes(query);
        });
        displayBillingData(filteredBillingData);
    });

    function closeAllLists(elmnt) {
        const items = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < items.length; i++) {
            if (elmnt != items[i] && elmnt != searchBox) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
});
