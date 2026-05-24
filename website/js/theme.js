/**
 * Конфигурация тем оформления склада.
 */
const themes = {
    light: {
        '--primary-color': '#edf2f7',
        '--primary-dark': '#ffffff',
        '--secondary-color': '#cbd5e0',
        '--body-bg': 'linear-gradient(135deg,#cbd5e0,#94a3b8)',
        '--body-color': '#1e293b',
        '--card-bg': 'linear-gradient(145deg, rgba(100, 144, 173, 0.92), rgba(47, 110, 151, 0.89))',
        '--card-border': '#e2e8f0',
        '--card-shadow': '0 8px 25px rgba(0,0,0,0.06)',
        '--medical-text': '#1e293b',
        '--fridge-border': 'rgba(37,99,235,0.2)',
        '--fridge-shadow': '0 0 18px rgba(37,99,235,0.25)',
        '--app-bg': '#f8fafc',
        '--header-bg': '#ffffff',
        '--header-title-color': '#1e293b',
        '--header-p-color': '#475569',
        '--text-main': '#1e293b',
        '--stat-bg': '#e2e8f0',
        '--stat-color': '#1e293b',
        '--panel-bg': '#ffffff',
        '--panel-color': '#1e293b',
        '--input-bg': '#f1f5f9',
        '--input-color': '#1e293b',
        '--input-border': '1px solid #cbd5e1',
        '--table-header-bg': '#e2e8f0',
        '--table-header-color': '#1e293b',
        '--table-row-bg': '#ffffff',
        '--table-row-color': '#1e293b',
        '--table-row-border': '1px solid #e2e8f0',
        '--badge-bg': '#e2e8f0',
        '--badge-color': '#1e293b',
        '--modal-bg': '#ffffff',
        '--modal-color': '#1e293b',
        '--modal-border': 'none',
        '--modal-label-color': '#475569'
    },
    dark: {
        '--primary-color': '#1a202c',
        '--primary-dark': '#2d3748',
        '--secondary-color': '#000000',
        '--body-bg': 'linear-gradient(135deg,#1a202c,#000000)',
        '--body-color': '#ffffff',
        '--card-bg': '#1f2937',
        '--card-border': '#374151',
        '--card-shadow': '0 10px 30px rgba(0,0,0,0.35)',
        '--medical-text': '#e2e8f0',
        '--fridge-border': 'rgba(255,255,255,0.15)',
        '--fridge-shadow': '0 0 18px rgba(59,130,246,0.45)',
        '--app-bg': '#111827',
        '--header-bg': '#2d3748',
        '--header-title-color': '#ffffff',
        '--header-p-color': '#e2e8f0',
        '--text-main': '#ffffff',
        '--stat-bg': '#374151',
        '--stat-color': '#ffffff',
        '--panel-bg': '#1f2937',
        '--panel-color': '#ffffff',
        '--input-bg': '#374151',
        '--input-color': '#ffffff',
        '--input-border': '1px solid #4b5563',
        '--table-header-bg': '#374151',
        '--table-header-color': '#ffffff',
        '--table-row-bg': '#1f2937',
        '--table-row-color': '#ffffff',
        '--table-row-border': '1px solid #374151',
        '--badge-bg': '#374151',
        '--badge-color': '#ffffff',
        '--modal-bg': '#1f2937',
        '--modal-color': '#ffffff',
        '--modal-border': '1px solid #374151',
        '--modal-label-color': '#e2e8f0'
    },
    purple: {
        '--primary-color': '#667eea',
        '--primary-dark': '#5a67d8',
        '--secondary-color': '#764ba2',
        '--body-bg': 'linear-gradient(135deg,#667eea,#764ba2)',
        '--body-color': '#1e293b',
        '--card-bg': 'linear-gradient(145deg, rgba(38, 84, 158, 0.9), rgba(94, 86, 170, 0.8))',
        '--card-border': 'rgba(255,255,255,0.08)',
        '--card-shadow': '0 10px 35px rgba(0,0,0,0.3)',
        '--medical-text': '#1e293b',
        '--fridge-border': 'rgba(124,58,237,0.15)',
        '--fridge-shadow': '0 0 18px rgba(124,58,237,0.35)',
        '--app-bg': '#f8fafc',
        '--header-bg': '#5a67d8',
        '--header-title-color': '#ffffff',
        '--header-p-color': '#e2e8f0',
        '--text-main': '#1e293b',
        '--stat-bg': 'rgba(255,255,255,0.2)',
        '--stat-color': '#ffffff',
        '--panel-bg': '#ffffff',
        '--panel-color': '#1e293b',
        '--input-bg': '#f1f5f9',
        '--input-color': '#1e293b',
        '--input-border': '1px solid #cbd5e1',
        '--table-header-bg': '#e2e8f0',
        '--table-header-color': '#1e293b',
        '--table-row-bg': '#ffffff',
        '--table-row-color': '#1e293b',
        '--table-row-border': '1px solid #e2e8f0',
        '--badge-bg': '#e2e8f0',
        '--badge-color': '#1e293b',
        '--modal-bg': '#ffffff',
        '--modal-color': '#1e293b',
        '--modal-border': 'none',
        '--modal-label-color': '#e2e8f0'
    }
};

/**
 * Устанавливает выбранную тему
 * @param {string} theme - Название темы ('light', 'dark', 'purple')
 */
function setTheme(theme) {
    // Проверяем существование темы
    const activeTheme = themes[theme] ? theme : 'purple';
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('warehouseTheme', activeTheme);
    
    // УДАЛЯЕМ старые классы тем с body
    document.body.classList.remove('light-theme', 'dark-theme', 'purple-theme');
    
    // ДОБАВЛЯЕМ новый класс темы на body
    document.body.classList.add(activeTheme + '-theme');
    
    // Извлекаем свойства выбранной темы
    const themeProperties = themes[activeTheme];
    
    // Применяем CSS-переменные к :root
    for (const [property, value] of Object.entries(themeProperties)) {
        document.documentElement.style.setProperty(property, value);
    }
    
    // Применяем базовые стили к body
    document.body.style.background = themeProperties['--body-bg'];
    document.body.style.color = themeProperties['--body-color'];
}

/* Загрузка сохранённой темы */
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('warehouseTheme');
    setTheme(savedTheme || 'purple');
});