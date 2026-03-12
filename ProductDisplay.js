/* =========================
           PRODUCT DATA (Dynamic)
        ========================= */

let product = {
    name: "Traditional Gold Necklace",
    specifications: {
        Category: "Women • Necklace",
        Metal: "Gold",
        Purity: "22K",
        Weight: "45 grams",
        Description: "Elegant handcrafted necklace perfect for weddings and festive occasions."
    },
    pricing: {
        metalCost: 120000,
        makingCharges: 15000,
        hallmarkCharges: 1500,
        otherCharges: 50000,
        gstPercent: 3,
        discountPercent: 10
    },
    images: [
        "./images/photo-1605100804763-247f67b3557e.jpeg?w=600&h=600",
        "./images/photo-1611591437281-460bfbe1220a.jpeg?w=600&h=600",
        "./images/photo-1617038260897-41a1f14a8ca0.jpeg?w=600&h=600"
    ]
};

const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.has('ID') ? urlParams.get('ID') : '@$100';

//display relevant ID
function getRelevantPart(inputString) {
    // Split the string into an array using "@#" as the delimiter
    const parts = inputString.split("@$");

    // Check if the first part exists and is not an empty string
    if (parts[0] && parts[0] !== "") {
        return parts[0];
    } else {
        // Return the second part (index 1) if the first is empty
        return parts[1];
    }
}

const safeNum = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
};

document.addEventListener("DOMContentLoaded", async () => {
    const detailsContainer = document.getElementById("detailsSection");

    // 1. Fetch products
    const allProductDetails = await sendDataToGAS(productID);

    // 2. Validation Logic
    if (!allProductDetails || allProductDetails.length === 0) {
        detailsContainer.innerHTML = "<h3>Product not found.</h3>";
        return; // Stop execution
    }

    if (allProductDetails.length > 1) {
        detailsContainer.innerHTML = "<h3>Technical Error! Multiple matching products found.</h3>";
        return; // Stop execution
    }

    // 3. Data Mapping (Only runs if exactly 1 product is found)
    const prodDet = allProductDetails[0];

    product['name'] = String(prodDet.ColumnC || "").trim();
    product['badge'] = String(prodDet.ColumnW || "").trim();

    let spec = {};
    spec['Category'] = `${String(prodDet.ColumnG || "").trim()} • ${String(prodDet.ColumnH || "").trim()}`;
    spec['Product ID'] = getRelevantPart(String(prodDet.ColumnA || "").trim());

    if (spec['Category'].toLowerCase().includes("gold")) {
        spec['Purity'] = String(prodDet.ColumnG || "").trim();
        spec['Metal'] = "Gold";
    } else if (spec['Category'].toLowerCase().includes("silver")) {
        spec['Metal'] = "Silver";
    }

    spec['Weight'] = safeNum(prodDet.ColumnF).toFixed(3) + " gms";
    spec['Description'] = String(prodDet.ColumnD).trim() === ""
        ? `Elegant ${String(prodDet.ColumnE || "").trim()} ${String(prodDet.ColumnG || "").trim()} ${String(prodDet.ColumnH || "").trim() }`
        : String(prodDet.ColumnD).trim();

    product['specifications'] = spec;

    // Pricing Logic
    let pricng = {};
    const baseMetalCost = safeNum(prodDet.ColumnT) * safeNum(prodDet.ColumnF);
    pricng['metalCost'] = baseMetalCost.toFixed(2);
    pricng['makingCharges'] = (baseMetalCost * safeNum(prodDet.ColumnN) + safeNum(prodDet.ColumnM)).toFixed(2);
    pricng['hallmarkCharges'] = safeNum(prodDet.ColumnL).toFixed(2);
    pricng['otherCharges'] = safeNum(prodDet.ColumnO).toFixed(2);
    pricng['gstPercent'] = 3;

    // Discount Logic
    const discountType = String(prodDet.ColumnP || "").trim();
    if (discountType === "Percentage discount (any value between 1 and 100)") {
        pricng['discountPercent'] = safeNum(prodDet.ColumnQ);
        pricng['cashDiscount'] = 0;
        pricng['discountText'] = String(prodDet.ColumnS || "").trim();
    } else if (discountType === "Cash price discount") {
        pricng['discountPercent'] = 0;
        pricng['cashDiscount'] = safeNum(prodDet.ColumnQ);
        pricng['discountText'] = String(prodDet.ColumnS || "").trim();
    } else {
        pricng['discountPercent'] = 0;
        pricng['cashDiscount'] = 0;
        pricng['discountText'] = "";
    }

    product['pricing'] = pricng;

    // Image Mapping
    product['images'] = [
        getURLOfImageFromDrive(String(prodDet.ColumnI || "")),
        getURLOfImageFromDrive(String(prodDet.ColumnJ || "")),
        getURLOfImageFromDrive(String(prodDet.ColumnK || ""))
    ].filter(url => url !== ""); // Remove empty strings if an image is missing

    // 4. Final Render
    renderImages();
    renderDetails();
});


