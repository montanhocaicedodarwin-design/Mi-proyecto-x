const form = document.getElementById('contact-form');
const messageElement = document.getElementById('form-message');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageElement.textContent = '';

    const formData = new FormData(form);
    const payload = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      mensaje: formData.get('mensaje')
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok) {
        form.reset();
        messageElement.textContent = 'Mensaje enviado correctamente. Gracias por contactar.';
        messageElement.style.color = '#10b981';
      } else {
        messageElement.textContent = result.error || 'No se pudo enviar el mensaje.';
        messageElement.style.color = '#dc2626';
      }
    } catch (error) {
      messageElement.textContent = 'Error al enviar el mensaje. Intenta de nuevo.';
      messageElement.style.color = '#dc2626';
    }
  });
}

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
}
