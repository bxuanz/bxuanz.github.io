document.addEventListener("DOMContentLoaded", initPage);

async function initPage() {
    const [profile, education, honors, interests, publications] = await Promise.all([
        fetchJson("data/profile.json"),
        fetchJson("data/education.json"),
        fetchJson("data/honors.json"),
        fetchJson("data/interests.json"),
        fetchJson("data/publications.json"),
    ]);

    if (profile) {
        renderProfile(profile);
        renderAboutHighlights(profile);
    }

    renderNews(profile, honors || [], publications || [], education || []);
    renderEducation(education || []);
    renderHonors(honors || []);
    renderInterests(interests || []);
    renderPublications(publications || []);

    setText("footer-year", new Date().getFullYear());
    setText("footer-name", profile?.name || "");
}

async function fetchJson(path) {
    try {
        const response = await fetch(`${path}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Could not load ${path}:`, error);
        return null;
    }
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value ?? "";
    }
}

function setHtml(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = value ?? "";
    }
}

function validLink(value) {
    const normalized = typeof value === "string" ? value.trim() : "";
    return Boolean(normalized && normalized !== "#" && !/[?&]user=$/.test(normalized));
}

function applyLink(id, href, options = {}) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    if (!validLink(href)) {
        element.classList.add("hidden");
        return;
    }

    element.href = href;
    element.classList.remove("hidden");

    if (options.newTab === false || href.startsWith("mailto:")) {
        element.removeAttribute("target");
        element.removeAttribute("rel");
    } else {
        element.target = "_blank";
        element.rel = "noreferrer";
    }
}

function renderProfile(profile) {
    document.title = `${profile.name} | Academic Homepage`;

    setText("profile-name-main", profile.name);
    setText("profile-role", profile.title);
    setText("profile-uni", profile.university);
    setText("profile-current-focus", profile.currentFocus || "");
    setText("profile-location", profile.location || "");
    setText("profile-motto", profile.motto ? `"${profile.motto}"` : "");
    setHtml("profile-bio", profile.bio || "");
    setText("profile-research-statement", profile.researchStatement || "");

    const avatar = document.getElementById("profile-avatar");
    if (avatar) {
        avatar.src = profile.avatar || "";
        avatar.alt = profile.name ? `${profile.name} portrait` : "Portrait";
    }

    const caption = document.getElementById("profile-avatar-caption");
    if (caption) {
        if (profile.avatarCaption) {
            caption.textContent = profile.avatarCaption;
            caption.classList.remove("hidden");
        } else {
            caption.classList.add("hidden");
        }
    }

    const email = profile.email || "";
    setText("profile-email", email || "Email unavailable");
    applyLink("profile-email-link", email ? `mailto:${email}` : "", { newTab: false });

    const links = profile.links || {};
    applyLink("profile-link-github", links.github);
    applyLink("profile-link-scholar", links.scholar);
    applyLink("profile-link-cv", links.cv);

    const tagContainer = document.getElementById("profile-focus-tags");
    if (tagContainer) {
        tagContainer.innerHTML = (profile.focusAreas || [])
            .map((area) => `<span class="focus-tag">${area}</span>`)
            .join("");
    }
}

