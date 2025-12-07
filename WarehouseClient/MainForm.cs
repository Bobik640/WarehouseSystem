using System;
using System.Drawing;
using System.Net.Http;
using System.Text;
using System.Windows.Forms;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Drawing.Drawing2D;
using System.ComponentModel; 

namespace WarehouseClient
{
    public partial class MainForm : Form
    {
        private DataGridView? dataGridView;
        private Button? btnLoad, btnAdd, btnReduce, btnDelete;
        private TextBox? txtName, txtQuantity, txtCategory, txtPrice, txtSearch;
        private Label? lblStatus, lblTitle, lblSubtitle;
        private Panel? panelSidebar, panelHeader, panelContent, panelStats;
        
        private readonly HttpClient httpClient;
        private readonly string apiUrl = "http://localhost:3002/api/products";

        // --- ЦВЕТОВАЯ СХЕМА (КРАСНЫЙ/ЧЕРНЫЙ/БЕЛЫЙ) ---
        private readonly Color primaryColor = Color.FromArgb(200, 0, 0);       // Ярко-красный (Шапка, Заголовки таблицы)
        private readonly Color secondaryColor = Color.FromArgb(15, 15, 15);    // Глубокий черный (Сайдбар)
        
        // ИЗМЕНЕНИЕ: Фон полей ввода - черный
        private readonly Color inputBackColor = Color.Black; 
        
        private readonly Color accentColor = Color.FromArgb(255, 100, 100);    // Светло-красный (Акцент)
        private readonly Color successColor = Color.FromArgb(0, 150, 0);       // Зеленый для успеха (для контраста в статусе)
        private readonly Color dangerColor = Color.FromArgb(255, 0, 0);        // Ярко-красный (Опасность/Удаление)
        private readonly Color cardColor = Color.White;                        // Чисто белый для контента
        private readonly Color selectionColor = Color.FromArgb(60, 0, 0);      // Темно-красный для выделения строк
        
        public MainForm()
        {
            httpClient = new HttpClient();
            InitializeComponent();
            _ = LoadProducts();
        }

