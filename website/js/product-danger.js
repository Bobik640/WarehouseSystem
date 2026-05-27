function createDangerTooltip(product) {

    const now =
        new Date();

    const expiryDate =
        new Date(product.expiryDate);

    const expiredDays =
        Math.abs(
            Math.ceil(
                (now - expiryDate)
                /
                (1000 * 60 * 60 * 24)
            )
        );

    return `
        <div class="danger-tooltip">

            <div class="danger-tooltip-bg">
                ☠
            </div>

            <div class="danger-tooltip-title">

                ☠ Продукт испорчен

            </div>

            <div class="danger-bar">

                <div class="danger-bar-fill">

                    <div class="danger-particles"></div>

                </div>

            </div>

            <div class="danger-percent">

                100%

            </div>

            <div class="danger-info">

                <div>

                    Просрочен:
                    ${expiredDays} дн. назад

                </div>

                <div>

                    Риск:
                    ВЫСОКИЙ

                </div>

            </div>

        </div>
    `;
}

window.createDangerTooltip =
    createDangerTooltip;