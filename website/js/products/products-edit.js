function injectEditModalMarkup() {
    const container = document.getElementById('modalContainer');
    if (!container) return;

    const modalHtml = `
        <div class="edit-modal-overlay" id="editProductModalOverlay">
            <div class="edit-modal">
                <div class="edit-modal-container">
                    
                    <div class="edit-modal-header">
                        <div>
                            <div class="edit-modal-label">УПРАВЛЕНИЕ СКЛАДОМ</div>
                            <h2 class="edit-modal-title" id="editModalTitle">Редактирование</h2>
                        </div>
                        <button class="edit-close-btn" id="closeEditModalBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="edit-modal-body">
                        
                        <div class="edit-section">
                            <div class="edit-section-title">Изображение товара</div>
                            <img id="editImagePreview" class="edit-preview-image" src="" alt="Превью" style="display: none;">
                            
                            <div class="edit-upload-zone" id="editUploadZone">
                                <div class="edit-upload-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div class="edit-upload-title">Загрузить фото</div>
                                <div class="edit-upload-subtitle">Перетащите файл сюда</div>
                            </div>
                        </div>

                        <div class="edit-form">
                            
                            <div class="edit-section">
                                <div class="edit-section-title">Основная информация</div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">НАЗВАНИЕ ТОВАРА</div>
                                        <input type="text" id="editProductName" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">КАТЕГОРИЯ</div>
                                        <select id="editProductCategory" class="warehouse-input" style="width:100%; margin-top:5px;">
                                            <option value="Электроника">Электроника</option>
                                            <option value="Медикаменты">Медикаменты</option>
                                            <option value="Инструменты">Инструменты</option>
                                            <option value="Другое">Другое</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <div class="edit-modal-label">ОПИСАНИЕ</div>
                                    <textarea id="editProductDescription" class="warehouse-input" rows="3" style="width:100%; margin-top:5px; resize:none;"></textarea>
                                </div>
                            </div>

                            <div class="edit-section">
                                <div class="edit-section-title">Складские данные</div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">КОЛИЧЕСТВО</div>
                                        <input type="number" id="editProductQuantity" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">МИН. ОСТАТОК</div>
                                        <input type="number" id="editProductMinStock" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ЦЕНА</div>
                                        <input type="number" id="editProductPrice" class="warehouse-input" step="0.01" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">СРОК ГОДНОСТИ</div>
                                        <input type="date" id="editProductExpiryDate" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                </div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">ПОСТАВЩИК</div>
                                        <input type="text" id="editProductSupplier" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">МЕСТО НА СКЛАДЕ</div>
                                        <input type="text" id="editProductLocation" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                </div>
                            </div>

                            <div class="edit-medicine-fields" id="editMedicineFields">
                                <div class="edit-section-title">Медицинские показатели</div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">СЕРИЯ</div>
                                        <input type="text" id="editMedicineSeries" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ПРОИЗВОДИТЕЛЬ</div>
                                        <input type="text" id="editMedicineManufacturer" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ДОЗИРОВКА</div>
                                        <input type="text" id="editMedicineDosage" class="warehouse-input" style="width:100%; margin-top:5px;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ТИП МЕДИКАМЕНТА</div>
                                        <select id="editMedicineType" class="warehouse-input" style="width:100%; margin-top:5px;">
                                            <option>Таблетки</option>
                                            <option>Сироп</option>
                                            <option>Ампулы</option>
                                            <option>Капсулы</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="edit-grid" style="align-items: center;">
                                    <div>
                                        <div class="edit-modal-label">УСЛОВИЯ ОТПУСКА</div>
                                        <select id="editPrescriptionRequired" class="warehouse-input" style="width:100%; margin-top:5px;">
                                            <option value="false">Без рецепта</option>
                                            <option value="true">По рецепту</option>
                                        </select>
                                    </div>
                                    <label class="edit-fridge-toggle" style="margin-top: 20px;">
                                        <input type="checkbox" id="editRefrigerationRequired">
                                        <div class="edit-fridge-slider"></div>
                                        <span class="edit-modal-label" style="letter-spacing:0; color:white;">ТРЕБУЕТ ХОЛОДИЛЬНИК</span>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="edit-modal-footer">
                        <button class="edit-save-btn" id="saveEditBtn">
                            <i class="fas fa-save"></i> Сохранить изменения
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', modalHtml);

    // Слушатели закрытия и сохранения
    document.getElementById('closeEditModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveEditBtn').addEventListener('click', saveProductEdit);
}