const registrationForm = document.getElementById('registration-form');

function collectPlayers() {
  const players = [];
  for (let i = 1; i <= 6; i++) {
    const input = registrationForm.querySelector(`[name=player${i}]`);
    if (input) players.push(input.value.trim());
  }
  return players;
}

function collectSubstitutes() {
  const substitutes = [];
  for (let i = 1; i <= 2; i++) {
    const input = registrationForm.querySelector(`[name=substitute${i}]`);
    if (input) substitutes.push(input.value.trim());
  }
  return substitutes;
}

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(registrationForm);
  const payload = {
    teamName: formData.get('teamName').trim(),
    delegateName: formData.get('delegateName').trim(),
    contactNumber: formData.get('contactNumber').trim(),
    players: collectPlayers(),
    substitutes: collectSubstitutes()
  };

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al enviar el registro.');
    }

    alert('Inscripción enviada con éxito.');
    registrationForm.reset();
  } catch (error) {
    alert(error.message);
  }
});
