// ===== ЭКСПОРТ =====

/* ===== EXPORT EXCEL ===== */

async function exportToExcel(){
    if(!AppState.products.length){
        showStatus('Нет товаров для экспорта', 'error');
        return;
    }

    if(typeof ExcelJS === 'undefined'){
        showStatus('Библиотека Excel не загружена', 'error');
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Warehouse Report');

        /* ===== TITLE ===== */
        sheet.mergeCells('A1:E1');
        const title = sheet.getCell('A1');
        title.value = 'WAREHOUSE REPORT';
        title.font = {
            size:20,
            bold:true,
            color:{argb:'FFFFFFFF'}
        };
        title.alignment = {
            vertical:'middle',
            horizontal:'center'
        };
        title.fill = {
            type:'pattern',
            pattern:'solid',
            fgColor:{argb:'667EEA'}
        };

        sheet.getRow(1).height = 30;

        /* ===== HEADERS ===== */
        const headers = [
            'Название',
            'Категория',
            'Количество',
            'Цена',
            'Стоимость'
        ];

        sheet.addRow([]);

        const headerRow = sheet.addRow(headers);
        headerRow.eachCell(cell=>{
            cell.font = {
                bold:true,
                color:{argb:'FFFFFFFF'}
            };
            cell.fill = {
                type:'pattern',
                pattern:'solid',
                fgColor:{argb:'764BA2'}
            };
            cell.alignment = {
                horizontal:'center'
            };
            cell.border = {
                top:{style:'thin'},
                left:{style:'thin'},
                bottom:{style:'thin'},
                right:{style:'thin'}
            };
        });

        /* ===== DATA ===== */
        AppState.products.forEach(product=>{
            sheet.addRow([
                product.name,
                product.category,
                product.quantity,
                product.price,
                product.quantity * product.price
            ]);
        });

        /* ===== STYLES ===== */
        sheet.columns = [
            { width:35 },
            { width:20 },
            { width:15 },
            { width:15 },
            { width:18 }
        ];

        sheet.eachRow((row,rowNumber)=>{
            if(rowNumber <= 3) return;
            row.eachCell(cell=>{
                cell.border = {
                    top:{style:'thin'},
                    left:{style:'thin'},
                    bottom:{style:'thin'},
                    right:{style:'thin'}
                };
            });
        });

        /* ===== TOTAL ===== */
        const total = AppState.products.reduce((sum,p)=> sum + (p.price * p.quantity), 0);

        sheet.addRow([]);
        const totalRow = sheet.addRow([
            '', '', '', 'ИТОГО:', total
        ]);

        totalRow.font = {
            bold:true
        };

        /* ===== EXPORT ===== */
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'warehouse-report.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showStatus('Excel экспортирован', 'success');
    } catch(error){
        console.error(error);
        showStatus('Ошибка экспорта Excel: ' + error.message, 'error');
    }
}

function exportToPDF(){
    if(!AppState.products.length){
        showStatus('Нет товаров для экспорта', 'error');
        return;
    }

    // Создаем окно для красивой печати / экспорта в системный PDF
    const printWindow = window.open('', '_blank');
    let tableRows = '';
    let totalValue = 0;
    
    AppState.products.forEach(product => {
        const cost = product.quantity * product.price;
        totalValue += cost;
        tableRows += `
            <tr>
                <td>${escapeHtml(product.name)}</td>
                <td>${escapeHtml(product.category)}</td>
                <td style="text-align: center;">${product.quantity}</td>
                <td style="text-align: right;">${Number(product.price).toLocaleString()} сом</td>
                <td style="text-align: right;">${cost.toLocaleString()} сом</td>
            </tr>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Отчет по складу - ${new Date().toLocaleDateString()}</title>
            <style>
                body { font-family: sans-serif; margin: 40px; color: #333; }
                h1 { text-align: center; color: #764BA2; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #667EEA; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .total-row { font-weight: bold; background-color: #e2e8f0; }
                .date { text-align: right; margin-bottom: 20px; color: #666; }
            </style>
        </head>
        <body>
            <h1>ОТЧЕТ ПО СКЛАДУ (WAREHOUSE REPORT)</h1>
            <div class="date">Дата генерации: ${new Date().toLocaleString()}</div>
            <table>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Стоимость</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;">ИТОГО:</td>
                        <td style="text-align: right;">${totalValue.toLocaleString()} сом</td>
                    </tr>
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
    showStatus('Документ отправлен на печать/PDF', 'success');
}