// Fetch the settings from home.md
async function getHomeSettings() {
    const res = await fetch('content/settings/home.md');
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

async function loadNews() {
    const container = document.getElementById("news-container");

    try {
        // Fetch the settings first to get the number of items to show
        const settings = await getHomeSettings();
        const limit = parseInt(settings.news_limit) || 3; // default to 3 if not set

        const index = await fetch('news-index.json').then(res => res.json());

        const posts = await Promise.all(index.map(async (path) => {
            const text = await fetch(path).then(res => res.text());

            const [_, fm, body] = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/) || [];
            const frontmatter = {};
            if (fm) {
                fm.split('\n').forEach(line => {
                    const [key, ...rest] = line.split(':');
                    frontmatter[key.trim()] = rest.join(':').trim();
                });
            }

            return {
                title: frontmatter.title,
                date: frontmatter.date,
                html: marked.parse(body),
            };
        }));

        // Sort posts by date, most recent first
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Slice the posts array to show only the configured number of posts
        const limitedPosts = posts.slice(0, limit);

        container.innerHTML = limitedPosts.map(post => `
            <div class="news-item">
                <h3>${post.title}</h3>
                <div class="news-meta">Posted on ${new Date(post.date).toLocaleDateString()}</div>
                ${post.html}
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = "<p>Could not load news at this time.</p>";
        console.error(err);
    }
}

async function loadTwitterFeed() {
    try {
        const res = await fetch('content/settings/home.md');
        const text = await res.text();

        const match = text.match(/^---\n([\s\S]+?)\n---/);
        if (!match) return;

        const fm = match[1];
        const lines = fm.split('\n');
        const frontmatter = {};

        lines.forEach(line => {
            const [key, ...rest] = line.split(':');
            frontmatter[key.trim()] = rest.join(':').trim();
        });

        const showTwitter = String(frontmatter.show_twitter).toLowerCase() === "true";

        const container = document.querySelector(".twitter-container");

        if (!showTwitter) {
            container.style.display = 'none';
            return;
        }

        const handle = frontmatter.twitter_handle || "RfcMorriston";

        container.innerHTML = `
            <a class="twitter-timeline"
               data-width="350"
               data-height="600"
               data-dnt="true"
               data-theme="dark"
               href="https://twitter.com/${handle}?ref_src=twsrc%5Etfw">
               Tweets by ${handle}
            </a>
        `;
        container.style.display = 'block';

        // Reload Twitter widgets
        if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') {
            window.twttr.widgets.load(container);
        } else {
            // If not already loaded, load script and then load widgets
            const script = document.createElement("script");
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            script.onload = () => window.twttr.widgets.load(container);
            document.body.appendChild(script);
        }

    } catch (err) {
        console.error("Failed to load Twitter feed", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadNews();
    loadTwitterFeed();
});