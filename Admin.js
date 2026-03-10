// Admin.js - Optimized for Responsiveness
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    :root {
        --primary: #38bdf8;
        --bg-dark: #0f172a;
        --glass: rgba(255, 255, 255, 0.05);
        --error: #ef4444;
    }

    /* Update viewport to be responsive within its parent */
    .main-viewport {
        display: flex; 
        justify-content: center; 
        align-items: center;
        width: 100%; 
        min-height: 70vh; 
        position: relative;
    }

    .card {
        background: var(--glass);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        padding: 2rem; /* Reduced for mobile */
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        width: 100%; 
        max-width: 360px; /* Perfect for 360px screens */
        z-index: 10; 
        text-align: center;
        opacity: 0; 
        transform: translateY(20px);
        transition: opacity 0.6s, transform 0.6s;
    }

    @media (max-width: 360px) {
        .card { padding: 1.5rem; }
        h1 { font-size: 1.5rem; }
    }

    .card-active { opacity: 1; transform: translateY(0); }
    .field-group { position: relative; margin-bottom: 2rem; width: 100%; }
    .input-box {
        width: 100%; padding: 0.8rem 0; background: transparent;
        border: none; border-bottom: 2px solid #334155;
        color: white; font-size: 16px; outline: none;
    }
    .float-label {
        position: absolute; left: 0; top: 0.8rem;
        color: #94a3b8; pointer-events: none; transition: 0.3s;
    }
    .input-box:focus ~ .float-label,
    .input-box:not(:placeholder-shown) ~ .float-label {
        top: -1.2rem; font-size: 0.8rem; color: var(--primary);
    }
    .btn-submit {
        width: 100%; padding: 1rem; border-radius: 0.8rem;
        border: none; background: var(--primary); color: var(--bg-dark);
        font-weight: 700; cursor: pointer; transition: 0.3s;
    }
`;
document.head.appendChild(styleSheet);

async function init() {
    // Target the outer container to ensure background logic works
    const app = document.getElementById('display_area');
    app.innerHTML = '';

    const viewport = document.createElement('div');
    viewport.className = 'main-viewport';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h1 style="color:white; margin-bottom:2rem; font-family: 'Cormorant Garamond';">Admin Login</h1>
        <form id="loginForm" autocomplete="off">
            <div class="field-group">
                <input type="text" id="user" class="input-box" placeholder=" " required autocomplete="off">
                <label class="float-label">Username</label>
            </div>
            <div class="field-group">
                <input type="password" id="pass" class="input-box" placeholder=" " required autocomplete="off">
                <label class="float-label">Password</label>
            </div>
            <button type="submit" class="btn-submit" id="btn">Login</button>
        </form>
    `;

    viewport.append(card);
    app.appendChild(viewport);

    requestAnimationFrame(() => card.classList.add('card-active'));

    const form = document.getElementById('loginForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        const btn = document.getElementById('btn');
        btn.innerText = "Verifying...";
        btn.disabled = true;

        try {
            const key = u.toLowerCase() + p;
            const cred = await sendDataToGAS(key)

            //const cred = await fetchSheetDetails(sourceID, master_range);
            if ("rtyhbvcxdghbdfg545454hgfcvbfc_kjb@gfh" === String(cred).trim()) {
                displayLinks();
            } else {
                throw new Error("Invalid");
            }
        } catch (err) {
            btn.innerText = "Login";
            btn.disabled = false;
            card.classList.add('shake');
            btn.style.backgroundColor = 'var(--error)';
            setTimeout(() => {
                card.classList.remove('shake');
                btn.style.backgroundColor = 'var(--primary)';
            }, 500);
        }
    };
}

function displayLinks() {
    const app = document.getElementById('display_area');
    // Wrap links in a styled container so they are visible against the dark background
    app.innerHTML = `
        <div class="main-viewport">
            <div class="admin-links-container">
                <h2 style="color: var(--primary); margin-bottom: 1rem;">Admin Actions</h2>
                <a class="admin-link" href="https://forms.gle/z9VdW5ZJkr5vNdKX8" target="_blank">➕ Add New Products</a>
                <a class="admin-link" href="https://docs.google.com/spreadsheets/d/1SYq-y_sbLArhOG-Z9g2LdTEutF8omPjTZAh3B3qAVsc/edit?gid=1930317166#gid=1930317166" target="_blank">💰 Modify Metal Prices</a>
                <a class="admin-link" href="./Admin.html">Logout</a>
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
    await init();
});

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwjH8D59LiFixoeJ179AYxB_ANOI9lV6SvLKSbTvko68MqixocG4EuXEO2VYKycSuTR/exec";

async function sendDataToGAS(key_to_validate) {
    const dataToSend = {
        module: "validateKey",
        key: key_to_validate,
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
