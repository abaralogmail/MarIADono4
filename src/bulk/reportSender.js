const { getAdmin } = require('../../src/utils/isAdmin');

class 
ReportSender {
    constructor(provider) {
        this.provider = provider;
    }

    async sendReportToAdmins(reporte) {
        const adminNumbers = getAdmin();
        if (!adminNumbers || adminNumbers.length === 0) {
            console.warn("No admin numbers configured to send report.");
            return;
        }

        const reportMessage = `*Reporte de Envío Masivo (${new Date().toLocaleDateString()})*\n\n` +
                              `*Bot:* ${this.provider.globalVendorArgs.name}\n\n` +
                              `*Teléfonos por intentar enviar:* ${reporte.attempted.length > 0 ? reporte.attempted.join(', ') : 'Ninguno'}\n\n` +
                              `*Teléfonos enviados con éxito:* ${reporte.sent.length > 0 ? reporte.sent.join(', ') : 'Ninguno'}\n\n` +
                              `*Teléfonos con error de envío:* ${reporte.failed.length > 0 ? reporte.failed.join(', ') : 'Ninguno'}\n\n` +
                              `*Total intentado:* ${reporte.attempted.length}\n` +
                              `*Total enviado:* ${reporte.sent.length}\n` +
                              `*Total fallido:* ${reporte.failed.length}`;


        for (const adminNumber of adminNumbers) {
            try {
                // Ensure the number is in the correct format for sending
                const recipient = `${adminNumber}@c.us`;
                await this.provider.sendText(recipient, reportMessage);
                console.log(`Bulk message report sent to admin: ${recipient}`);
            } catch (error) {
                console.error(`Error sending bulk message report to admin ${adminNumber}:`, error);
            }
        }
    }
}

module.exports = ReportSender;
