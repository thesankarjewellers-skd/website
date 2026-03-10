let allProducts = [];
const urlParams = new URLSearchParams(window.location.search);
const productCategory = urlParams.has('category') ? urlParams.get('category') : 'All';
const metalType = urlParams.has('metalType') ? urlParams.get('metalType') : 'Gold';
const productDesired = urlParams.has('product') ? urlParams.get('product') : 'All';

document.addEventListener("DOMContentLoaded", async () => {
    setSectionTitle(productCategory, metalType, productDesired);

    const productsGridID = document.getElementById("products-grid");

    // 1. Fetch products (Skeletons are already showing in HTML)
    allProducts = await sendDataToGAS(productCategory, metalType, productDesired);

    // 2. CLEAR the skeletons immediately before rendering
    productsGridID.innerHTML = "";

    if (!allProducts || allProducts.length === 0) {
        productsGrid.innerHTML = `<div class="no-results">No products found for this category.</div>`;
        return;
    }

    // 3. Render real products
    /*
    allProducts.forEach(product => {
        const card = createProductCard(product); // Assuming you have this function
        productsGrid.appendChild(card);
    });
    */
    const productsGrid = document.querySelector(".products-grid");
    const priceSlider = document.getElementById("price-range");
    const priceLabel = document.getElementById("current-price-label");

    // 2. Setup Slider Bounds ONLY IF data exists
    if (allProducts && allProducts.length > 0) {
        const prices = allProducts.map(product => cleanPrice(product.ColumnU));
        const minDataPrice = Math.min(...prices);
        const maxDataPrice = Math.max(...prices);

        // Set the slider attributes
        const minLimit = Number(minDataPrice * 0.995).toFixed(2);
        const maxLimit = Number(maxDataPrice * 1.005).toFixed(2);
        priceSlider.min = parseFloat(minLimit);
        priceSlider.max = parseFloat(maxLimit);
        // Ensure the thumb starts at the absolute max
        priceSlider.value = priceSlider.max;

        // Update UI labels
        document.getElementById("min-price-text").textContent = `₹ ${minLimit.toLocaleString()}`;
        document.getElementById("max-price-text").textContent = `₹ ${maxLimit.toLocaleString()}`;
        priceLabel.textContent = `Up to ₹ ${formatCurrency(maxDataPrice)}`;
    }

    // 3. Initial render (Call this ONLY ONCE)
    renderProducts(allProducts);

    // 4. Handle Slider Action
    priceSlider.addEventListener("input", (e) => {
        const currentMax = Number(e.target.value);
        priceLabel.textContent = `Up to ₹${formatCurrency(currentMax)}`;

        const filtered = allProducts.filter(product => {
            return cleanPrice(product.ColumnU) <= currentMax;
        });

        renderProducts(filtered);
    });
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

    // Helper function moved inside or outside
    function renderProducts(list) {
        productsGrid.innerHTML = "";

        list.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";

            // FIX: Use arrow function to prevent auto-opening
            card.addEventListener('click', () => openProductDisplayPageInNewTab(product.ColumnA));

            const stringSeparatedCat = `${product.ColumnE} ${product.ColumnG} ${product.ColumnH}`;
            card.setAttribute('data-category', stringSeparatedCat);
            const badgeHTML = product.ColumnW == "" || (product.ColumnW).toLowerCase() == "none" ? `` :`<div class="product-badge">${product.ColumnW}</div>`;
            card.innerHTML = `
                <div class="product-image lazy-bg" data-bg="${getURLOfImageFromDrive(product.ColumnI)}">
                    ${badgeHTML}
                </div>
                <div class="product-info">
                  <div class="product-category">${product.ColumnG} • ${product.ColumnH}</div>
                  <h3 class="product-name">${product.ColumnC}</h3>
                  <div class="product-details">
                    ${product.ColumnF ? `<span>⚖️ ${product.ColumnF} gm</span>` : ""}
                    ${product.ColumnG ? `<span>💎 ${product.ColumnG}</span>` : ""}
                  </div>
                  <div class="product-price">
                    <div class="price-amount">₹ ${formatCurrency(product.ColumnU)}</div>
                    <button class="inquire-btn">ID: ${getRelevantPart(product.ColumnA)}</button>
                  </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
        
        lazyLoadImages();
    }
    // REMOVED: Duplicate renderProducts call that was at the bottom
});

function getURLOfImageFromDrive(driveURL) {
    /*
        https://drive.google.com/open?id=1uphs7AAbCLDlW1B7Y7YKFNzmnDjFbvfs
    */
    var ID = driveURL.replace('https://drive.google.com/open?id=',"")
    var newURL = 'https://lh3.googleusercontent.com/d/' + ID + '?authuser=1/view';
    return newURL;
}
function openProductDisplayPageInNewTab(productID) {
    window.open("./ProductDisplay.html?ID=" + productID, "_blank");
}

/**
 * Utility to convert "₹15,000" or "5000" strings to actual Numbers
 */
function cleanPrice(priceStr) {
    if (!priceStr) return 0;
    // Removes non-numeric characters except decimals
    return Number(priceStr.toString().replace(/[^0-9.-]+/g, ""));
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

// To test:
// sendDataToGAS();
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