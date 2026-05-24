function showStatus(message, type) {
    const oldStatus = document.querySelector('.status-bar');
    if (oldStatus) oldStatus.remove();
    
    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar ' + type;
    statusBar.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i><span>' + message + '</span>';
    
    document.body.appendChild(statusBar);
    
    setTimeout(function() {
        if (statusBar.parentNode) {
            statusBar.remove();
        }
    }, 3000);
}