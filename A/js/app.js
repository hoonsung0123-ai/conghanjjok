(function () {
  const form = document.getElementById('form');
  const device = document.getElementById('device');
  const sideLeft = document.getElementById('sideLeft');
  const sideRight = document.getElementById('sideRight');
  const nameInput = document.getElementById('name');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const photo = document.getElementById('photo');
  const submitBtn = document.getElementById('submitBtn');
  const uploadArea = document.getElementById('uploadArea');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const uploadPreview = document.getElementById('uploadPreview');
  const previewImg = document.getElementById('previewImg');
  const uploadFilename = document.getElementById('uploadFilename');
  const messageEl = document.getElementById('message');

  function hideMessage() {
    messageEl.hidden = true;
    messageEl.textContent = '';
    messageEl.className = 'message';
  }

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    messageEl.hidden = false;
  }

  function isFormValid() {
    const deviceOk = device.value.trim() !== '';
    const sideOk = sideLeft.checked || sideRight.checked;
    const nameOk = nameInput.value.trim() !== '';
    const phoneOk = phone.value.trim() !== '';
    const emailOk = email.value.trim() !== '';
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const photoOk = photo.files && photo.files.length > 0;
    return deviceOk && sideOk && nameOk && phoneOk && emailOk && emailValid && photoOk;
  }

  function updateSubmitButton() {
    submitBtn.disabled = !isFormValid();
  }

  [device, nameInput, phone, email, photo].forEach(function (el) {
    el.addEventListener('input', updateSubmitButton);
    el.addEventListener('change', updateSubmitButton);
  });
  sideLeft.addEventListener('change', updateSubmitButton);
  sideRight.addEventListener('change', updateSubmitButton);

  // 사진 미리보기 & 드래그앤드롭
  photo.addEventListener('change', function () {
    const file = photo.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        uploadFilename.textContent = file.name;
        uploadPlaceholder.hidden = true;
        uploadPreview.hidden = false;
      };
      reader.readAsDataURL(file);
    } else {
      uploadPlaceholder.hidden = false;
      uploadPreview.hidden = true;
      previewImg.src = '';
      uploadFilename.textContent = '';
    }
    updateSubmitButton();
  });

  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', function () {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length && files[0].type.startsWith('image/')) {
      photo.files = files;
      photo.dispatchEvent(new Event('change'));
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!isFormValid()) return;

    hideMessage();
    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중…';

    const formData = new FormData(form);

    fetch('/api/submit', {
      method: 'POST',
      body: formData
    })
      .then(function (res) {
        if (!res.ok) throw new Error('제출에 실패했습니다.');
        return res.json();
      })
      .then(function () {
        showMessage('제출되었습니다. 운영자가 연락드릴 예정입니다.', 'success');
        form.reset();
        uploadPlaceholder.hidden = false;
        uploadPreview.hidden = true;
        previewImg.src = '';
        uploadFilename.textContent = '';
        updateSubmitButton();
      })
      .catch(function () {
        showMessage('제출 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
        updateSubmitButton();
      })
      .finally(function () {
        submitBtn.disabled = !isFormValid();
        submitBtn.textContent = '제출하기';
      });
  });
})();
