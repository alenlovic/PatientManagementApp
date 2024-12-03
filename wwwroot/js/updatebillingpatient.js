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

        const editBillingId = document.getElementById("editBillingId");
        const editPatientId = document.getElementById("editPatientId");
        const editPatientName = document.getElementById("editPatientName");
        const editServiceName = document.getElementById("editServiceName");
        const editServiceCost = document.getElementById("editServiceCost");
        const editPaymentMethod = document.getElementById("editPaymentMethod");
        const editPayedAmount = document.getElementById("editPayedAmount");
        const editDateOfLastPayment = document.getElementById("editDateOfLastPayment");
        const editRemainingAmount = document.getElementById("editRemainingAmount");
        const editBillingNote = document.getElementById("editBillingNote");

        editBillingId.value = billingId;
        editPatientId.value = billing.patient ? billing.patient.patientId : '';
        editPatientName.value = billing.patient ? billing.patient.personalName : 'N/A';
        editServiceName.value = billing.serviceName || '';
        editServiceCost.value = billing.serviceCost || '';
        editPaymentMethod.value = billing.paymentMethod || '';
        editPayedAmount.value = billing.payedAmount || '';
        editDateOfLastPayment.value = billing.dateOfLastPayment ? new Date(billing.dateOfLastPayment).toISOString().split('T')[0] : '';
        editRemainingAmount.value = billing.remainingAmount || '';
        editBillingNote.value = billing.billingNote || '';

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
        serviceName: document.getElementById("editServiceName").value,
        serviceCost: document.getElementById("editServiceCost").value,
        paymentMethod: document.getElementById("editPaymentMethod").value,
        payedAmount: document.getElementById("editPayedAmount").value,
        dateOfLastPayment: document.getElementById("editDateOfLastPayment").value,
        remainingAmount: document.getElementById("editRemainingAmount").value,
        billingNote: document.getElementById("editBillingNote").value
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
