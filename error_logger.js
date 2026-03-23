window.addEventListener('error', function(e) {
    if (window.__logError_triggered) return;
    window.__logError_triggered = true;
    
    const err = { 
        msg: e.message, 
        file: e.filename, 
        lineno: e.lineno, 
        colno: e.colno, 
        err: e.error ? e.error.stack : '' 
    };
    
    console.error('EASYTV_GLOBAL_ERROR', JSON.stringify(err));
});