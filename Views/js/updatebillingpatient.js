const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

let currentEditId = null;

async function editBilling(billingId) {
    console.log(`Editing Billing ID: ${billingId}`); 
    currentEditId = billingId;
    try {
        console.log(billingId);
        const response = await fetch(`https://localhost:44376/api/billing/${billingId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const billing = await response.json();

        document.getElementById("editBillingId").value = billingId;
        document.getElementById("editPatientId").value = billing.patient ? billing.patient.patientId : '';
        document.getElementById("editPatientName").value = billing.patient ? billing.patient.personalName : 'N/A';
        document.getElementById("editPaymentMethod").value = billing.paymentMethod || '';
        document.getElementById("editCurrentAmount").value = billing.currentAmount || '';
        document.getElementById("editDateOfLastPayment").value = billing.dateOfLastPayment ? new Date(billing.dateOfLastPayment).toISOString().split('T')[0] : '';
        document.getElementById("editRemainingAmount").value = billing.remainingAmount || '';
        document.getElementById("editBillingStatus").value = billing.billingStatus || '';

        editModal.style.display = "flex";
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedBilling = {
        billingId: document.getElementById("editBillingId").value,
        patientId: document.getElementById("editPatientId").value, 
        currentAmount: document.getElementById("editCurrentAmount").value,
        remainingAmount: document.getElementById("editRemainingAmount").value,
        billingStatus: document.getElementById("editBillingStatus").value,
        dateOfLastPayment: document.getElementById("editDateOfLastPayment").value,
        paymentMethod: document.getElementById("editPaymentMethod").value
    };

    console.log("Updated Billing Data:", updatedBilling);

    try {
        console.log(currentEditId);
        const response = await fetch(`https://localhost:44376/api/billing/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedBilling)
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        fetchAllBillingData(); 
        closeModal();
    } catch (error) {
        console.error('There has been a problem with your update operation:', error);
    }
});

function closeModal() {
    editModal.style.display = "none";
}

fetchAllBillingData();