function getURLOfImageFromDrive(driveURL) {
    if (!driveURL || typeof driveURL !== 'string') return "";

    // Regex to extract the File ID from any Google Drive URL format
    const match = driveURL.match(/[-\w]{25,}/);
    const ID = match ? match[0] : null;

    if (ID) {
        // This is the most reliable "direct" link for display purposes
        // 's1000' sets the max size to 1000px. Change as needed.
        return `https://lh3.googleusercontent.com/u/0/d/${ID}?authuser=1/view`;
    }

    return "";
}

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwjH8D59LiFixoeJ179AYxB_ANOI9lV6SvLKSbTvko68MqixocG4EuXEO2VYKycSuTR/exec";

async function sendDataToGAS(productID) {
    const dataToSend = {
        module: "getProductById",
        productID: productID,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "cors", // This tells the browser to allow cross-origin
            redirect: "follow", // CRITICAL: This allows the browser to follow Google's redirect
            headers: {
                // IMPORTANT: Use text/plain to avoid the 'OPTIONS' preflight check
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(dataToSend) // Turn the object into a string
        });

        const result = await response.json();
        console.log("Response from Apps Script:", result);
        return result.data;
    } catch (error) {
        console.error("Fetch error:", error);
    }
}


/* =========================
   IMAGE SECTION
========================= */

// Replace your existing renderImages with this responsive version
function renderImages() {
    const container = document.getElementById("imageSection");
    container.innerHTML = "";

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "main-image-wrapper";
    // REMOVED: Hardcoded 600px width

    const mainImg = document.createElement("img");
    mainImg.src = product.images[0];
    mainImg.className = "product-display-main-image";
    mainImg.id = "mainImage";
    // REMOVED: Hardcoded 600px height/width

    mainWrapper.appendChild(mainImg);

    if (product.badge && product.badge.toLowerCase() !== "none") {
        const badgeDiv = document.createElement("div");
        badgeDiv.className = "product-badge";
        badgeDiv.innerText = product.badge;
        mainWrapper.appendChild(badgeDiv);
    }

    container.appendChild(mainWrapper);

    const thumbContainer = document.createElement("div");
    thumbContainer.className = "product-display-thumbnail-container";

    product.images.forEach((imgSrc, index) => {
        if (!imgSrc) return; // Skip if URL is empty
        const thumb = document.createElement("img");
        thumb.src = imgSrc;
        thumb.className = "thumb-img"; // Use class for styling
        if (index === 0) thumb.classList.add("active");

        thumb.onclick = function () {
            document.getElementById("mainImage").src = imgSrc;
            thumbContainer.querySelectorAll("img").forEach(i => i.classList.remove("active"));
            thumb.classList.add("active");
        };
        thumbContainer.appendChild(thumb);
    });

    container.appendChild(thumbContainer);
}
/* =========================
   DETAILS SECTION
========================= */

function renderDetails() {
    const container = document.getElementById("detailsSection");
    // FIX: This removes the skeleton titles and tables
    container.innerHTML = "";

    const title = document.createElement("h1");
    title.innerText = product.name;
    container.appendChild(title);

    container.appendChild(createSpecificationTable());
    container.appendChild(createPricingTable());
}


/* =========================
   SPECIFICATION TABLE
========================= */

function createSpecificationTable() {
    const box = createTableBox("Product Specifications");

    const table = document.createElement("table");
    table.classList.add("product-display-table");
    for (let key in product.specifications) {
        const row = document.createElement("tr");

        const cell1 = document.createElement("td");

        cell1.classList.add("product-display-td");
        cell1.innerText = key;

        const cell2 = document.createElement("td");

        cell2.classList.add("product-display-td");
        cell2.innerText = product.specifications[key];

        row.appendChild(cell1);
        row.appendChild(cell2);
        table.appendChild(row);
    }

    box.appendChild(table);
    return box;
}


