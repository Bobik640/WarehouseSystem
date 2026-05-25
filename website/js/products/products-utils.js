// ===== УТИЛИТЫ =====

function saveHistory(action, details) {
    var history = JSON.parse(localStorage.getItem('warehouseHistory') || '[]');
    
    var historyItem = {
        id: Date.now(),
        action: action,
        details: details,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleString(),
        admin: AppState.isLoggedIn ? 'Админ' : 'Гость'
    };
    
    history.unshift(historyItem);
    
    if (history.length > 200) history.pop();
    
    localStorage.setItem('warehouseHistory', JSON.stringify(history));
}

function escapeHtml(str){
    if(!str) return '';
    return str.replace(
        /[&<>'"]/g,
        function(m){
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            if(m === '"') return '&quot;';
            if(m === "'") return '&#39;';
            return m;
        }
    );
}

function convertImageToBase64(file){

    return new Promise(function(resolve){

        const reader = new FileReader();

        reader.onload = function(e){

            resolve(e.target.result);
        };

        reader.readAsDataURL(file);
    });
}