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

async function update24KGold999SilverPrices(range) {
    //sheetDetails = await fetchSheetDetails(spreadsheetId, range);
    sheetDetails = await sendDataToGAS("update24KGold999SilverPrices")
    document.getElementById("18k-gold-rate").innerHTML = formatCurrency(String(sheetDetails[2]).trim());
    document.getElementById("22k-gold-rate").innerHTML = formatCurrency(String(sheetDetails[1]).trim());
    document.getElementById("24k-gold-rate").innerHTML = formatCurrency(String(sheetDetails[0]).trim());
    document.getElementById("silver-rate").innerHTML = formatCurrency(String(sheetDetails[6]).trim());
}
async function fetchOffersFromGoogleSheet(range) {
    var offersFromSheet = [];
    //var dataFromSheet = await fetchSheetDetails(spreadsheetId, range);
    var dataFromSheet = await sendDataToGAS("fetchOffersFromGoogleSheet")
    dataFromSheet.forEach(item => {
        offer = { title: item[0], sub: item[1], img: item[2] };
        offersFromSheet.push(offer);
    });
    return offersFromSheet;
}
// 2. Data
var offers = [];

const style = document.createElement('style');
style.textContent = `
                :root {
                    --gold_offer: #d4af37;
                    --dark_offer: #1a1410;
                    --bg_offer: #FFFFFF;
                }

                .index-offer-slider-viewport {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                    /* Remove any side margins that might shrink the content area */
                    margin: 40px 0;
                }

                .index-offer-slider-track {
                    display: flex;
                    transition: transform 0.5s ease-in-out;
                }

                .index-offer-card {
                    flex: 0 0 100%;
                    height: 400px; /* Reduced base height for mobile */
                    padding: 0 10px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }

                .index-offer-img-zone img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* CHANGED: maintains aspect ratio */
                }

                /* 60% Image / 15% Heading / 25% Subtitle */
                .index-offer-img-zone { height: 60%; width: 100%; overflow: hidden; border-radius: 8px 8px 0 0; }

                .index-offer-head-zone {
                    height: 15%; background: var(--dark_offer); color: var(--gold_offer);
                    display: flex; align-items: center; justify-content: center;
                    text-transform: uppercase; letter-spacing: 2px; font-weight: bold;
                    padding: 0 10px; text-align: center;
                }

                .index-offer-sub-zone {
                    height: 25%; background: #fff; padding: 20px;
                    text-align: center; border: 1px solid #eee; border-radius: 0 0 8px 8px;
                    display: flex; align-items: center; justify-content: center;
                    color: #444; font-size: 1rem; line-height: 1.4;
                }

                
                /* Responsive: 3 slides on large screens */
                @media (min-width: 1024px) {
                    .index-offer-card { flex: 0 0 33.333%; }
                }

                /* Desktop 360px Fix */
                @media (max-width: 360px) {
                    .index-offer-card { height: 420px; }
                    .index-offer-head-zone { font-size: 0.8rem; }
                }
                // Inside your style.textContent string in index.js:
            `;
document.head.appendChild(style);

async function createSlider() {
    const root = document.getElementById('index-offer-slider-root');
    const viewport = document.createElement('div');
    viewport.className = 'index-offer-slider-viewport';

    const track = document.createElement('div');
    track.className = 'index-offer-slider-track';

    offers.forEach(item => {
        const card = document.createElement('div');
        card.className = 'index-offer-card';
        card.innerHTML = `
                        <div class="index-offer-img-zone"><img src="${item.img}"></div>
                        <div class="index-offer-head-zone"><span>${item.title}</span></div>
                        <div class="index-offer-sub-zone"><p>${item.sub}</p></div>
                    `;
        track.appendChild(card);
    });

    // --- FIFO LOGIC: CLONING ---
    // We clone the first 3 slides (max visible) and add them to the end
    const clonesToAppend = 3;
    for (let i = 0; i < clonesToAppend; i++) {
        const clone = track.children[i].cloneNode(true);
        track.appendChild(clone);
    }

    viewport.appendChild(track);
    root.appendChild(viewport);

    // 2. Animation Logic
    let currentIndex = 0;
    const totalOriginals = offers.length;

    function slide() {
        currentIndex++;

        // Ensure this matches your CSS Breakpoints exactly
        const isDesktop = window.innerWidth >= 1024;
        const slideWidth = isDesktop ? 33.3333 : 100;

        track.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;

        if (currentIndex === totalOriginals) {
            setTimeout(() => {
                track.style.transition = "none";
                currentIndex = 0;
                track.style.transform = `translateX(0)`;
            }, 500); // Match this to your transition duration
        }
    }

    // Auto-play every 4 seconds
    let timer = setInterval(slide, 3000);

    // Pause on Hover
    viewport.onmouseenter = () => clearInterval(timer);
    viewport.onmouseleave = () => timer = setInterval(slide, 4000);
}

function navigateToProductGrid(url) {
    window.location.href = url;
}

document.addEventListener("DOMContentLoaded", async () => {
    const data_range = "Master!D4:D10";
    await update24KGold999SilverPrices(data_range);
    const data_range1 = "Master!B17:D22";
    offers = await fetchOffersFromGoogleSheet(data_range1);
    console.log(offers);
    await createSlider();

});

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwjH8D59LiFixoeJ179AYxB_ANOI9lV6SvLKSbTvko68MqixocG4EuXEO2VYKycSuTR/exec";
//fetching content of spreadsheet
async function sendDataToGAS(module_desired) {
    const dataToSend = {
        module: module_desired,
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


