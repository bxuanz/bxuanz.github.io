document.addEventListener('DOMContentLoaded', () => {
    // 按顺序加载所有模块
    loadProfile();
    loadEducation();
    loadHonors();
    loadInterests();
    loadPublications();
    
    // 更新页脚年份
    const fYear = document.getElementById('footer-year');
    if(fYear) fYear.textContent = new Date().getFullYear();
});

// --- 通用 Fetch 工具 (带时间戳防缓存) ---
async function fetchData(url) {
    try {
        const noCacheUrl = `${url}?t=${new Date().getTime()}`;
        const response = await fetch(noCacheUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Could not load ${url}:`, error);
        return null;
    }
}

// --- 1. 加载个人信息 (Profile) ---
async function loadProfile() {
    const data = await fetchData('data/profile.json');
    if (!data) return;

    document.title = `${data.name} | Portfolio`;
    const avatarImg = document.getElementById('profile-avatar');
    if(avatarImg) avatarImg.src = data.avatar;

    const setText = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    setText('profile-name-main', data.name);
    setText('profile-role', data.title);
    setText('profile-uni', data.university);
    setText('profile-motto', `"${data.motto}"`);
    setText('footer-name', data.name);
    
    const bioEl = document.getElementById('profile-bio');
    if(bioEl) bioEl.innerHTML = data.bio;

    // 照片描述 Caption
    const captionEl = document.getElementById('profile-avatar-caption');
    if (captionEl) {
        if (data.avatarCaption && data.avatarCaption.trim() !== "") {
            captionEl.textContent = data.avatarCaption;
            captionEl.classList.remove('hidden');
        } else {
            captionEl.classList.add('hidden');
        }
    }
}

// --- 2. 加载教育经历 (Education) ---
async function loadEducation() {
    const data = await fetchData('data/education.json');
    const container = document.getElementById('education-list');
    if (!data || !container) return;
    
    container.innerHTML = '';
    data.forEach(edu => {
        container.innerHTML += `
            <div class="relative pl-8 md:pl-10 group">
                <div class="absolute left-0 top-1.5 h-full w-[2px] bg-slate-200 group-last:h-auto group-last:bottom-0"></div>
                <div class="absolute left-[-5px] top-2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-sm shadow-blue-200"></div>
                <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow duration-300">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <h3 class="text-lg font-bold text-slate-900">${edu.degree}</h3>
                        <span class="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full mt-2 sm:mt-0 w-fit">${edu.year}</span>
                    </div>
                    <h4 class="text-md text-slate-700 font-medium mb-3">${edu.school}</h4>
                    <p class="text-sm text-slate-600 leading-relaxed">${edu.description}</p>
                </div>
            </div>`;
    });
}

// --- 3. 加载荣誉奖项 (Honors) ---
async function loadHonors() {
    const data = await fetchData('data/honors.json');
    const container = document.getElementById('honors-list');
    if (!container) return;
    container.innerHTML = '';

    // 空状态处理：如果没有荣誉数据，显示励志语录
    if (!data || data.length === 0) {
        const encouragement = "Great things take time. I am on the way to my first milestone.";
        container.innerHTML = `
            <div class="col-span-1 md:col-span-2 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-mountain-sun text-slate-300 text-4xl mb-4"></i>
                <p class="text-slate-600 font-medium italic text-lg font-serif">"${encouragement}"</p>
                <p class="text-xs text-slate-400 mt-2 uppercase tracking-widest">Work In Progress</p>
            </div>`;
        return;
    }

    // 正常渲染荣誉
    data.forEach(honor => {
        container.innerHTML += `
            <div class="flex items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-amber-200 hover:shadow-sm transition-all duration-300">
                <div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mr-4 shrink-0 border border-amber-100">
                    <i class="fa-solid fa-award text-amber-500 text-xl"></i>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900 text-sm">${honor.title}</h4>
                    <div class="text-xs text-slate-500 mt-1">
                        <span class="font-medium text-amber-600">${honor.year}</span> 
                        <span class="mx-1 text-slate-300">•</span> ${honor.issuer}
                    </div>
                </div>
            </div>`;
    });
}

// --- 4. 加载兴趣爱好 (Interests) ---
async function loadInterests() {
    const data = await fetchData('data/interests.json');
    const container = document.getElementById('interests-grid');
    if (!data || !container) return;
    
    container.innerHTML = '';
    data.forEach(item => {
        container.innerHTML += `
            <a href="${item.link || '#'}" target="_blank" class="aspect-square bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:scale-105 hover:shadow-md hover:border-blue-200 transition-all duration-300 group cursor-pointer block">
                <i class="${item.icon} text-4xl mb-4 ${item.color} group-hover:scale-110 transition-transform"></i>
                <span class="font-medium text-slate-800 text-sm">${item.name}</span>
            </a>`;
    });
}

// --- 5. 加载论文 (Publications) - 包含完整图片显示逻辑 ---
async function loadPublications() {
    const container = document.getElementById('publication-list');
    const btn = document.getElementById('show-more-btn'); 

    try {
        const response = await fetch('data/publications.json?t=' + Date.now());
        const papers = await response.json();

        if (container) container.innerHTML = '';

        // 筛选逻辑: selected=true 显示，false 隐藏
        const primaryPapers = papers.filter(p => p.selected === true);
        const otherPapers = papers.filter(p => p.selected !== true);

        // 渲染单张卡片
        const renderCard = (paper, animate = false) => {
            const actionBtn = paper.github ? `<a href="${paper.github}" target="_blank" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 mt-4 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"><i class="fa-brands fa-github"></i> Code</a>` : '';
            const statusBadge = paper.status ? `<span class="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mb-3 border border-slate-200">${paper.status}</span>` : '';
            
            // 🟢 图片显示修复：
            // 使用 object-contain 确保图片完整显示不裁剪
            // 使用 bg-white 保持背景干净
            const imageHtml = paper.image ? 
                `<div class="relative shrink-0 w-full aspect-video md:w-72 md:aspect-[4/3] bg-white overflow-hidden group-hover:opacity-90 transition-opacity border-b md:border-b-0 md:border-r border-slate-100">
                    <img src="${paper.image}" alt="${paper.title}" class="w-full h-full object-contain object-center p-1" onerror="this.style.display='none'">
                 </div>` : '';

            const div = document.createElement('div');
            // Flex 布局：响应式
            div.className = `group flex flex-col md:flex-row bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden ${animate ? 'animate-fade-in' : ''}`;
            
            div.innerHTML = `
                ${imageHtml}
                <div class="p-6 flex flex-col justify-between flex-grow">
                    <div>
                        ${statusBadge}
                        <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-2 leading-tight">${paper.title}</h3>
                        <p class="text-sm text-slate-600 mb-2">${paper.authors}</p>
                        <div class="text-xs text-slate-500 italic">${paper.journal} | ${paper.year}</div>
                        ${paper.description ? `<p class="mt-3 text-sm text-slate-500 pl-3 border-l-2 border-blue-100 leading-relaxed">${paper.description}</p>` : ''}
                    </div>
                    ${actionBtn}
                </div>`;
            return div;
        };

        // 初始渲染：只显示 Selected 文章
        primaryPapers.forEach(p => container.appendChild(renderCard(p)));

        // 按钮逻辑：控制 Show All / Show Less
        if (btn) {
            // 如果没有隐藏文章，禁用按钮
            if (otherPapers.length === 0) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.innerHTML = 'No More Papers';
                btn.onclick = null;
                return;
            }

            // 正常激活状态
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';

            btn.onclick = () => {
                const state = btn.getAttribute('data-state');
                if (state === 'collapsed') {
                    // 展开
                    otherPapers.forEach(p => container.appendChild(renderCard(p, true)));
                    btn.innerHTML = `Show Less <i class="fa-solid fa-chevron-up ml-1"></i>`;
                    btn.setAttribute('data-state', 'expanded');
                } else {
                    // 收起
                    container.innerHTML = '';
                    primaryPapers.forEach(p => container.appendChild(renderCard(p)));
                    btn.innerHTML = `Show All <i class="fa-solid fa-chevron-down ml-1 transition-transform group-hover:translate-y-0.5"></i>`;
                    btn.setAttribute('data-state', 'collapsed');
                }
            };
        }

    } catch (error) {
        console.error(error);
        if (container) container.innerHTML = '<p class="text-red-500">❌ 加载失败</p>';
    }
}