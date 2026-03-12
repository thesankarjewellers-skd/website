let allProducts = [];
const urlParams = new URLSearchParams(window.location.search);
const productCategory = urlParams.has('category') ? urlParams.get('category') : 'All';
const metalType = urlParams.has('metalType') ? urlParams.get('metalType') : 'Gold';
const productDesired = urlParams.has('product') ? urlParams.get('product') : 'All';

/**
 * Utility to safely convert any value to a number
 */
const safeNum = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
};

/**
 * Utility to convert "₹15,000" or "5000" strings to actual Numbers
 */
function cleanPrice(priceStr) {
    if (priceStr === null || priceStr === undefined) return 0;
    // Removes non-numeric characters except decimals
    const cleaned = priceStr.toString().replace(/[^0-9.-]+/g, "");
    return safeNum(cleaned);
}

document.addEventListener("DOMContentLoaded", async () => {
    setSectionTitle(productCategory, metalType, productDesired);

    const productsGrid = document.querySelector(".products-grid");
    const priceSlider = document.getElementById("price-range");
    const priceLabel = document.getElementById("current-price-label");

    // 1. Fetch products
    allProducts = await sendDataToGAS(productCategory, metalType, productDesired);

    // 2. CLEAR the skeletons
    if (productsGrid) productsGrid.innerHTML = "";

    if (!allProducts || allProducts.length === 0) {
        if (productsGrid) productsGrid.innerHTML = `<div class="no-results">No products found for this category.</div>`;
        return;
    }

    // 3. Setup Slider Bounds
    const prices = allProducts.map(product => cleanPrice(product.ColumnU));
    const minDataPrice = Math.min(...prices);
    const maxDataPrice = Math.max(...prices);

    if (priceSlider) {
        const minLimit = (minDataPrice * 0.995);
        const maxLimit = (maxDataPrice * 1.005);

        priceSlider.min = minLimit;
        priceSlider.max = maxLimit;
        priceSlider.value = maxLimit;

        // Update UI labels
        const minText = document.getElementById("min-price-text");
        const maxText = document.getElementById("max-price-text");

        if (minText) minText.textContent = formatCurrency(minLimit);
        if (maxText) maxText.textContent = formatCurrency(maxLimit);
        if (priceLabel) priceLabel.textContent = `Up to ${formatCurrency(maxDataPrice)}`;

        // Handle Slider Action
        priceSlider.addEventListener("input", (e) => {
            const currentMax = safeNum(e.target.value);
            if (priceLabel) priceLabel.textContent = `Up to ${formatCurrency(currentMax)}`;

            const filtered = allProducts.filter(product => {
                return cleanPrice(product.ColumnU) <= currentMax;
            });
            renderProducts(filtered, productsGrid);
        });
    }

    // 4. Initial render
    renderProducts(allProducts, productsGrid);
});

function renderProducts(list, container) {
    if (!container) return;
    container.innerHTML = "";

    list.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        // Click to open details
        const prodID = String(product.ColumnA || "").trim();
        card.addEventListener('click', () => openProductDisplayPageInNewTab(prodID));

        // Data attributes for filtering/SEO
        const cat = String(product.ColumnG || "").trim();
        const subCat = String(product.ColumnH || "").trim();
        const metal = String(product.ColumnE || "").trim();
        const badgeText = String(product.ColumnW || "").trim();

        const stringSeparatedCat = `${metal} ${cat} ${subCat}`;
        card.setAttribute('data-category', stringSeparatedCat);

        const badgeHTML = (badgeText === "" || badgeText.toLowerCase() === "none")
            ? ""
            : `<div class="product-badge">${badgeText}</div>`;

        card.innerHTML = `
            <div class="product-image lazy-bg" data-bg="${getURLOfImageFromDrive(product.ColumnI)}">
                ${badgeHTML}
            </div>
            <div class="product-info">
              <div class="product-category">${cat} • ${subCat}</div>
              <h3 class="product-name">${String(product.ColumnC || "Elegant Jewelry").trim()}</h3>
              <div class="product-details">
                ${product.ColumnF ? `<span>⚖️ ${safeNum(product.ColumnF).toFixed(3)} g</span>` : ""}
                ${cat ? `<span>💎 ${cat}</span>` : ""}
              </div>
              <div class="product-price">
                <div class="price-amount">${formatCurrency(cleanPrice(product.ColumnU))}</div>
                <button class="inquire-btn">ID: ${getRelevantPart(prodID)}</button>
              </div>
            </div>
        `;
        container.appendChild(card);
    });

    lazyLoadImages();
}

function getURLOfImageFromDrive(driveURL) {
    if (!driveURL || typeof driveURL !== 'string') return "";
    const match = driveURL.match(/[-\w]{25,}/);
    const ID = match ? match[0] : null;
    return ID ? `https://lh3.googleusercontent.com/d/${ID}` : "";
}

function getRelevantPart(inputString) {
    if (!inputString) return "N/A";
    const parts = inputString.split("@$");
    return (parts[0] && parts[0] !== "") ? parts[0] : (parts[1] || inputString);
}