        private void InitializeComponent()
        {
            // Настройка главного окна
            this.Text = "🏭 Smart Warehouse System";
            this.Size = new Size(1200, 720);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.White;
            this.Font = new Font("Segoe UI", 9, FontStyle.Regular);

            // 1. Панель заголовка
            panelHeader = new CustomPanel();
            panelHeader.Dock = DockStyle.Top;
            panelHeader.Height = 70;
            panelHeader.BackColor = primaryColor; // КРАСНЫЙ

            lblTitle = new Label();
            lblTitle.Text = "🏭 УПРАВЛЕНИЕ СКЛАДОМ";
            lblTitle.Font = new Font("Segoe UI", 16, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.Location = new Point(30, 15);
            lblTitle.AutoSize = true;

            lblSubtitle = new Label();
            lblSubtitle.Text = "Система управления товарными запасами";
            lblSubtitle.Font = new Font("Segoe UI", 9);
            // ИЗМЕНЕНИЕ: Белый/Светлый текст на красном фоне
            lblSubtitle.ForeColor = Color.White; 
            lblSubtitle.Location = new Point(33, 45);
            lblSubtitle.AutoSize = true;

            panelHeader.Controls.Add(lblTitle);
            panelHeader.Controls.Add(lblSubtitle);

            // 2. Боковая панель
            panelSidebar = new CustomPanel();
            panelSidebar.Dock = DockStyle.Left;
            panelSidebar.Width = 300;
            panelSidebar.BackColor = secondaryColor; // ГЛУБОКИЙ ЧЕРНЫЙ
            panelSidebar.AutoScroll = true; 

            // 3. Панель статистики
            panelStats = new CustomPanel();
            panelStats.Size = new Size(280, 100);
            panelStats.Location = new Point(10, 15);
            // ИЗМЕНЕНИЕ: Фон статистики - черный
            panelStats.BackColor = Color.Black; 
            panelStats.BorderStyle = BorderStyle.FixedSingle;

            var lblStatsTitle = new Label();
            lblStatsTitle.Text = "📊 СТАТИСТИКА";
            lblStatsTitle.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            lblStatsTitle.ForeColor = accentColor; // СВЕТЛО-КРАСНЫЙ АКЦЕНТ
            lblStatsTitle.Location = new Point(10, 10);
            lblStatsTitle.AutoSize = true;

            panelStats.Controls.Add(lblStatsTitle);

            // 4. Основная панель контента
            panelContent = new CustomPanel();
            panelContent.Dock = DockStyle.Fill;
            panelContent.BackColor = Color.White; // БЕЛЫЙ
            panelContent.Padding = new Padding(20);

            // DataGridView
            dataGridView = new DataGridView();
            dataGridView.Dock = DockStyle.Fill;
            dataGridView.BorderStyle = BorderStyle.None;
            dataGridView.BackgroundColor = cardColor;
            dataGridView.GridColor = Color.FromArgb(230, 230, 230);
            dataGridView.Font = new Font("Segoe UI", 9);
            
            // Стиль заголовков
            dataGridView.ColumnHeadersDefaultCellStyle.BackColor = primaryColor; // КРАСНЫЙ
            dataGridView.ColumnHeadersDefaultCellStyle.ForeColor = Color.White;
            dataGridView.ColumnHeadersDefaultCellStyle.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            dataGridView.ColumnHeadersHeight = 45;
            dataGridView.EnableHeadersVisualStyles = false;
            
            // Стиль строк
            dataGridView.DefaultCellStyle.Font = new Font("Segoe UI", 9);
            dataGridView.DefaultCellStyle.BackColor = Color.White;
            // ИЗМЕНЕНИЕ: Более нейтральный светло-серый для чередующихся строк
            dataGridView.AlternatingRowsDefaultCellStyle.BackColor = Color.FromArgb(245, 245, 245); 
            dataGridView.RowHeadersVisible = false;
            dataGridView.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            // ИЗМЕНЕНИЕ: Темно-красный для выделения строк
            dataGridView.DefaultCellStyle.SelectionBackColor = selectionColor; 
            dataGridView.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            dataGridView.AllowUserToAddRows = false;
            dataGridView.AllowUserToDeleteRows = false;
            dataGridView.ReadOnly = true;

            // Колонки
            dataGridView.Columns.Add("Id", "ID");
            dataGridView.Columns.Add("Name", "НАЗВАНИЕ ТОВАРА");
            dataGridView.Columns.Add("Quantity", "КОЛИЧЕСТВО");
            dataGridView.Columns.Add("Category", "КАТЕГОРИЯ");
            dataGridView.Columns.Add("Price", "ЦЕНА (сом)");
            
            dataGridView.Columns["Price"].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
            dataGridView.Columns["Price"].DefaultCellStyle.Format = "N2";
            dataGridView.Columns["Price"].DefaultCellStyle.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            // ИЗМЕНЕНИЕ: Цвет цены на ярко-красный (dangerColor)
            dataGridView.Columns["Price"].DefaultCellStyle.ForeColor = dangerColor; 
            dataGridView.Columns["Quantity"].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;
            
            // Кнопки
            // ОБНОВИТЬ (Синий -> Темно-красный/Серый)
            CreateModernButton(ref btnLoad, "🔄 ОБНОВИТЬ ДАННЫЕ", 20, 130, Color.FromArgb(40, 40, 40)); 
            // ДОБАВИТЬ (Зеленый -> Красный)
            CreateModernButton(ref btnAdd, "➕ ДОБАВИТЬ ТОВАР", 20, 180, primaryColor); 
            // СПИСАТЬ (Оранжевый -> Темно-серый)
            CreateModernButton(ref btnReduce, "📉 СПИСАТЬ ТОВАР", 20, 230, Color.FromArgb(60, 60, 60)); 
            // УДАЛИТЬ (Красный -> Ярко-красный)
            CreateModernButton(ref btnDelete, "🗑️ УДАЛИТЬ ТОВАР", 20, 280, dangerColor); 

            // Поле поиска
            var searchPanel = new CustomPanel();
            searchPanel.Size = new Size(260, 40);
            searchPanel.Location = new Point(20, 340);
            searchPanel.BackColor = inputBackColor; // Черный
            ((CustomPanel)searchPanel).BorderRadius = 20;

            txtSearch = new CustomTextBox();
            txtSearch.Location = new Point(45, 10);
            txtSearch.Size = new Size(200, 25);
            txtSearch.BorderStyle = BorderStyle.None;
            txtSearch.BackColor = inputBackColor; // Черный
            txtSearch.ForeColor = Color.White;
            txtSearch.Font = new Font("Segoe UI", 10);
            txtSearch.PlaceholderText = "Поиск товаров...";

            var searchIcon = new Label();
            searchIcon.Text = "🔍";
            searchIcon.Font = new Font("Segoe UI", 12);
            searchIcon.ForeColor = Color.Gray;
            searchIcon.Location = new Point(15, 8);
            searchIcon.Size = new Size(30, 30);

            searchPanel.Controls.Add(txtSearch);
            searchPanel.Controls.Add(searchIcon);

            // Поля ввода
            CreateInputField("Название товара", ref txtName, 20, 400);
            CreateInputField("Количество", ref txtQuantity, 20, 460, "1");
            CreateInputField("Категория", ref txtCategory, 20, 520, "Разное");
            CreateInputField("Цена (сом)", ref txtPrice, 20, 580, "0");

            // Статус бар
            lblStatus = new Label();
            lblStatus.Text = "✅ Система готова к работе";
            lblStatus.Font = new Font("Segoe UI", 10, FontStyle.Regular);
            lblStatus.ForeColor = successColor;
            lblStatus.Dock = DockStyle.Bottom;
            lblStatus.Height = 30;
            lblStatus.TextAlign = ContentAlignment.MiddleLeft;

            // Сборка формы
            panelContent.Controls.Add(dataGridView);
            panelContent.Controls.Add(lblStatus);
            
            panelSidebar.Controls.Add(panelStats);
            panelSidebar.Controls.Add(searchPanel);
            
            this.Controls.Add(panelContent);
            this.Controls.Add(panelSidebar);
            this.Controls.Add(panelHeader);

            // Обработчики
            if (btnLoad != null) btnLoad.Click += BtnLoad_Click;
            if (btnAdd != null) btnAdd.Click += BtnAdd_Click;
            if (btnReduce != null) btnReduce.Click += BtnReduce_Click;
            if (btnDelete != null) btnDelete.Click += BtnDelete_Click;
            if (txtSearch != null) txtSearch.TextChanged += TxtSearch_TextChanged;
        }

        private void CreateModernButton(ref Button button, string text, int x, int y, Color color)
        {
            button = new Button();
            button.Text = text;
            button.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            button.ForeColor = Color.White;
            button.BackColor = color;
            button.FlatStyle = FlatStyle.Flat;
            button.FlatAppearance.BorderSize = 0;
            button.Size = new Size(260, 40);
            button.Location = new Point(x, y);
            button.Cursor = Cursors.Hand;
            button.TextAlign = ContentAlignment.MiddleCenter;
            
            Button localBtn = button;
            localBtn.MouseEnter += (s, e) => localBtn.BackColor = ControlPaint.Light(color, 0.2f);
            localBtn.MouseLeave += (s, e) => localBtn.BackColor = color;
            
            panelSidebar?.Controls.Add(button);
        }

        private void CreateInputField(string labelText, ref TextBox textBox, int x, int y, string defaultValue = "")
        {
            var label = new Label();
            label.Text = labelText;
            label.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            label.ForeColor = Color.FromArgb(180, 180, 180);
            label.Location = new Point(x, y);
            label.Size = new Size(260, 20);
            label.AutoSize = true;

            textBox = new CustomTextBox();
            textBox.Location = new Point(x, y + 20);
            textBox.Size = new Size(260, 30);
            textBox.Font = new Font("Segoe UI", 10);
            textBox.BackColor = inputBackColor; // Черный
            textBox.ForeColor = Color.White;
            textBox.BorderStyle = BorderStyle.FixedSingle;
            // ИЗМЕНЕНИЕ: Цвет рамки - темно-красный
            ((CustomTextBox)textBox).BorderColor = Color.FromArgb(100, 0, 0); 
            textBox.Text = defaultValue;
            textBox.Padding = new Padding(5, 5, 5, 5);

            panelSidebar?.Controls.Add(label);
            panelSidebar?.Controls.Add(textBox);
        }

        private async Task LoadProducts()
        {
            try
            {
                if (lblStatus != null)
                {
                    lblStatus.Text = "⏳ Загружаю данные с сервера...";
                    lblStatus.ForeColor = accentColor;
                }

                var response = await httpClient.GetAsync(apiUrl);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<ApiResponse>(json);

                    if (dataGridView != null && result != null && result.data != null)
                    {
                        dataGridView.Rows.Clear();
                        foreach (var product in result.data)
                        {
                            dataGridView.Rows.Add(
                                product.id,
                                product.name,
                                product.quantity,
                                product.category,
                                product.price.ToString("N2")
                            );
                            
                            if (product.quantity < 10)
                            {
                                // ИЗМЕНЕНИЕ: Светло-красный цвет для предупреждения о низком запасе
                                dataGridView.Rows[dataGridView.Rows.Count - 1].DefaultCellStyle.BackColor = 
                                    Color.FromArgb(255, 220, 220);
                            }
                        }

                        if (lblStatus != null)
                        {
                            lblStatus.Text = $"✅ Загружено {result.count} товаров | Последнее обновление: {DateTime.Now:HH:mm:ss}";
                            lblStatus.ForeColor = successColor;
                        }
                    }
                }
                else
                {
                    if (lblStatus != null)
                    {
                        lblStatus.Text = "❌ Ошибка подключения к серверу";
                        lblStatus.ForeColor = dangerColor;
                    }
                }
            }
            catch (Exception ex)
            {
                if (lblStatus != null)
                {
                    lblStatus.Text = $"❌ Ошибка: {ex.Message}";
                    lblStatus.ForeColor = dangerColor;
                }
            }
        }

