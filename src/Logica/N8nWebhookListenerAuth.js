import axios from 'axios';

class N8nWebhookListener {
    constructor(n8nWebhookUrl, username, password) {
      this.n8nWebhookUrl = n8nWebhookUrl;
      this.username = username;
      this.password = password;
    }
  
    async sendWebhook(data) {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}` // Basic Auth
      };    
      try {
        console.log('Sending webhook data:', data);
        
        const result = await axios.post(this.n8nWebhookUrl, 
          {
            data: data,
            timestamp: new Date().toISOString()
          },
          { 
            headers,
            timeout: 200000 
          }
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to ensure response
        console.log('Webhook response:', result.data);
        return result.data;
      } catch (error) {
        console.error('Full error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    }
}
export default N8nWebhookListener;
