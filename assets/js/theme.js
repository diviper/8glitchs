// Brand tokens
window.theme = {
  brandShort: 'Glitch Registry',
  brandTagline: 'Парадоксы реальности',
  colors: {
    'Квант': '#41e0d0',
    'Время': '#b792ff',
    'Космос': '#59a6ff',
    'Информация': '#ffb84d',
    'Логика': '#ff6ea8',
    'Идентичность': '#7bdc7b',
    'Наблюдатель': '#56d3ff'
  },
  catColor: function (cat) {
    return this.colors[cat] || '#aaa';
  }
};
window.THEME = window.theme; // backward compatibility
