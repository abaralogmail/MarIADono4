const { LLMChain } = require("langchain/chains");
const { PromptTemplate } = require("@langchain/core/prompts");
const { Ollama } = require("@langchain/ollama");
const { getClientHistory } = require('../src/utils/clientHistoryFromExcel');



class OllamaFunnelClassifier {
  constructor() {
    // No LLM initialization in constructor
  }

  initializeLLM(model) {
    return new Ollama({
      baseUrl: "http://localhost:11434",
      verbose: false,
      model: model,
    });
  }

  initializeChain() {
    const template = `
    Eres un experto en embudos de ventas. Analiza la siguiente conversación y determina la etapa del cliente en el embudo de ventas.
    Responde con un solo número del 1 al 5, donde:
    1 = Conciencia
    2 = Interés
    3 = Consideración
    4 = Intención/Evaluación
    5 = Compra

    Conversación:
    {conversation}

    Etapa del embudo de ventas (1-5):`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ["conversation"],
    });

    return new LLMChain({ llm: this.llmClassify, prompt: prompt });
  }

  initializeSummaryChain() {
    const summaryTemplate = `
      Resuma el siguiente texto, eliminando cualquier contenido no informativo, agrega emojis y no aclares la respuesta:

      {text}

      Síntesis concisa:`;

    const summaryPrompt = new PromptTemplate({
      template: summaryTemplate,
      inputVariables: ["text"],
    });

    return new LLMChain({ llm: this.llmSummarize, prompt: summaryPrompt });
  }

  async imageToText(imageBase64) {
    //const llavaLLM = this.initializeLLM("llava:13b");
    const llavaLLM = this.initializeLLM("llama3.2-vision:11b");
    
  
    const prompt = "Solo el texto:";
  
    try {
      const response = await llavaLLM.call(prompt, {
        images: [imageBase64],
      });
  
      return response.trim();
    } catch (error) {
      console.error("Error in imageToText:", error);
      return "Unable to process the image.";
    }
  }
  
  async classifyCustomer(ctx) {
    const llmClassify = this.initializeLLM("Llama3.2");
    const template = `
    Eres un experto en embudos de ventas. Analiza la siguiente conversación y determina la etapa del cliente en el embudo de ventas.
    Responde con un solo número del 1 al 5, donde:
    1 = Conciencia
    2 = Interés
    3 = Consideración
    4 = Intención/Evaluación
    5 = Compra

    Conversación:
    {conversation}

    Etapa del embudo de ventas (1-5):`;

    const prompt = new PromptTemplate({
        template: template,
        inputVariables: ["conversation"]
    });

    const chain = new LLMChain({ 
        llm: llmClassify, 
        prompt: prompt,
        verbose: false 
    });

    const clientHistory = await getClientHistory(ctx.from);
    const conversationContext = clientHistory.map(msg => `${msg.role}: ${msg.message}`).join('\n');
    const result = await chain.call({ conversation: conversationContext });
    return result;
}


  async summarizeText(text) {
    const llmSummarize = this.initializeLLM("Llama3.2");
    const summaryTemplate = `
      Resuma el siguiente texto, eliminando cualquier contenido no informativo, agrega emojis y no aclares la respuesta:
  
      {text}
  
      Síntesis concisa:`;
  
    const summaryPrompt = new PromptTemplate({
      template: summaryTemplate,
      inputVariables: ["text"],
    });
  
    const summaryChain = new LLMChain({ 
      llm: llmSummarize, 
      prompt: summaryPrompt,
      verbose: false // Add this for debugging if needed
    });
  
    const result = await summaryChain.call({ text });
    return result.text.trim();
  }
  
  
  async processCustomPromptNum(promptTemplate, text) {
    const llmCustom = this.initializeLLM("llama3.2");
    const prompt = new PromptTemplate({
      template: promptTemplate,
      inputVariables: ["text"],
    });
    const chain = new LLMChain({ llm: llmCustom, prompt: prompt });
    const result = await chain.call({ text });
    const numericResult = parseFloat(result.text.trim());
    return isNaN(numericResult) ? 0 : numericResult;
  }

  async processCustomPrompt(promptTemplate, text) {
    const llmCustom = this.initializeLLM("llama3.2"); // Initialize LLM here
    
    const prompt = new PromptTemplate({
      template: promptTemplate,
      inputVariables: ["text"],
    });
  
    const chain = new LLMChain({ 
      llm: llmCustom, // Use the initialized LLM
      prompt: prompt 
    });
    
    const result = await chain.call({ text });
    return result;
}


  async agregarEmojiText(text) {
    const promptTemplate = `
     agregar emojis, no aclares nada:{text}

      Texto con emojis:
    `;

    const prompt = new PromptTemplate({
      template: promptTemplate,
      inputVariables: ["text"],
    });

    const chain = new LLMChain({ llm: this.llmCustom, prompt: prompt });
    const result = await chain.call({ text });

    return result.text.trim();
  }
}

module.exports = OllamaFunnelClassifier;

