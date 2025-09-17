const {Swarm} = require("openai-swarm-node");
/*
// Define two agents
const agentA = new Agent({
    name: "Agent A",
    instructions: "You are a helpful agent.",
    tools: [
        {
            name: 'transferToAgentB',
            fn: () => agentB,
        },
    ],
});

const agentB = new Agent({
    name: "Agent B",
    instructions: "Only speak in Haikus.",
});*/

const client = new Swarm(process.env.OPENAI_API_KEY);