function formatCurrency(num) {
    const amount = safeNum(num);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2, // Prices usually look cleaner without decimals in grids
    }).format(amount);
}

// ... Keep your existing setSectionTitle, sendDataToGAS, and lazyLoadImages as they are ...
function openProductDisplayPageInNewTab(productID) {
    window.open("./ProductDisplay.html?ID=" + productID, "_blank");
}

function setSectionTitle(category, metalType, productDesired) {
    switch (category) {
        case "Women":
            if (metalType == "Gold") {
                if (productDesired == "OtherProducts") {
                    document.getElementById("section_title").innerHTML = "Showing results for Women " + metalType + " Jewellery";
                } else if (productDesired == "MangTikka") {
                    document.getElementById("section_title").innerHTML = "Showing results for Women " + metalType + " Mang Tikka";
                } else {
                    document.getElementById("section_title").innerHTML = "Showing results for Women " + metalType + " " + productDesired;
                }
            }
            else if (metalType == "Silver") {
                document.getElementById("section_title").innerHTML = "Showing results for Women " + metalType + " Jewellery ";
            }
            else {
                document.getElementById("section_title").innerHTML = "Showing results for Women Jewellery";
            }
            break;
        case "Men":
            if (metalType == "Gold") {
                if (productDesired == "OtherProducts") {
                    document.getElementById("section_title").innerHTML = "Showing results for Men " + metalType + " Jewellery";
                } else if (productDesired == "TiePin") {
                    document.getElementById("section_title").innerHTML = "Showing results for Men " + metalType + " Tie Pin";
                } else {
                    document.getElementById("section_title").innerHTML = "Showing results for Men " + metalType + " " + productDesired;
                }
            }
            else if (metalType == "Silver") {
                document.getElementById("section_title").innerHTML = "Showing results for Men " + metalType + " Jewellery ";
            }
            else {
                document.getElementById("section_title").innerHTML = "Showing results for Men Jewellery";
            }
            break;
        case "Kids":
            if (metalType == "Gold") {
                if (productDesired == "OtherProducts") {
                    document.getElementById("section_title").innerHTML = "Showing results for Kids " + metalType + " Jewellery";
                } else if (productDesired == "BabyBracelet") {
                    document.getElementById("section_title").innerHTML = "Showing results for Kids " + metalType + " Baby Bracelet";
                } else {
                    document.getElementById("section_title").innerHTML = "Showing results for Kids " + metalType + " " + productDesired;
                }
            }
            else if (metalType == "Silver") {
                document.getElementById("section_title").innerHTML = "Showing results for Kids " + metalType + " Jewellery ";
            }
            else {
                document.getElementById("section_title").innerHTML = "Showing results for Kids Jewellery";
            }
            break;
        case "All":
            if (metalType == "Gold") {
                document.getElementById("section_title").innerHTML = "Showing results for Gold Jewellery";
            }
            else if (metalType == "Silver") {
                if (productDesired == "OtherProducts") {
                    document.getElementById("section_title").innerHTML = "Showing results for Silver Jewellery";
                } else if (productDesired != "All") {
                    document.getElementById("section_title").innerHTML = "Showing results for Silver " + productDesired;
                } else {
                    document.getElementById("section_title").innerHTML = "Discover our handcrafted jewellry pieces, each telling a unique story of tradition and elegance";
                }
            }
            else
                document.getElementById("section_title").innerHTML = "Discover our handcrafted jewellry pieces, each telling a unique story of tradition and elegance";
            break;
        default:
            // Code to execute if none of the cases match
            document.getElementById("section_title").innerHTML = "Discover our handcrafted jewellry pieces, each telling a unique story of tradition and elegance";
    }
}

async function convertCategoriesToStringSeperatedBySpace(categories) {
    if (Array.isArray(categories))
        return categories.join(' ');
    else
        return "";
}

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll(".lazy-bg");
    if (!("IntersectionObserver" in window)) {
        // Fallback: load all immediately
        lazyImages.forEach(img => {
            img.style.backgroundImage = `url('${img.dataset.bg}')`;
            img.classList.add("loaded");
        });
        return;
    }
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                el.style.backgroundImage = `url('${el.dataset.bg}')`;
                el.classList.add("loaded");

                observer.unobserve(el);
            });
        },
        {
            rootMargin: "200px 0px", // preload before visible
            threshold: 0.01
        }
    );
    lazyImages.forEach(img => observer.observe(img));
}

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        filterProducts(btn.dataset.filter, btn);
    });
});


const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwjH8D59LiFixoeJ179AYxB_ANOI9lV6SvLKSbTvko68MqixocG4EuXEO2VYKycSuTR/exec";

async function sendDataToGAS(productCategory, metalType, productDesired) {
    const dataToSend = {
        module: "getFilteredProducts",
        productCategory: productCategory,
        metalType: metalType,
        productDesired: productDesired,
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
