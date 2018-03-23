function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('sets', function(data){
        renderStatus('stored size: ' + JSON.stringify(data).length);
  })
});