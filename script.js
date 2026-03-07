//nav menu small screens
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

function toggleSideMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');

    menu.classList.toggle('active');
    overlay.classList.toggle('active');

    // Prevent background scrolling when menu is open
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : 'auto';
}

function toggleAccordion(btn) {
    // Toggle the + / - icon
    const icon = btn.querySelector('span');
    icon.textContent = icon.textContent === '+' ? '−' : '+';

    // Expand/Collapse content
    const content = btn.nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach(card => {
        card.addEventListener("click", function (e) {

            // Prevent action button click from closing
            if (e.target.classList.contains("action-btn")) {
                return;
            }

            // Close other open cards
            productCards.forEach(c => {
                if (c !== card) {
                    c.classList.remove("active");
                }
            });

            // Toggle current card
            card.classList.toggle("active");
        });
    });

    // Close dropdown if clicking outside
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".product-card")) {
            productCards.forEach(c => c.classList.remove("active"));
        }
    });

});
function AlertContactDetails() {
    alert("Call us at: +91 phone number - change this later.")
}