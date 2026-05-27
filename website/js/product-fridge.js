function createFridgeTooltip() {

    const coldLevel =
        Math.floor(
            Math.random() * 20
        ) + 80;

    return `
        <div class="fridge-tooltip">

            <div class="fridge-tooltip-bg">
                ❄
            </div>

            <div class="fridge-tooltip-title">

                ❄ Охлаждение активно

            </div>

            <div class="fridge-bar">

                <div
                    class="fridge-bar-fill"
                    style="
                        width:${coldLevel}%;
                    "
                >

                    <div class="fridge-particles"></div>

                </div>

            </div>

            <div class="fridge-status">

                Режим:
                Стабильное хранение

            </div>

        </div>
    `;
}

window.createFridgeTooltip =
    createFridgeTooltip;