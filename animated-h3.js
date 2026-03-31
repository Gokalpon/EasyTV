// Per-letter animation for .animated-h3
// Usage: <h3 class="animated-h3" id="myH3">Başlık</h3>
// Call animateH3("myH3") after the element is in the DOM
function animateH3(id) {
  const h3 = document.getElementById(id);
  if (!h3) return;
  const text = h3.textContent;
  h3.innerHTML = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * 0.04 + 0.1}s`;
    h3.appendChild(span);
  });
}
// window.animateH3 = animateH3; // Uncomment if you want global access
