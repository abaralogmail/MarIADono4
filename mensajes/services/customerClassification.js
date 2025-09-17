const OllamaFunnelClassifier = require('../OllamaFunnelClassifier');
const { getClientHistory } = require('../../src/utils/clientHistoryFromExcel');


async function classifyCustomer(ctx) {
    const classifier = new OllamaFunnelClassifier(getClientHistory);
    const funnelStage = await classifier.classifyCustomer(ctx);
    console.log(`[CLASSIFIER]:`, funnelStage);
    ctx.etapaEmbudo = funnelStage;
}

module.exports = { classifyCustomer };
