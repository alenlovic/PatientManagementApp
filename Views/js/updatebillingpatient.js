
const url = "https://localhost:44376/api/billing";

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

let currentEditId = null;

async function editBilling(billingId) {
    console.log(`Editing Billing ID: ${billingId}`); // Debugging log
    currentEditId = billingId;
    try {
        const response = await fetch(`${url}/${billingId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const billing = await response.json();

        document.getElementById("editBillingId").value = billingId; // Set hidden input value
        document.getElementById("editPatientName").value = billing.patient ? `${billing.patient.firstName} ${billing.patient.lastName}` : 'N/A';
        document.getElementById("editPaymentMethod").value = billing.paymentMethod || 'N/A';
        document.getElementById("editCurrentAmount").value = billing.currentAmount || 'N/A';
        document.getElementById("editDateOfLastPayment").value = billing.dateOfLastPayment ? new Date(billing.dateOfLastPayment).toISOString().split('T')[0] : '';
        document.getElementById("editRemainingAmount").value = billing.remainingAmount || 'N/A';
        document.getElementById("editBillingStatus").value = billing.billingStatus || 'N/A';

        editModal.style.display = "flex";
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function deleteBilling(billingId) {
    try {
        const response = await fetch(`${url}/${billingId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        fetchAllBillingData();
    } catch (error) {
        console.error('There has been a problem with your delete operation:', error);
    }
}

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedBilling = {
        //billingId: document.getElementById("editBillingId").value, // Include billingId in the update
        patientName: document.getElementById("editPatientName").value,
        paymentMethod: document.getElementById("editPaymentMethod").value,
        currentAmount: document.getElementById("editCurrentAmount").value,
        dateOfLastPayment: document.getElementById("editDateOfLastPayment").value,
        remainingAmount: document.getElementById("editRemainingAmount").value,
        billingStatus: document.getElementById("editBillingStatus").value
    };

    try {
        const response = await fetch(`${url}/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedBilling)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        fetchAllBillingData(); // Refresh the billing data
        closeModal();
    } catch (error) {
        console.error('There has been a problem with your update operation:', error);
    }
});

function closeModal() {
    editModal.style.display = "none";
}

fetchAllBillingData();
