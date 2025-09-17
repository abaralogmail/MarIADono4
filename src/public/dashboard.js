class WhatsAppDashboard {
    constructor() {
        this.selectedPhone = null;
        this.phoneList = document.getElementById('phoneList');
        this.chatMessages = document.getElementById('chatMessages');
        this.init();
    }

    async init() {
        await this.loadPhoneNumbers();
        this.setupEventListeners();
    }

    async loadPhoneNumbers() {
        // Aquí conectaremos con la API existente
        const phones = await this.fetchPhoneNumbers();
        this.renderPhoneList(phones);
    }

    async fetchPhoneNumbers() {
        // Implementar conexión con el backend
        return ['54387XXXXXXX', '54387YYYYYYY'];
    }

    renderPhoneList(phones) {
        phones.forEach(phone => {
            const li = document.createElement('li');
            li.className = 'phone-item';
            li.textContent = phone;
            li.onclick = () => this.selectPhone(phone);
            this.phoneList.appendChild(li);
        });
    }

    async selectPhone(phone) {
        this.selectedPhone = phone;
        document.getElementById('selectedPhone').textContent = phone;
        await this.loadChatHistory(phone);
    }

    async loadChatHistory(phone) {
        // Implementar carga de historial desde el backend
        const history = await this.fetchChatHistory(phone);
        this.renderChatHistory(history);
    }
}

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppDashboard();
});
