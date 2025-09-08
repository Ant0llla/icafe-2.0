(function(){
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;
  function applyTheme(t){
    if(t === 'light'){
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }
  applyTheme(localStorage.getItem(STORAGE_KEY));
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('theme-toggle');
    if(!btn) return;
    btn.addEventListener('click', function(){
      const isLight = root.classList.contains('light');
      const next = isLight ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      btn.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    });
  });
})();
