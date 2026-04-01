/* ============================================
   HæklingByFie — Specialbestilling
   Billedupload preview + formular-validering
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const uploadZone    = document.getElementById('upload-zone');
  const fileInput     = document.getElementById('file-input');
  const uploadContent = document.getElementById('upload-content');
  const uploadPreview = document.getElementById('upload-preview');
  const previewImg    = document.getElementById('preview-img');
  const removeBtn     = document.getElementById('remove-file');
  const errorMsg      = document.getElementById('upload-error');

  if (!uploadZone) return;

  /* --- Show/hide error message --- */
  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.remove('hidden');
      setTimeout(() => errorMsg.classList.add('hidden'), 5000);
    }
  }

  /* --- Handle a selected file --- */
  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Kun billedfiler er tilladt (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('Filen er for stor. Maks 10 MB tilladt.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      uploadContent.classList.add('hidden');
      uploadPreview.classList.remove('hidden');
      uploadZone.classList.add('upload-zone--has-file');
    };
    reader.onerror = () => showError('Kunne ikke læse filen. Prøv igen.');
    reader.readAsDataURL(file);
  }

  /* --- Click to open file browser --- */
  uploadZone.addEventListener('click', (e) => {
    if (e.target.closest('#remove-file')) return;
    fileInput.click();
  });

  /* --- Keyboard accessibility --- */
  uploadZone.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('#remove-file')) {
      e.preventDefault();
      fileInput.click();
    }
  });

  /* --- File input change --- */
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  /* --- Drag and drop --- */
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('upload-zone--drag-over');
  });

  uploadZone.addEventListener('dragleave', (e) => {
    if (!uploadZone.contains(e.relatedTarget)) {
      uploadZone.classList.remove('upload-zone--drag-over');
    }
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('upload-zone--drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      // Sync to input element so Formspree picks it up
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      handleFile(file);
    }
  });

  /* --- Remove file --- */
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      previewImg.src = '';
      uploadContent.classList.remove('hidden');
      uploadPreview.classList.add('hidden');
      uploadZone.classList.remove('upload-zone--has-file');
    });
  }

  /* --- Basic form validation --- */
  const form = document.getElementById('bestilling-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      const navn  = form.querySelector('#navn').value.trim();
      const email = form.querySelector('#email').value.trim();
      const besked = form.querySelector('#besked').value.trim();

      if (!navn || !email || !besked) {
        e.preventDefault();
        showError('Udfyld venligst alle påkrævede felter.');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        e.preventDefault();
        showError('Indtast venligst en gyldig e-mailadresse.');
      }
    });
  }

});
