async function loadSlideshow() {
    const container = document.getElementById("slideshow");
    const captionEl = document.getElementById("slideshow-caption");
    const linkEl = document.getElementById("slideshow-link");

    try {
        const index = await fetch('slideshow-index.json').then(res => res.json());

        const slides = await Promise.all(index.map(async (path) => {
            const text = await fetch(path).then(res => res.text());
            const [_, fm] = text.match(/^---\n([\s\S]+?)\n---/) || [];

            const frontmatter = {};
            if (fm) {
                fm.split('\n').forEach(line => {
                    const [key, ...rest] = line.split(':');
                    frontmatter[key.trim()] = stripQuotes(rest.join(':').trim());
                });
            }

            return frontmatter;
        }));

        if (!slides.length) {
            console.error("No slides found!");
            return;
        }

        let current = 0;

        function showSlide(index) {
            const slide = slides[index];

            const img = document.createElement("img");
            img.src = slide.image;
            img.alt = slide.alt || '';
            img.style.opacity = 0;

            container.innerHTML = "";
            container.appendChild(img);

            setTimeout(() => {
                img.style.transition = "opacity 1s ease-in-out";
                img.style.opacity = 1;
            }, 50);

            captionEl.textContent = slide.text || '';
            linkEl.innerHTML = slide.link
                ? `<a href="${slide.link}" target="_blank" style="display:inline-block;margin-top:0.5rem;background:#fff;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;color:#d72830;font-weight:bold;box-shadow: var(--shadow);">Learn more</a>`
                : '';
        }

        showSlide(current);

        setInterval(() => {
            current = (current + 1) % slides.length;
            showSlide(current);
        }, 8000);

    } catch (err) {
        console.error("Failed to load slideshow", err);
        container.innerHTML = "<p>Could not load slideshow at this time.</p>";
    }
}

async function fetchFrontmatter(path) {
    try {
        const res = await fetch(path);
        const text = await res.text();

        const match = text.match(/^---\n([\s\S]+?)\n---/);
        if (!match) return {};

        const fm = match[1];
        const lines = fm.split('\n');
        const frontmatter = {};

        lines.forEach(line => {
            const [key, ...rest] = line.split(':');
            frontmatter[key.trim()] = stripQuotes(rest.join(':').trim());
        });

        return frontmatter;
    } catch (err) {
        console.error(`Error loading ${path}:`, err);
        return {};
    }
}
async function applyGlobalSettings() {
    const global = await fetchFrontmatter('content/settings/global.md');
    if (!global) return;

    const baseTitle = global.site_name || 'Rubber Duck Consulting';
    document.title = `${baseTitle}`;

    // Update meta tags
    const setMeta = (selector, content) => {
        if (!content) return;
        const el = document.querySelector(selector);
        if (el) el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', global.description);
    setMeta('meta[name="author"]', global.author);
    setMeta('meta[property="og:title"]', `${baseTitle}`);
    setMeta('meta[property="og:description"]', global.description);
    setMeta('meta[name="twitter:title"]', `${baseTitle}`);
    setMeta('meta[name="twitter:description"]', global.description);

    // Update <h1> site title if element exists
    const titleEl = document.getElementById("site-title");
    if (titleEl && global.site_name) {
        titleEl.innerHTML = `<a href="index.html">${global.site_name}</a>`;
    }

    const footerEl = document.getElementById("site-footer-name");
    if (footerEl && global.site_name) {
        footerEl.innerText = `${global.site_name}`;
    }

    // Inject CSS theme colors
    if (global.primary_color || global.secondary_color) {
        const style = document.createElement('style');
        style.innerHTML = `
            :root {
                --primary-color: ${global.primary_color || '#292b2a'};
                --secondary-color: ${global.secondary_color || '#c7ae6a'};
            }
        `;
        document.head.appendChild(style);
    }

    // Inject Google Analytics if ID is present
    if (global.google_analytics_id) {
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${global.google_analytics_id}`;
        document.head.appendChild(gtagScript);

        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${global.google_analytics_id}');
        `;
        document.head.appendChild(inlineScript);
    }
}

function stripQuotes(str) {
    if (typeof str !== "string") return str;
    return str.replace(/^['"]?(.*?)['"]?$/, '$1');
}

document.addEventListener("DOMContentLoaded", () => {
    applyGlobalSettings();    
    loadSlideshow();
});
