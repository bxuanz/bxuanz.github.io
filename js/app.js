const dataCache = new Map();

document.addEventListener("DOMContentLoaded", initPage);

async function initPage() {
    await Promise.all([
        loadProfile(),
        loadOverview(),
        loadEducation(),
        loadHonors(),
        loadInterests(),
        loadPublications(),
    ]);

    setText("footer-year", new Date().getFullYear());
}

async function fetchData(url) {
    if (dataCache.has(url)) {
        return dataCache.get(url);
    }

    try {
        const response = await fetch(`${url}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        dataCache.set(url, data);
        return data;
    } catch (error) {
        console.error(`Could not load ${url}:`, error);
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

function formatCount(value) {
    return String(value).padStart(2, "0");
}

function isValidLink(value) {
    const normalized = typeof value === "string" ? value.trim() : "";
    return Boolean(normalized && normalized !== "#" && !/[?&]user=$/.test(normalized));
}

function applyActionLink(id, href, shouldOpenInNewTab = true) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    if (!isValidLink(href)) {
        element.classList.add("hidden");
        return;
    }

    element.href = href;
    element.classList.remove("hidden");

    if (!shouldOpenInNewTab || href.startsWith("mailto:")) {
        element.removeAttribute("target");
        element.removeAttribute("rel");
    }
}

async function loadProfile() {
    const data = await fetchData("data/profile.json");
    if (!data) {
        return;
    }

    document.title = `${data.name} | Academic Homepage`;

    setText("profile-name-main", data.name);
    setText("profile-role", data.title);
    setText("profile-uni", data.university);
    setText("profile-location", data.location || "");
    setText("profile-current-focus", data.currentFocus || (data.focusAreas || []).slice(0, 2).join(" / "));
    setText("profile-motto", data.motto ? `"${data.motto}"` : "");
    setHtml("profile-bio", data.bio);
    setText("profile-research-statement", data.researchStatement || "");
    setText("footer-name", data.name);

    const avatar = document.getElementById("profile-avatar");
    if (avatar) {
        avatar.src = data.avatar || "";
        avatar.alt = data.name ? `${data.name} portrait` : "Portrait";
    }

    const caption = document.getElementById("profile-avatar-caption");
    if (caption) {
        if (data.avatarCaption && data.avatarCaption.trim()) {
            caption.textContent = data.avatarCaption;
            caption.classList.remove("hidden");
        } else {
            caption.classList.add("hidden");
        }
    }

    const email = data.email || "";
    const emailLink = document.getElementById("profile-email");
    if (emailLink) {
        if (email) {
            emailLink.href = `mailto:${email}`;
            emailLink.textContent = email;
        } else {
            emailLink.removeAttribute("href");
            emailLink.textContent = "Available upon request";
        }
    }

    renderFocusTags(data.focusAreas || []);

    const links = data.links || {};
    applyActionLink("profile-link-email", links.email || (email ? `mailto:${email}` : ""), false);
    applyActionLink("profile-link-github", links.github);
    applyActionLink("profile-link-scholar", links.scholar);
    applyActionLink("profile-link-cv", links.cv);
}

function renderFocusTags(areas) {
    const container = document.getElementById("profile-focus-tags");
    if (!container) {
        return;
    }

    container.innerHTML = areas
        .map((area) => `<span class="tag-pill">${area}</span>`)
        .join("");
}

async function loadOverview() {
    const [profile, honors, publications] = await Promise.all([
        fetchData("data/profile.json"),
        fetchData("data/honors.json"),
        fetchData("data/publications.json"),
    ]);

    if (profile) {
        setText("stat-areas", formatCount((profile.focusAreas || []).length));
    }

    if (honors) {
        setText("stat-honors", formatCount(honors.length));
    }

    if (publications) {
        const featuredCount = publications.filter((publication) => publication.selected === true).length;
        setText("stat-publications", formatCount(publications.length));
        setText("stat-selected-publications", formatCount(featuredCount));
    }
}

async function loadEducation() {
    const data = await fetchData("data/education.json");
    const container = document.getElementById("education-list");
    if (!data || !container) {
        return;
    }

    container.innerHTML = data
        .map(
            (education) => `
        <article class="timeline-card">
            <span class="year-pill">${education.year}</span>
            <h3 class="mt-5 font-display text-4xl font-semibold leading-tight text-ink">${education.degree}</h3>
            <p class="mt-2 text-base font-semibold text-slate-700">${education.school}</p>
            <p class="mt-4 text-sm leading-7 text-muted">${education.description}</p>
        </article>
    `,
        )
        .join("");
}

async function loadHonors() {
    const data = await fetchData("data/honors.json");
    const container = document.getElementById("honors-list");
    if (!container) {
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state md:col-span-2">
                Honors and scholarships will be listed here as new milestones are added.
            </div>
        `;
        return;
    }

    container.innerHTML = data
        .map(
            (honor) => `
        <article class="honor-card">
            <span class="honor-icon" aria-hidden="true">
                <i class="fa-solid fa-award"></i>
            </span>
            <div>
                <h3 class="text-lg font-semibold text-ink">${honor.title}</h3>
                <p class="mt-2 text-sm leading-7 text-muted">${honor.year} | ${honor.issuer}</p>
            </div>
        </article>
    `,
        )
        .join("");
}

async function loadInterests() {
    const data = await fetchData("data/interests.json");
    const container = document.getElementById("interests-grid");
    if (!data || !container) {
        return;
    }

    container.innerHTML = data
        .map((item) => {
            const tag = isValidLink(item.link) ? "a" : "div";
            const attributes = tag === "a" ? `href="${item.link}" target="_blank" rel="noreferrer"` : "";
            const staticClass = tag === "a" ? "" : " is-static";

            return `
                <${tag} ${attributes} class="interest-card${staticClass}">
                    <i class="${item.icon} ${item.color} text-4xl"></i>
                    <div>
                        <p class="font-display text-3xl font-semibold leading-none">${item.name}</p>
                        <p class="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                            ${tag === "a" ? "Open reference" : "Personal note"}
                        </p>
                    </div>
                </${tag}>
            `;
        })
        .join("");
}

async function loadPublications() {
    const papers = await fetchData("data/publications.json");
    const container = document.getElementById("publication-list");
    const button = document.getElementById("show-more-btn");

    if (!container || !button) {
        return;
    }

    if (!papers || papers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                Publication data could not be loaded.
            </div>
        `;
        button.classList.add("hidden");
        return;
    }

    const selectedPapers = papers.filter((paper) => paper.selected === true);
    const primaryPapers = selectedPapers.length > 0 ? selectedPapers : papers.slice(0, Math.min(2, papers.length));
    const otherPapers = papers.filter((paper) => !primaryPapers.includes(paper));

    const renderState = (expanded) => {
        const visiblePapers = expanded ? papers : primaryPapers;
        container.innerHTML = visiblePapers.map((paper) => renderPublicationCard(paper, expanded)).join("");

        if (otherPapers.length === 0) {
            button.classList.add("hidden");
            return;
        }

        button.classList.remove("hidden");
        button.innerHTML = expanded
            ? '<span>Show Less</span><i class="fa-solid fa-chevron-up text-[11px]"></i>'
            : '<span>Show All</span><i class="fa-solid fa-chevron-down text-[11px]"></i>';
        button.setAttribute("data-state", expanded ? "expanded" : "collapsed");
    };

    button.onclick = () => {
        renderState(button.getAttribute("data-state") === "collapsed");
    };

    renderState(false);
}

function renderPublicationCard(paper, animate) {
    const status = paper.status ? `<span class="publication-status">${paper.status}</span>` : "";
    const description = paper.description ? `<p class="publication-note">${paper.description}</p>` : "";
    const action =
        paper.github && isValidLink(paper.github)
            ? `<a href="${paper.github}" target="_blank" rel="noreferrer" class="publication-action"><i class="fa-brands fa-github"></i><span>Code Repository</span></a>`
            : "";
    const image = paper.image
        ? `
            <div class="publication-media">
                <img src="${paper.image}" alt="${paper.title}" onerror="this.closest('.publication-media').style.display='none'">
            </div>
        `
        : "";

    return `
        <article class="publication-card ${animate ? "animate-fade-in" : ""}">
            ${image}
            <div class="publication-body">
                <div class="space-y-4">
                    ${status}
                    <h3 class="publication-title">${paper.title}</h3>
                    <p class="publication-meta">${paper.authors}</p>
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">${paper.journal} | ${paper.year}</p>
                    ${description}
                </div>
                ${action}
            </div>
        </article>
    `;
}