        private async void BtnLoad_Click(object? sender, EventArgs e)
        {
            await LoadProducts();
        }

        private async void BtnAdd_Click(object? sender, EventArgs e)
        {
            if (txtName == null || string.IsNullOrWhiteSpace(txtName.Text))
            {
                ShowNotification("Введите название товара", dangerColor);
                return;
            }

            if (txtQuantity == null || !int.TryParse(txtQuantity.Text, out int quantity) || quantity <= 0)
            {
                ShowNotification("Введите корректное количество", dangerColor);
                return;
            }

            if (txtPrice == null || !decimal.TryParse(txtPrice.Text, out decimal price) || price < 0)
            {
                ShowNotification("Введите корректную цену в сомах", dangerColor);
                return;
            }

            try
            {
                var product = new
                {
                    name = txtName.Text,
                    quantity = quantity,
                    category = txtCategory?.Text ?? "Разное",
                    price = price
                };

                var json = JsonConvert.SerializeObject(product);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                if (lblStatus != null)
                {
                    lblStatus.Text = "⏳ Отправляю данные на сервер...";
                    lblStatus.ForeColor = accentColor;
                }

                var response = await httpClient.PostAsync(apiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    ShowNotification("Товар успешно добавлен!", successColor);
                    if (txtName != null) txtName.Clear();
                    if (txtQuantity != null) txtQuantity.Text = "1";
                    if (txtPrice != null) txtPrice.Text = "0";
                    await LoadProducts();
                }
                else
                {
                    ShowNotification("Ошибка при добавлении товара", dangerColor);
                }
            }
            catch (Exception ex)
            {
                ShowNotification($"Ошибка: {ex.Message}", dangerColor);
            }
        }

