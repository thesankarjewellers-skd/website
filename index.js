//fetching content of spreadsheet
const API_KEY = "AIzaSyC_cQUuttIlS_10rsJxnuO7526Gsv4ufRs";
const spreadsheetId = "1SYq-y_sbLArhOG-Z9g2LdTEutF8omPjTZAh3B3qAVsc";
let userID = "";
let passwd = "";
async function fetchSheetDetails(spreadsheetId, range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        const detailsFetched = data.values;
        return detailsFetched;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function update24KGold999SilverPrices(range) {
    sheetDetails = await fetchSheetDetails(spreadsheetId, range);
    document.getElementById("18k-gold-rate").innerHTML = sheetDetails[2];
    document.getElementById("22k-gold-rate").innerHTML = sheetDetails[1];
    document.getElementById("24k-gold-rate").innerHTML = sheetDetails[0];
    document.getElementById("silver-rate").innerHTML = sheetDetails[6];
}
async function fetchOffersFromGoogleSheet(range) {
    var offersFromSheet = [];
    var dataFromSheet = await fetchSheetDetails(spreadsheetId, range);
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
                    max-width: 1200px;
                    margin: 40px auto;
                    overflow: hidden;
                    position: relative;
                    background: var(--bg);
                }

                .index-offer-slider-track {
                    display: flex;
                    will-change: transform;
                }

                .index-offer-card {
                    flex: 0 0 100%; /* Default Mobile */
                    height: 480px;
                    padding: 0 10px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }

                /* 60% Image / 15% Heading / 25% Subtitle */
                .index-offer-img-zone { height: 60%; width: 100%; overflow: hidden; border-radius: 8px 8px 0 0; }
                .index-offer-img-zone img { width: 100%; height: 100%; object-fit: fill; }

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

        // Determine width based on screen size (100% for 360px mobile, 33.33% for desktop)
        const isMobile = window.innerWidth < 1024;
        const slideWidth = isMobile ? 100 : 33.333;

        track.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;

        // When we reach the clone of the first slide
        if (currentIndex === totalOriginals) {
            setTimeout(() => {
                // Instantly teleport back to the start
                track.style.transition = "none";
                currentIndex = 0;
                track.style.transform = `translateX(0)`;
            }, 800); // Wait exactly for the animation duration (0.8s)
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

