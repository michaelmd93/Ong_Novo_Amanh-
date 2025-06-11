class SessionTimeout {
    constructor(timeoutMinutes = 30) {
        this.timeoutMinutes = timeoutMinutes;
        this.warningShown = false;
        this.timer = null;
        this.lastActivity = Date.now();
        this.setupEventListeners();
        this.initializeTimer();
        this.createModal();
    }

    createModal() {
        // Criar modal de aviso
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'timeoutModal';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" data-i18n="session_timeout">Sessão Expirada</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p data-i18n="session_timeout_message">Sua sessão expirou por inatividade. Por favor, faça login novamente.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-i18n="login_again" onclick="window.location.href='../index.html'">
                            Fazer Login Novamente
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = new bootstrap.Modal(document.getElementById('timeoutModal'));
    }

    resetTimer() {
        this.lastActivity = Date.now();
        this.warningShown = false;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.initializeTimer();
    }

    initializeTimer() {
        this.timer = setTimeout(() => {
            const timeSinceLastActivity = Date.now() - this.lastActivity;
            const minutesSinceLastActivity = Math.floor(timeSinceLastActivity / 1000 / 60);

            if (minutesSinceLastActivity >= this.timeoutMinutes && !this.warningShown) {
                this.warningShown = true;
                this.showTimeoutWarning();
            }
        }, this.timeoutMinutes * 60 * 1000); // Converter minutos para milissegundos
    }

    showTimeoutWarning() {
        // Mostrar modal de aviso
        this.modal.show();
        
        // Fazer logout após mostrar o aviso
        const auth = firebase.auth();
        auth.signOut().then(() => {
            // Modal já está mostrando, usuário precisa clicar para ir para a página de login
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
        });
    }

    setupEventListeners() {
        // Lista de eventos para monitorar atividade do usuário
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
            'keydown',
            'load'
        ];

        // Adicionar listeners para cada evento
        events.forEach(event => {
            document.addEventListener(event, () => this.resetTimer());
        });
    }
}

// Inicializar o gerenciador de timeout quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.sessionTimeout = new SessionTimeout(30); // 30 minutos
});
