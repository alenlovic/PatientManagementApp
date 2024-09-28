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

function openCreateModal() {
    createModal.style.display = "block";
}

function closeCreateModal() {
    createModal.style.display = "none";
}

createForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newBilling = {
        patientName: createForm.createPatientName.value,
        paymentMethod: createForm.createPaymentMethod.value,
        currentAmount: createForm.createCurrentAmount.value,
        dateOfLastPayment: createForm.createDateOfLastPayment.value,
        remainingAmount: createForm.createRemainingAmount.value,
        billingStatus: createForm.createBillingStatus.value
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
        fetchAllBillingData();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
});

fetchAllBillingData();