function renderAboutHighlights(profile) {
    const container = document.getElementById("about-highlights");
    if (!container) {
        return;
    }

    const areas = profile.focusAreas || [];
    const emphasis = areas.length ? areas.join(", ") : "computer vision and generative modeling";

    const items = [
        `My research interests lie in <strong>${emphasis}</strong>.`,
        `I am currently focusing on <strong>${profile.currentFocus || "robust visual modeling"}</strong>.`,
        `If you are interested in collaboration or discussion, feel free to reach out via email.`,
    ];

    container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderNews(profile, honors, publications, education) {
    const container = document.getElementById("news-list");
    if (!container) {
        return;
    }

    const items = [];

    publications.forEach((paper) => {
        items.push({
            year: Number.parseInt(paper.year, 10) || 0,
            priority: 0,
            html: `<strong>${paper.year}:</strong> ${paper.title} was published in <em>${paper.journal}</em>.`,
        });
    });

    honors.forEach((honor) => {
        items.push({
            year: Number.parseInt(honor.year, 10) || 0,
            priority: 1,
            html: `<strong>${honor.year}:</strong> Received ${honor.title}.`,
        });
    });

    education.forEach((entry) => {
        const startYear = Number.parseInt(String(entry.year).slice(0, 4), 10) || 0;
        items.push({
            year: startYear,
            priority: 2,
            html: `<strong>${startYear}:</strong> Began ${entry.degree} at ${entry.school}.`,
        });
    });

    if (profile?.currentFocus) {
        items.push({
            year: new Date().getFullYear(),
            priority: 3,
            html: `<strong>${new Date().getFullYear()}:</strong> Current focus: ${profile.currentFocus}.`,
        });
    }

    items.sort((left, right) => {
        if (right.year !== left.year) {
            return right.year - left.year;
        }
        return left.priority - right.priority;
    });

    const visible = items.slice(0, 8);

    if (!visible.length) {
        container.innerHTML = `<li class="empty-copy">News items will appear here as updates are added.</li>`;
        return;
    }

    container.innerHTML = visible.map((item) => `<li>${item.html}</li>`).join("");
}

function renderEducation(education) {
    const container = document.getElementById("education-list");
    if (!container) {
        return;
    }

    if (!education.length) {
        container.innerHTML = `<p class="empty-copy">Education details are not available yet.</p>`;
        return;
    }

    container.innerHTML = education
        .map(
            (entry) => `
        <article class="list-row">
            <div class="list-main">
                <h3 class="list-title">${entry.degree}</h3>
                <p class="list-subtitle">${entry.school}</p>
                <p class="list-description">${entry.description || ""}</p>
            </div>
            <span class="list-year">${entry.year}</span>
        </article>
    `,
        )
        .join("");
}

function renderHonors(honors) {
    const container = document.getElementById("honors-list");
    if (!container) {
        return;
    }

    if (!honors.length) {
        container.innerHTML = `<p class="empty-copy">Honors will be listed here as they are added.</p>`;
        return;
    }

    container.innerHTML = honors
        .map(
            (honor) => `
        <article class="list-row">
            <div class="list-main">
                <h3 class="list-title">${honor.title}</h3>
                <p class="list-subtitle">${honor.issuer}</p>
            </div>
            <span class="list-year">${honor.year}</span>
        </article>
    `,
        )
        .join("");
}

function renderInterests(interests) {
    const container = document.getElementById("interests-grid");
    if (!container) {
        return;
    }

    if (!interests.length) {
        container.innerHTML = `<p class="empty-copy">Interests will appear here as references are added.</p>`;
        return;
    }

    container.innerHTML = interests
        .map((item) => {
            const interactive = validLink(item.link);
            const tag = interactive ? "a" : "div";
            const attrs = interactive ? `href="${item.link}" target="_blank" rel="noreferrer"` : "";
            const stateClass = interactive ? "" : " is-static";

            return `
                <${tag} class="interest-item${stateClass}" ${attrs}>
                    <i class="${item.icon} ${item.color}"></i>
                    <span>${item.name}</span>
                </${tag}>
            `;
        })
        .join("");
}

function renderPublications(publications) {
    const container = document.getElementById("publication-list");
    const button = document.getElementById("show-more-btn");
    if (!container || !button) {
        return;
    }

    if (!publications.length) {
        container.innerHTML = `<p class="empty-copy">Publication entries are not available yet.</p>`;
        button.classList.add("hidden");
        return;
    }

    const selected = publications.filter((paper) => paper.selected);
    const primary = selected.length ? selected : publications.slice(0, Math.min(2, publications.length));
    const remaining = publications.filter((paper) => !primary.includes(paper));

    const renderState = (expanded) => {
        const visible = expanded ? publications : primary;
        container.innerHTML = visible.map((paper) => renderPublicationCard(paper)).join("");

        if (!remaining.length) {
            button.classList.add("hidden");
            return;
        }

        button.classList.remove("hidden");
        button.setAttribute("data-state", expanded ? "expanded" : "collapsed");
        button.querySelector("span").textContent = expanded ? "Show Less" : "Show All";
    };

    button.addEventListener("click", () => {
        renderState(button.getAttribute("data-state") === "collapsed");
    });

    renderState(false);
}

function renderPublicationCard(paper) {
    const image = paper.image
        ? `
            <div class="publication-image">
                <img src="${paper.image}" alt="${paper.title}" onerror="this.parentElement.remove()">
            </div>
        `
        : "";

    const links = [];
    if (validLink(paper.github)) {
        links.push(`<a href="${paper.github}" target="_blank" rel="noreferrer">[Code]</a>`);
    }
    links.push(`<span>${paper.journal}</span>`);

    const status = paper.status ? `<div class="publication-status">${paper.status}</div>` : "";
    const points = paper.description ? `<ul class="publication-points"><li>${paper.description}</li></ul>` : "";

    return `
        <article class="publication-item">
            ${image}
            <div class="publication-content">
                <h3 class="publication-title">${paper.title}</h3>
                <p class="publication-authors">${paper.authors}</p>
                <p class="publication-meta">${paper.year}</p>
                <div class="publication-links">${links.join(" ")}</div>
                ${status}
                ${points}
            </div>
        </article>
    `;
}
