import axios from 'axios';


class AnythingLLM {
    constructor(apiKey, apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async ejecutarPrompt(prompt) {
        try {
            const response = await axios.post(`${this.apiUrl}/v1/prompts`, {
                prompt: prompt
            }, {
                headers: this.headers
            });
            console.log('Respuesta:', response.data);
        } catch (error) {
            console.error('Error al ejecutar el prompt:', error);
        }
    }

    async listarModelos() {
        try {
            const response = await axios.get(`${this.apiUrl}/v1/models`, {
                headers: this.headers
            });
            console.log('Modelos disponibles:', response.data);
        } catch (error) {
            console.error('Error al listar modelos:', error);
        }
    }

    async chatWithAnythingllm(ctx) {

        const apiKey = process.env.ANYTHINGLLM_API_KEY; // Reemplaza con tu clave API real
        const apiUrl = 'http://localhost:61575/api/v1/auth'; // Reemplaza con la URL real de la API
        
        const anythingLLM = new AnythingLLM(apiKey, apiUrl);
        
        // Ejecutar un ejemplo de prompt
        anythingLLM.ejecutarPrompt('Diez nombres divertidos para un pelícano mascota');
        
        // Listar modelos disponibles
        anythingLLM.listarModelos();
        }

}

export default AnythingLLM;
