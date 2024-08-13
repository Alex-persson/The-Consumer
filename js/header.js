document.querySelectorAll('.dynamic-text').forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map((letter) => {
      return `<span>${letter}</span>`;
    }).join('');
  });