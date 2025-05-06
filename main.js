// 搜索引擎映射
const SEARCH_ENGINES = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    brave: 'https://search.brave.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    baidu: 'https://www.baidu.com/s?wd='
};

// 网站图标映射（使用emoji替代）
const SITE_ICONS = {
    'youtube.com': '📺',
    'github.com': '💻',
    'gmail.com': '📧',
    'mail.google.com': '📧',
    'maps.google.com': '🗺️',
    'drive.google.com': '📁',
    'translate.google.com': '🌍',
    'netflix.com': '🎬',
    'twitter.com': '🐦',
    'facebook.com': '👥',
    'instagram.com': '📸',
    'linkedin.com': '💼',
    'reddit.com': '👽',
    'amazon.com': '🛒',
    'wikipedia.org': '📚',
    'spotify.com': '🎵',
    'discord.com': '💬',
    'notion.so': '📝',
    'trello.com': '📋',
    'slack.com': '💬',
    'zoom.us': '🎥',
    'default': '🔗'
};

const engineButtons = document.getElementById('engine-buttons');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const shortcutsDiv = document.getElementById('shortcuts');
const showShortcutDialogBtn = document.getElementById('show-shortcut-dialog');
const shortcutDialog = document.getElementById('shortcut-dialog');
const shortcutNameInput = document.getElementById('shortcut-name');
const shortcutUrlInput = document.getElementById('shortcut-url');
const confirmAddShortcutBtn = document.getElementById('confirm-add-shortcut');
const cancelAddShortcutBtn = document.getElementById('cancel-add-shortcut');
const themeToggleBtn = document.getElementById('theme-toggle');

// 生成图标背景色类名
function getColorClass(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return `color-${Math.abs(hash) % 8 + 1}`;
}

// 获取网站图标（使用emoji）
function getSiteIcon(url) {
    try {
        const hostname = new URL(url).hostname;
        for (const [domain, icon] of Object.entries(SITE_ICONS)) {
            if (hostname.includes(domain)) {
                return icon;
            }
        }
        return SITE_ICONS.default;
    } catch (e) {
        return SITE_ICONS.default;
    }
}

// 保存和读取快捷方式
function getShortcuts() {
    return JSON.parse(localStorage.getItem('shortcuts') || '[]');
}

function setShortcuts(shortcuts) {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
}

// 拖拽相关函数
function handleDragStart(e) {
    if (e.target.classList.contains('shortcut-wrapper')) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
    }
}

function handleDragEnd(e) {
    if (e.target.classList.contains('shortcut-wrapper')) {
        e.target.classList.remove('dragging');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    const target = e.target.closest('.shortcut-wrapper');
    
    if (dragging && target && dragging !== target) {
        target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const target = e.target.closest('.shortcut-wrapper');
    if (target) {
        target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const target = e.target.closest('.shortcut-wrapper');
    if (!target) return;
    
    target.classList.remove('drag-over');
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const targetIndex = parseInt(target.dataset.index);
    
    if (sourceIndex === targetIndex || isNaN(sourceIndex) || isNaN(targetIndex)) return;
    
    const shortcuts = getShortcuts();
    const [moved] = shortcuts.splice(sourceIndex, 1);
    shortcuts.splice(targetIndex, 0, moved);
    setShortcuts(shortcuts);
    renderShortcuts();
}

function renderShortcuts() {
    shortcutsDiv.innerHTML = '';
    const shortcuts = getShortcuts();
    
    shortcuts.forEach((shortcut, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'shortcut-wrapper';
        wrapper.draggable = true;
        wrapper.dataset.index = idx;
        
        // 添加拖拽事件监听器
        wrapper.addEventListener('dragstart', handleDragStart);
        wrapper.addEventListener('dragend', handleDragEnd);
        wrapper.addEventListener('dragover', handleDragOver);
        wrapper.addEventListener('dragleave', handleDragLeave);
        wrapper.addEventListener('drop', handleDrop);
        
        // 删除按钮
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '×';
        delBtn.className = 'delete-btn';
        delBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm(`确定要删除"${shortcut.name}"这个快捷方式吗？`)) {
                shortcuts.splice(idx, 1);
                setShortcuts(shortcuts);
                renderShortcuts();
            }
        };
        
        // 快捷方式链接
        const a = document.createElement('a');
        a.href = shortcut.url;
        a.target = '_blank';
        a.className = 'shortcut';
        a.draggable = false;
        a.textContent = shortcut.name;
        
        wrapper.appendChild(a);
        wrapper.appendChild(delBtn);
        shortcutsDiv.appendChild(wrapper);
    });
}

function showShortcutDialog() {
    shortcutDialog.classList.remove('hidden');
    shortcutNameInput.value = '';
    shortcutUrlInput.value = '';
    shortcutNameInput.focus();
}

function hideShortcutDialog() {
    shortcutDialog.classList.add('hidden');
}

showShortcutDialogBtn.onclick = showShortcutDialog;
cancelAddShortcutBtn.onclick = hideShortcutDialog;
shortcutDialog.onclick = (e) => {
    if (e.target === shortcutDialog) hideShortcutDialog();
};

document.addEventListener('keydown', e => {
    if (!shortcutDialog.classList.contains('hidden') && e.key === 'Escape') {
        hideShortcutDialog();
    }
});

confirmAddShortcutBtn.onclick = (e) => {
    e.preventDefault();
    const name = shortcutNameInput.value.trim();
    let url = shortcutUrlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//.test(url)) {
        url = 'https://' + url.replace(/^\/+/, '');
    }
    const shortcuts = getShortcuts();
    shortcuts.push({ name, url });
    setShortcuts(shortcuts);
    renderShortcuts();
    hideShortcutDialog();
};

// 搜索引擎选择逻辑
function setActiveEngine(engine) {
    localStorage.setItem('search_engine', engine);
    Array.from(engineButtons.children).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.engine === engine);
    });
}

engineButtons.onclick = (e) => {
    const button = e.target.closest('.engine-button');
    if (button) {
        setActiveEngine(button.dataset.engine);
    }
};

// 搜索表单提交
searchForm.onsubmit = (e) => {
    e.preventDefault();
    const engine = localStorage.getItem('search_engine') || 'google';
    const query = searchInput.value.trim();
    if (!query) return;
    const url = SEARCH_ENGINES[engine] + encodeURIComponent(query);
    window.open(url, '_blank');
};

// 主题切换
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggleBtn.textContent = theme === 'dark' ? '🌙' : '🌞';
}

themeToggleBtn.onclick = () => {
    const current = document.body.getAttribute('data-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
};

// 初始化
function init() {
    // 搜索引擎
    const engine = localStorage.getItem('search_engine') || 'google';
    setActiveEngine(engine);
    
    // 主题
    const theme = localStorage.getItem('theme') || 'light';
    setTheme(theme);
    
    // 快捷方式
    renderShortcuts();
}

init();
