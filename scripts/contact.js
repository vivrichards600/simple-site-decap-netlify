// Fetch the settings from contact.md
async function getContactSettings() {
    const res = await fetch('content/settings/contact.md');
    const text = await res.text();

    const match = text.match(/^---\n([\s\S]+?)\n---/);
    if (!match) return {};

    const fm = match[1];
    const lines = fm.split('\n');
    const frontmatter = {};

    lines.forEach(line => {
        const [key, ...rest] = line.split(':');
        frontmatter[key.trim()] = rest.join(':').trim();
    });

    return frontmatter;
}

// Load and display the contact information on the page
async function loadContactInfo() {
    const settings = await getContactSettings();

    const contactInfoContainer = document.getElementById("contact-info");
    const contactMapContainer = document.getElementById("contact-map");

    if (!contactInfoContainer) return;

    const { address_line_1, address_line_2, address_line_3, city, postcode, phone, facebook_handle, twitter_handle, google_maps_location } = settings;

    // Display Address
    let addressHtml = `<p><strong>Address:</strong><br>${address_line_1}<br>`;
    if (address_line_2) addressHtml += `${address_line_2}<br>`;
    if (address_line_3) addressHtml += `${address_line_3}<br>`;
    addressHtml += `${city}<br>${postcode}</p>`;
    contactInfoContainer.innerHTML = addressHtml;

    // Display Phone
    if (phone) {
        contactInfoContainer.innerHTML += `<p><strong>Telephone:</strong> <a href="tel:${phone}">${phone}</a></p>`;
    }

    // Display Facebook link if available
    if (facebook_handle) {
        contactInfoContainer.innerHTML += `
            <p>
                <a href="https://www.facebook.com/${facebook_handle}" target="_blank" style="margin-top:10px;display:inline-block;background:#3b5998;color:#fff;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;font-weight:bold;">
                    <i class="fab fa-facebook-f" style="padding-right:10px;"></i> Visit us on Facebook
                </a>
            </p>
        `;
    }

    // Display Twitter link if available
    if (twitter_handle) {
        contactInfoContainer.innerHTML += `
            <p>
                <a href="https://twitter.com/${twitter_handle}" target="_blank" style="margin-top:10px;display:inline-block;background:#000000;color:#fff;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;font-weight:bold;">
                    <i class="fab fa-x-twitter" style="padding-right:10px;"></i> Visit us on X
                </a>
            </p>
        `;
    }

    // Display Google Map Embed if available
    if (google_maps_location) {
        contactMapContainer.innerHTML = google_maps_location; // Directly use the embed code
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadContactInfo();
});
