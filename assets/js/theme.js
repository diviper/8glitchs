// Brand and color helpers
window.theme = (function(){
  const brand = {
    name: 'Парадоксы реальности',
    short: 'Glitch Registry'
  };
  const categories = {
    'Квант': '#7cf3ff',
    'Время': '#c7f36b',
    'Космос': '#ffa96b',
    'Информация': '#b58cff',
    'Логика': '#ff6bd5',
    'Идентичность': '#7bd3ff'
  };
  function categoryColor(id){
    return categories[id] || '#9aa4b2';
  }
  function token(name){
    const css = name.replace(/([A-Z])/g,'-$1').toLowerCase();
    return getComputedStyle(document.documentElement).getPropertyValue('--' + css).trim();
  }
  return { brand, categoryColor, token };
})();
window.THEME = window.theme; // backward compatibility
