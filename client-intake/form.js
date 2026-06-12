const form = document.getElementById('intake-form');
const confirmation = document.getElementById('confirmation');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const btn = form.querySelector('.btn-submit');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  const data = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      form.style.display = 'none';
      confirmation.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      btn.textContent = 'Something went wrong — please try again.';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Something went wrong — please try again.';
    btn.disabled = false;
  }
});
