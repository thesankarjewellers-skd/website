let collectionItems = [];

function checkOtherCategory() {
    const categorySelect = document.getElementById('jewelry-category');
    const otherInput = document.getElementById('other-category-input');
    otherInput.style.display = (categorySelect.value === 'Other') ? 'block' : 'none';
}

function addItemToCollection() {
    let category = document.getElementById('jewelry-category').value;
    if (category === 'Other') {
        category = document.getElementById('other-category-input').value || 'Other';
    }
    const jewelleryFor = document.getElementById('jewelleryFor').value || "Women";
    const metal = document.getElementById('metal-type').value;
    const stones = document.getElementById('precious-stones').value || "None";
    const budget = parseFloat(document.getElementById('item-budget').value);

    if (!budget || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    const item = { jewelleryFor, metal, category, stones, budget };
    collectionItems.push(item);
    updateSummary();

    // Clear budget and stones input for next item
    document.getElementById('item-budget').value = '';
    document.getElementById('precious-stones').value = '';
}

function updateSummary() {
    const tbody = document.getElementById('summary-body');
    const totalEl = document.getElementById('total-budget');
    const btnContainer = document.getElementById('whatsapp-btn-container');

    tbody.innerHTML = '';
    let total = 0;

    if (collectionItems.length === 0) {
        // Display placeholder when table is empty
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">No Jewellery Selected.</td>
            </tr>
        `;
        totalEl.innerText = `₹0`;
        btnContainer.style.display = 'none';
        return;
    }

    // Normal behavior if items exist
    collectionItems.forEach((item, index) => {
        total += item.budget;
        // Inside your collectionItems.forEach loop:
        tbody.innerHTML += `
        <tr class="row-animation">
            <td data-label="jewelleryFor"><strong>${item.jewelleryFor}</strong></td>
            <td data-label="Jewellery"><strong>${item.category}</strong></td>
            <td data-label="Metal"><span class="metal-badge ${item.metal.toLowerCase()}">${item.metal}</span></td>
            <td data-label="Stones">${item.stones}</td>
            <td data-label="Budget" class="currency">₹${item.budget.toLocaleString('en-IN')}</td>
            <td class="action-cell"><button class="remove-item-btn" onclick="removeItem(${index})">✕</button></td>
        </tr>`;
    });

    totalEl.innerText = `₹${total.toLocaleString('en-IN')}`;
    btnContainer.style.display = 'block';
}

// Ensure the table shows the message on initial page load
document.addEventListener("DOMContentLoaded", () => {
    updateSummary();
});

function removeItem(index) {
    collectionItems.splice(index, 1);
    updateSummary();
}

function sendWhatsApp() {
    let message = "Hi! Sankar Jewellers, I would like to inquire about the following:\n\n";
    let total = 0;

    collectionItems.forEach((item, i) => {
        message += `${i + 1}. ${item.jewelleryFor} - ${item.category} (${item.metal}) - Stones: ${item.stones} - Budget: ₹${item.budget}\n`;
        total += item.budget;
    });

    message += `\nTotal Estimated Budget: ₹${total}`;

    const phoneNumber = "+917044504521"; // Replace with actual number
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}