/* =========================
   PRICING TABLE
========================= */

function createPricingTable() {

    const { metalCost, makingCharges, hallmarkCharges, otherCharges, gstPercent, discountPercent, cashDiscount, discountText } = product.pricing;

    const subtotal = safeNum(metalCost) + safeNum(makingCharges) + safeNum(hallmarkCharges) + safeNum(otherCharges);
    const total = safeNum(subtotal + (subtotal * (gstPercent / 100))).toFixed(2);


    const box = createTableBox("Price Breakdown");
    const table = document.createElement("table");
    table.classList.add("product-display-table");
    addRow(table, "Metal Cost", formatCurrency(metalCost));
    addRow(table, "Making Charges", formatCurrency(makingCharges));
    addRow(table, "Hallmark Charges", formatCurrency(hallmarkCharges));
    addRow(table, "Other Charges", formatCurrency(otherCharges));


    if (discountPercent > 0) {
        const discountAmount = subtotal - (safeNum(makingCharges) * (discountPercent / 100));
        const gstAmount = discountAmount * (gstPercent / 100);

        addRow(table, "Discount", discountText);
        addRow(table, `GST (${gstPercent}%)`, formatCurrency(gstAmount));        

        const finalPrice = safeNum(discountAmount + gstAmount).toFixed(2);

        const row = document.createElement("tr");
        row.className = "product-display-total-row";

        const td1 = document.createElement("td");
        td1.classList.add("product-display-td");
        td1.innerText = "Total Price";

        const td2 = document.createElement("td");
        td2.classList.add("product-display-td");
        td2.innerHTML =
            `<span class="product-display-old-price">${formatCurrency(total)}</span>
                 <span class="product-display-final-price">${formatCurrency(finalPrice)}</span>`;

        row.appendChild(td1);
        row.appendChild(td2);
        table.appendChild(row);

    } else if (cashDiscount > 0) {
        const discountAmount = subtotal - cashDiscount;

        const gstAmount = discountAmount * (gstPercent / 100);

        addRow(table, "Discount", discountText);
        addRow(table, `GST (${gstPercent}%)`, formatCurrency(gstAmount));

        const finalPrice = safeNum(discountAmount + gstAmount).toFixed(2);

        const row = document.createElement("tr");
        row.className = "product-display-total-row";

        const td1 = document.createElement("td");
        td1.classList.add("product-display-td");
        td1.innerText = "Total Price";

        const td2 = document.createElement("td");
        td2.classList.add("product-display-td");
        td2.innerHTML =
            `<span class="product-display-old-price">${formatCurrency(total)}</span>
                 <span class="product-display-final-price">${formatCurrency(finalPrice)}</span>`;

        row.appendChild(td1);
        row.appendChild(td2);
        table.appendChild(row);

    } else {
        const gstAmount = subtotal * (gstPercent / 100);

        addRow(table, `GST (${gstPercent}%)`, formatCurrency(gstAmount));

        const row = document.createElement("tr");
        row.className = "total-row";

        const td1 = document.createElement("td");
        td1.classList.add("product-display-td");
        td1.innerText = "Total Price";

        const td2 = document.createElement("td");
        td2.classList.add("product-display-td");
        td2.innerHTML = `<span class="final-price">${formatCurrency(total)}</span>`;

        row.appendChild(td1);
        row.appendChild(td2);
        table.appendChild(row);
    }

    box.appendChild(table);
    return box;
}


/* =========================
   HELPER FUNCTIONS
========================= */

function createTableBox(titleText) {
    const box = document.createElement("div");
    box.className = "product-display-table-box";

    const title = document.createElement("h3");
    title.innerText = titleText;

    box.appendChild(title);
    return box;
}

function addRow(table, label, value) {
    const row = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.classList.add("product-display-td");
    td1.innerText = label;

    const td2 = document.createElement("td");
    td2.classList.add("product-display-td");
    td2.innerText = value;

    row.appendChild(td1);
    row.appendChild(td2);
    table.appendChild(row);
}

function formatCurrency(num) {
    num = Number(num).toFixed(2);
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        // Optional: Set decimal places (default is 2)
        maximumFractionDigits: 2,
    });

    return formatter.format(num);
    /*
    return "₹" + String(num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'INR'
    }));
    */
}