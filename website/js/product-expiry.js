function createExpiryTooltip(product) {

    if (!product.expiryDate) {
        return '';
    }

    const createdDate =
        new Date(product.createdAt || Date.now());

    const expiryDate =
        new Date(product.expiryDate);

    const now =
        new Date();

    const totalLifetime =
        expiryDate - createdDate;

    const remainingLifetime =
        expiryDate - now;

    const progress =
        Math.max(
            0,
            Math.min(
                100,
                (remainingLifetime / totalLifetime) * 100
            )
        );

    const daysLeft =
        Math.ceil(
            remainingLifetime / (1000 * 60 * 60 * 24)
        );

    let statusClass = 'success';

    if (progress < 35) {

        statusClass = 'danger';

    } else if (progress < 60) {

        statusClass = 'warning';
    }

    return `
        <div class="expiry-tooltip">

            <div class="expiry-tooltip-top">

                <span class="expiry-days">
                    Осталось ${daysLeft}д
                </span>

                <span class="expiry-percent">
                    ${Math.round(progress)}%
                </span>

            </div>

            <div class="expiry-bar">

                <div
                    class="
                        expiry-bar-fill
                        ${statusClass}
                    "
                    style="
                        width:${progress}%;
                    "
                >

                    <div class="expiry-particles"></div>

                </div>

            </div>

            <div class="expiry-tooltip-bottom">

                <div>
                    Добавлен:
                    ${
                        createdDate.toLocaleDateString()
                    }
                </div>

                <div>
                    Годен до:
                    ${
                        expiryDate.toLocaleDateString()
                    }
                </div>

            </div>

        </div>
    `;
}

window.createExpiryTooltip =
    createExpiryTooltip;