// Brand and color constants
window.__THEME__ = {
  brandName: 'Парадоксы реальности',
  brandShort: 'Glitch Registry',
  categories: [
    { id: 'Квант',        color: '#7cf3ff' },
    { id: 'Время',        color: '#c7f36b' },
    { id: 'Космос',       color: '#ffa96b' },
    { id: 'Информация',   color: '#b58cff' },
    { id: 'Логика',       color: '#ff6bd5' },
    { id: 'Идентичность', color: '#7bd3ff' }
  ],
  catColor(id) {
    const f = this.categories.find(c => c.id === id);
    return f ? f.color : '#9aa4b2';
  }
};
window.THEME = window.__THEME__;
