/* ===================================================== */
/* ================= HISTORY SYSTEM ==================== */
/* ===================================================== */


/* ===== SAVE ===== */

function saveHistory(action, details){

    const history =

        JSON.parse(

            localStorage.getItem(
                'warehouseHistory'
            )

        ) || [];


    history.unshift({

        action,
        details,

        time:
            new Date().toLocaleString()

    });


    localStorage.setItem(

        'warehouseHistory',

        JSON.stringify(history)
    );
}


/* ===== RENDER ===== */

function renderHistory(){

    const historyContent =

        document.getElementById(
            'historyContent'
        );


    if(!historyContent) return;


    const history =

        JSON.parse(

            localStorage.getItem(
                'warehouseHistory'
            )

        ) || [];


    if(!history.length){

        historyContent.innerHTML = `

            <div class="history-empty">

                <i class="fas fa-clock"></i>

                <p>
                    История пока пустая
                </p>

            </div>

        `;

        return;
    }


    historyContent.innerHTML =

        history.map(item => `

            <div class="history-item">

                <div>

                    <strong>
                        ${item.action}
                    </strong>

                    <p>
                        ${item.details}
                    </p>

                </div>

                <span class="history-time">

                    ${item.time}

                </span>

            </div>

        `).join('');
}


/* ===== OPEN/CLOSE ===== */

window.addEventListener('DOMContentLoaded', ()=>{

    const historyBtn =

        document.getElementById(
            'historyBtn'
        );

    const historyOverlay =

        document.getElementById(
            'historyOverlay'
        );

    const closeHistoryBtn =

        document.getElementById(
            'closeHistoryBtn'
        );

    const clearHistoryBtn =

        document.getElementById(
            'clearHistoryBtn'
        );


    /* ===== OPEN ===== */

    if(historyBtn){

        historyBtn.addEventListener(
            'click',
            ()=>{

                historyOverlay.classList.add(
                    'active'
                );

                renderHistory();
            }
        );
    }


    /* ===== CLOSE ===== */

    if(closeHistoryBtn){

        closeHistoryBtn.addEventListener(
            'click',
            ()=>{

                historyOverlay.classList.remove(
                    'active'
                );
            }
        );
    }


    /* ===== CLEAR ===== */

    if(clearHistoryBtn){

        clearHistoryBtn.addEventListener(
            'click',
            ()=>{

                localStorage.removeItem(
                    'warehouseHistory'
                );

                renderHistory();
            }
        );
    }


    /* ===== CLICK OUTSIDE ===== */

    if(historyOverlay){

        historyOverlay.addEventListener(
            'click',
            (e)=>{

                if(
                    e.target === historyOverlay
                ){

                    historyOverlay.classList.remove(
                        'active'
                    );
                }
            }
        );
    }
});