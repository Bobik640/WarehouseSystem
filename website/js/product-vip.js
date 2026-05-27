function createVipTooltip() {

    return `
        <div class="vip-tooltip">

            <div class="vip-tooltip-bg">
                💎
            </div>

            <div class="vip-tooltip-title">

                💎 VIP PRODUCT

            </div>

            <div class="vip-bar">

                <div class="vip-bar-fill">

                    <div class="vip-shine"></div>

                </div>

            </div>

            <div class="vip-percent">

                100%

            </div>

            <div class="vip-info">

                <div>

                    Статус:
                    Элитный товар

                </div>

                <div>

                    Класс:
                    PREMIUM

                </div>

            </div>

        </div>
    `;
}

window.createVipTooltip =
    createVipTooltip;