        private async void BtnReduce_Click(object? sender, EventArgs e)
        {
            if (dataGridView == null || dataGridView.SelectedRows.Count == 0)
            {
                ShowNotification("Выберите товар для списания", dangerColor);
                return;
            }

            var selectedRow = dataGridView.SelectedRows[0];
            string? productId = selectedRow.Cells["Id"].Value?.ToString();
            string? productName = selectedRow.Cells["Name"].Value?.ToString();

            if (string.IsNullOrEmpty(productId)) return;

            using (var inputForm = new ModernInputForm($"Сколько единиц товара '{productName}' списать?"))
            {
                if (inputForm.ShowDialog() == DialogResult.OK)
                {
                    if (int.TryParse(inputForm.Value, out int quantity) && quantity > 0)
                    {
                        try
                        {
                            var data = new { quantity = quantity };
                            var json = JsonConvert.SerializeObject(data);
                            var content = new StringContent(json, Encoding.UTF8, "application/json");
                            var response = await httpClient.PutAsync($"{apiUrl}/{productId}/reduce", content);

                            if (response.IsSuccessStatusCode)
                            {
                                ShowNotification($"Списано {quantity} ед.", successColor);
                                await LoadProducts();
                            }
                            else
                            {
                                ShowNotification("Ошибка списания", dangerColor);
                            }
                        }
                        catch (Exception ex)
                        {
                            ShowNotification($"Ошибка: {ex.Message}", dangerColor);
                        }
                    }
                }
            }
        }

