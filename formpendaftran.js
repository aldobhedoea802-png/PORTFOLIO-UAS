const form = document.getElementById('registrationForm');
const magneticInputs = document.querySelectorAll('.magnetic');
const popup = document.getElementById('popup');

// ----------------- Magnetic Floating Effect -----------------
document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  magneticInputs.forEach(input => {
    const rect = input.getBoundingClientRect();
    const dx = rect.left + rect.width/2 - x;
    const dy = rect.top + rect.height/2 - y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxDist = 100;
    const force = Math.min(maxDist, dist)/maxDist;

    const angle = Math.atan2(dy, dx);
    const tx = Math.cos(angle) * 10 * (1-force);
    const ty = Math.sin(angle) * 10 * (1-force);

    input.style.transform = `translate(${-tx}px, ${-ty}px)`;
  });
});

// Reset transform when mouse leaves window
document.addEventListener('mouseleave', () => {
  magneticInputs.forEach(input => {
    input.style.transform = 'translate(0,0)';
  });
});

// ----------------- Submit Form -----------------
form.addEventListener('submit', function(e){
    e.preventDefault();

    // Validasi sederhana
    const fields = Array.from(form.elements).filter(el => el.required);
    let valid = true;
    fields.forEach(f => {
      if(!f.value){
        valid = false;
      }
    });

    if(!valid){
      alert('Semua field harus diisi!');
      return;
    }

    // Tampilkan popup sukses
    popup.classList.add('show');

    // Hilangkan popup setelah 3 detik
    setTimeout(() => {
      popup.classList.remove('show');
      form.reset();
    }, 3000);
});
