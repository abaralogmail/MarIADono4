const { OpenAI } = require('openai');

class SalesFunnelClassifier {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "http://localhost:1234/v1",
      apiKey: "lm-studio"
    });
  }

  async classifyCustomer(conversationContext) {
    const response = await this.openai.chat.completions.create({
//      model: "gpt-3.5-turbo", // Adjust this to match your local model
      model:"lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF",
      messages: [
        { role: "system", content: "Eres un clasificador de embudos de ventas. Clasifica al cliente en una de estas etapas: Conciencia, Interés, Consideración, Intención, Evaluación, Compra." },
        { role: "user", content: `Basado en esta conversación, clasifica la etapa del cliente en el embudo de ventas:: ${conversationContext}` }
      ],
    });

    return response.choices[0].message.content;
  }
}

module.exports = SalesFunnelClassifier;