        private async void BtnDelete_Click(object? sender, EventArgs e)
        {
            if (dataGridView == null || dataGridView.SelectedRows.Count == 0)
            {
                ShowNotification("Выберите товар для удаления", dangerColor);
                return;
            }

            var selectedRow = dataGridView.SelectedRows[0];
            string? productId = selectedRow.Cells["Id"].Value?.ToString();
            string? productName = selectedRow.Cells["Name"].Value?.ToString();

            if (string.IsNullOrEmpty(productId)) return;

            var result = ModernMessageBox.Show(
                $"Удалить товар '{productName}'?", "Удаление",
                MessageBoxButtons.YesNo, MessageBoxIcon.Warning
            );

            if (result == DialogResult.Yes)
            {
                try
                {
                    var response = await httpClient.DeleteAsync($"{apiUrl}/{productId}");
                    if (response.IsSuccessStatusCode)
                    {
                        ShowNotification($"Товар удалён", successColor);
                        await LoadProducts();
                    }
                    else
                    {
                        ShowNotification("Ошибка удаления", dangerColor);
                    }
                }
                catch (Exception ex)
                {
                    ShowNotification($"Ошибка: {ex.Message}", dangerColor);
                }
            }
        }

        private void TxtSearch_TextChanged(object? sender, EventArgs e)
        {
            if (dataGridView != null && txtSearch != null)
            {
                string searchText = txtSearch.Text.ToLower();
                foreach (DataGridViewRow row in dataGridView.Rows)
                {
                    bool visible = string.IsNullOrEmpty(searchText);
                    if (!visible && row.Cells["Name"].Value != null)
                    {
                        visible = row.Cells["Name"].Value.ToString()?.ToLower().Contains(searchText) == true;
                    }
                    row.Visible = visible;
                }
            }
        }

        private void ShowNotification(string message, Color color)
        {
            if (lblStatus != null)
            {
                lblStatus.Text = message;
                lblStatus.ForeColor = color;
            }
        }

        public class ApiResponse
        {
            public bool success { get; set; }
            public string message { get; set; } = string.Empty;
            public int count { get; set; }
            public List<Product> data { get; set; } = new List<Product>();
        }

