import config from './config.js';

// 從後端讀取邀請碼，並加入載入動畫效果
function updateInvitationCode() {
  const codeEl = document.getElementById('invitationCode');
  // 顯示 loading spinner
  codeEl.innerHTML = '<div class="spinner"></div>';
  
  fetch(config.backendURL)
    .then(response => response.json())
    .then(data => {
      const code = data.invitationCode;
      codeEl.textContent = code;
      codeEl.classList.add('fade-in');
      setTimeout(() => codeEl.classList.remove('fade-in'), 500);
      document.getElementById('lastUpdate').textContent = "最後更新：" + new Date().toLocaleString();
    })
    .catch(error => {
      console.error('Error fetching invitation code:', error);
      codeEl.textContent = config.fallbackCode;
      showToast("無法連接到伺服器，顯示暫存邀請碼");
    });
}

// 更新倒數計時與進度條
function updateTimer() {
  const now = new Date();
  const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
  const timeLeft = nextHour - now;
  
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const timerElement = document.getElementById('timer');
  timerElement.innerHTML = `<i class="fas fa-hourglass-half"></i> 更新倒數：${minutes}分${seconds}秒`;

  const hourDuration = 3600000;
  let progress = ((hourDuration - timeLeft) / hourDuration) * 100;
  progress = Math.min(100, Math.max(0, progress));
  document.getElementById('progressBar').style.width = progress + '%';

  if (timeLeft <= 0) {
    updateInvitationCode();
  }
}

// 複製邀請碼
function copyInvitationCode() {
  const invitationCode = document.getElementById('invitationCode').textContent;
  if (!invitationCode || invitationCode.includes('spinner')) {
    showToast('邀請碼正在加載，請稍後再試');
    return;
  }
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(invitationCode).then(() => {
      showToast("已成功複製邀請碼！");
    }).catch(err => {
      console.error('無法複製到剪貼簿:', err);
      fallbackCopy(invitationCode);
    });
  } else {
    fallbackCopy(invitationCode);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast("已成功複製邀請碼！");
  } catch (err) {
    console.error('無法複製到剪貼簿:', err);
    alert('複製失敗，請手動複製邀請碼: ' + text);
  }
  document.body.removeChild(textArea);
}

// 顯示 Toast 提示
function showToast(message = "已成功複製邀請碼！") {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
  }, 2000);
}

// 顯示 QR 碼模態框
function showQRCode() {
  const invitationCode = document.getElementById('invitationCode').textContent;
  if (!invitationCode || invitationCode.includes('spinner')) {
    showToast('邀請碼正在加載，請稍後再試');
    return;
  }
  
  const modal = document.getElementById("qrModal");
  const span = document.getElementsByClassName("close")[0];
  const qrCodeDiv = document.getElementById("qrCode");
  
  qrCodeDiv.innerHTML = '';
  new QRCode(qrCodeDiv, {
    text: invitationCode,
    width: 256,
    height: 256,
    colorDark : "#000000",
    colorLight : "#FFFFFF",
    correctLevel : QRCode.CorrectLevel.H
  });
  
  modal.style.display = "block";
  
  span.onclick = function() { modal.style.display = "none"; };
  
  window.onclick = function(event) {
    if (event.target == modal) { modal.style.display = "none"; }
  }
}

// 分享邀請碼
function shareInvitationCode() {
  const invitationCode = document.getElementById('invitationCode').textContent;
  if (!invitationCode || invitationCode.includes('spinner')) {
    showToast('邀請碼正在加載，請稍後再試');
    return;
  }
  
  if (navigator.share) {
    navigator.share({
      title: '桃聯區會考落點分析邀請碼',
      text: `我的桃聯區會考落點分析邀請碼是：${invitationCode}`,
      url: config.websiteURL
    }).then(() => {
      console.log('邀請碼分享成功');
    }).catch((error) => {
      console.log('邀請碼分享失敗', error);
      fallbackShare(invitationCode);
    });
  } else {
    fallbackShare(invitationCode);
  }
}

function fallbackShare(code) {
  alert(`請複製以下文字進行分享：\n\n我的桃聯區會考落點分析邀請碼是：${code}\n\n網站: ${config.websiteURL}`);
}

// 手動更新邀請碼
function manualRefresh() {
  updateInvitationCode();
  showToast("邀請碼更新中...");
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  updateDarkModeIcon();
  
  if (document.getElementById("qrModal").style.display === "block") {
    showQRCode();
  }
}

function updateDarkModeIcon() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const isDarkMode = document.body.classList.contains('dark-mode');
  darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') { document.body.classList.add('dark-mode'); }
  updateDarkModeIcon();
  darkModeToggle.addEventListener('click', toggleDarkMode);
}

// 初始化「使用說明」模態框
function initHelp() {
  const helpButton = document.getElementById('helpButton');
  const helpModal = document.getElementById('helpModal');
  const helpClose = document.getElementsByClassName('help-close')[0];
  helpButton.addEventListener('click', function() { helpModal.style.display = "block"; });
  helpClose.addEventListener('click', function() { helpModal.style.display = "none"; });
  window.addEventListener('click', function(e) {
    if (e.target == helpModal) { helpModal.style.display = "none"; }
  });
}

// 安全措施
function setupSecurity() {
  if (config.preventCopy) {
    document.addEventListener('copy', function(e) { 
      if(!e.target.closest('input, textarea')) {
        e.preventDefault(); 
        return false; 
      }
    });
  }
  
  if (config.preventScreenshot) {
    document.addEventListener('keyup', function(e) {
      if (e.key == 'PrintScreen') {
        navigator.clipboard.writeText('');
        showToast('截圖功能已被禁用');
      }
    });
  }
  
  if (config.preventRightClick) {
    document.addEventListener('contextmenu', function(e) { 
      if(!e.target.closest('input, textarea')) {
        e.preventDefault(); 
      }
    });
  }
  
  if (config.preventTextSelection) {
    document.onselectstart = function(e) { 
      let target = e.target;
      let isInputOrTextarea = false;
      
      while (target !== null) {
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          isInputOrTextarea = true;
          break;
        }
        target = target.parentElement;
      }
      
      if (!isInputOrTextarea) {
        return false;
      }
    };
  }
}

// 下載 QR 碼
function downloadQRCode() {
  const qrCodeDiv = document.getElementById('qrCode');
  const qrCodeImg = qrCodeDiv.querySelector('img');
  
  if (!qrCodeImg) {
    showToast('QR碼尚未生成，請稍後再試');
    return;
  }

  // 創建一個臨時的canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 設置canvas大小
  canvas.width = qrCodeImg.width;
  canvas.height = qrCodeImg.height;
  
  // 繪製白色背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 繪製QR碼
  ctx.drawImage(qrCodeImg, 0, 0, canvas.width, canvas.height);
  
  // 創建下載連結
  const link = document.createElement('a');
  link.download = '邀請碼QR碼.png';
  link.href = canvas.toDataURL('image/png');
  
  // 觸發下載
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('QR碼下載中...');
}

// 初始化
function init() {
  updateInvitationCode();
  setInterval(updateTimer, 1000);
  initDarkMode();
  initHelp();
  setupSecurity();
  
  window.copyInvitationCode = copyInvitationCode;
  window.showQRCode = showQRCode;
  window.shareInvitationCode = shareInvitationCode;
  window.manualRefresh = manualRefresh;
  window.showToast = showToast;
  window.downloadQRCode = downloadQRCode;
}

init();