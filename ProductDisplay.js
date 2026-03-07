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
const productID = urlParams.has('ID') ? urlParams.get('ID') : 104;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Fetch products
    allProductDetails = await sendDataToGAS(productID);
    if (allProductDetails && allProductDetails.length == 1) {
        allProductDetails.forEach(prodDet => {
            product['name'] = prodDet.ColumnC;
            product['badge'] = prodDet.ColumnW;
            let spec = {};
            spec['Category'] = prodDet.ColumnG + " • " + prodDet.ColumnH;
            spec['Product ID'] = prodDet.ColumnA;

            if (prodDet.ColumnG.toLowerCase().includes("gold")) {
                spec['Purity'] = prodDet.ColumnG;
                spec['Metal'] = "Gold";
            } else if ((prodDet.ColumnG).toLowerCase().includes("silver")) {
                spec['Metal'] = "Silver";
            }
            spec['Weight'] = (prodDet.ColumnF).toFixed(3) + " gms";
            spec['Description'] = prodDet.ColumnD = "" ? "Elegant " + prodDet.ColumnE + " " + prodDet.ColumnG + " " + prodDet.ColumnH : prodDet.ColumnD;
            product['specifications'] = spec;
            let pricng = {};
            pricng['metalCost'] = Number(prodDet.ColumnT * prodDet.ColumnF).toFixed(2);
            pricng['makingCharges'] = Number(Number(prodDet.ColumnT) * Number(prodDet.ColumnF) * Number(prodDet.ColumnN) + Number(prodDet.ColumnM)).toFixed(2);
            pricng['hallmarkCharges'] = prodDet.ColumnL.toFixed(2);
            pricng['otherCharges'] = prodDet.ColumnO.toFixed(2);
            pricng['gstPercent'] = 3;
            if (prodDet.ColumnP == "") {
                pricng['discountPercent'] = 0;
                pricng['cashDiscount'] = 0;
                pricng['discountText'] = "";
            } else if (prodDet.ColumnP == "Percentage discount (any value between 1 and 100)") {
                pricng['discountPercent'] = prodDet.ColumnQ.toFixed(2);
                pricng['cashDiscount'] = 0;
                pricng['discountText'] = prodDet.ColumnS;
            } else if (prodDet.ColumnP == "Cash price discount") {
                pricng['discountPercent'] = 0;
                pricng['cashDiscount'] = prodDet.ColumnQ.toFixed(2);
                pricng['discountText'] = prodDet.ColumnS;
            } else {
                pricng['discountPercent'] = 0;
                pricng['cashDiscount'] = 0;
                pricng['discountText'] = "";
            }

            product['pricing'] = pricng;
            let imgs = [];
            imgs.push(getURLOfImageFromDrive(prodDet.ColumnI));
            imgs.push(getURLOfImageFromDrive(prodDet.ColumnJ));
            imgs.push(getURLOfImageFromDrive(prodDet.ColumnK));
            product['images'] = imgs;
        });
    }
    /* =========================
        INITIAL RENDER
    ========================= */

    renderImages();
    renderDetails();
});
function getURLOfImageFromDrive(driveURL) {
    /*
        https://drive.google.com/open?id=1uphs7AAbCLDlW1B7Y7YKFNzmnDjFbvfs
    */
    var ID = driveURL.replace('https://drive.google.com/open?id=', "")
    var newURL = 'https://lh3.googleusercontent.com/d/' + ID + '?authuser=1/view';
    return newURL;
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

    const subtotal = Number(metalCost) + Number(makingCharges) + Number(hallmarkCharges) + Number(otherCharges);
    const total = Number(subtotal + (subtotal * (gstPercent / 100))).toFixed(2);


    const box = createTableBox("Price Breakdown");
    const table = document.createElement("table");
    table.classList.add("product-display-table");
    addRow(table, "Metal Cost", formatCurrency(metalCost));
    addRow(table, "Making Charges", formatCurrency(makingCharges));
    addRow(table, "Hallmark Charges", formatCurrency(hallmarkCharges));
    addRow(table, "Other Charges", formatCurrency(otherCharges));


    if (discountPercent > 0) {
        const discountAmount = subtotal - (subtotal * (discountPercent / 100));
        const gstAmount = discountAmount * (gstPercent / 100);

        addRow(table, "Discount", discountText);
        addRow(table, `GST (${gstPercent}%)`, formatCurrency(gstAmount));        

        const finalPrice = Math.round(discountAmount + gstAmount, 2);

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

        const finalPrice = Math.round(discountAmount + gstAmount, 2);

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