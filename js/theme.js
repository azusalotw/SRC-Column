// 主題切換功能 (沿用 ProgramPlatform 設計)
(function() {
    const getStoredTheme = () => localStorage.getItem('theme') || 'light';
    const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
        setStoredTheme(theme);
    };

    const updateThemeIcon = (theme) => {
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        if (sunIcon && moonIcon) {
            sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
            moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
        }
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    };

    document.addEventListener('DOMContentLoaded', () => {
        const theme = getPreferredTheme();
        setTheme(theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // 避免閃爍
    const theme = getPreferredTheme();
    document.documentElement.setAttribute('data-theme', theme);
})();