        public class Product
        {
            public int id { get; set; }
            public string name { get; set; } = string.Empty;
            public int quantity { get; set; }
            public string category { get; set; } = string.Empty;
            public decimal price { get; set; }
        }
    }

    public class ModernInputForm : Form
    {
        private TextBox textBox;
        public string Value { get; private set; } = string.Empty;

        public ModernInputForm(string question)
        {
            this.Text = "Действие";
            this.Size = new Size(400, 200);
            this.StartPosition = FormStartPosition.CenterParent;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.BackColor = Color.White;

            var label = new Label 
            { 
                Text = question, Location = new Point(20, 30), Size = new Size(340, 50),
                Font = new Font("Segoe UI", 11)
            };

            textBox = new CustomTextBox 
            { 
                Location = new Point(20, 90), Size = new Size(340, 40),
                Font = new Font("Segoe UI", 12), BorderStyle = BorderStyle.FixedSingle,
                Text = "1", TextAlign = HorizontalAlignment.Center
            };

            var btnOK = new Button 
            { 
                Text = "OK", Location = new Point(120, 140), Size = new Size(120, 35),
                // ИЗМЕНЕНИЕ: Кнопка OK - Красный
                BackColor = Color.FromArgb(200, 0, 0), ForeColor = Color.White, 
                FlatStyle = FlatStyle.Flat, DialogResult = DialogResult.OK 
            };
            btnOK.Click += (s, e) => { Value = textBox.Text; };

            this.Controls.Add(label);
            this.Controls.Add(textBox);
            this.Controls.Add(btnOK);
        }
    }

    public static class ModernMessageBox
    {
        public static DialogResult Show(string text, string caption, MessageBoxButtons buttons, MessageBoxIcon icon)
        {
            return MessageBox.Show(text, caption, buttons, icon);
        }
    }

    public class CustomTextBox : System.Windows.Forms.TextBox
    {
        private Color borderColor = SystemColors.WindowFrame;
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public Color BorderColor { get { return borderColor; } set { borderColor = value; Invalidate(); } }

        private string placeholderText = "";
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public new string PlaceholderText { get { return placeholderText; } set { placeholderText = value; Invalidate(); } }
        private bool isPlaceholderActive = false;

        public CustomTextBox() { this.SetStyle(ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw, true); }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (BorderStyle == BorderStyle.FixedSingle)
            {
                using (Pen pen = new Pen(borderColor, 1))
                    e.Graphics.DrawRectangle(pen, 0, 0, Width - 1, Height - 1);
            }
            if (string.IsNullOrEmpty(this.Text) && !string.IsNullOrEmpty(placeholderText) && !isPlaceholderActive)
            {
                using (Brush brush = new SolidBrush(Color.Gray))
                    e.Graphics.DrawString(placeholderText, this.Font, brush, new PointF(1, (Height - this.Font.Height) / 2));
            }
        }

        protected override void OnTextChanged(EventArgs e)
        {
            base.OnTextChanged(e);
            isPlaceholderActive = !string.IsNullOrEmpty(this.Text);
            Invalidate();
        }
    }

    public class CustomPanel : System.Windows.Forms.Panel
    {
        private int borderRadius = 0;
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public int BorderRadius { get { return borderRadius; } set { borderRadius = value; Invalidate(); } }

        public CustomPanel() { this.SetStyle(ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw, true); this.DoubleBuffered = true; }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (borderRadius > 0)
            {
                using (GraphicsPath path = new GraphicsPath())
                {
                    path.AddArc(0, 0, borderRadius, borderRadius, 180, 90);
                    path.AddArc(Width - borderRadius, 0, borderRadius, borderRadius, 270, 90);
                    path.AddArc(Width - borderRadius, Height - borderRadius, borderRadius, borderRadius, 0, 90);
                    path.AddArc(0, Height - borderRadius, borderRadius, borderRadius, 90, 90);
                    path.CloseFigure();
                    this.Region = new Region(path);
                }
            }
        }
    }
}