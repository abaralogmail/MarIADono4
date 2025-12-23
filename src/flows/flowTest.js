const { addKeyword } = require('@builderbot/bot');
const HorarioManagerService = require('../services/HorarioManagerService');
const MessageStatusChecker = require('../bulk/MessageStatusChecker');

// Define the constants for the schedule types
const TIPO_HORARIO_BULK = 2; // Assume ID 2 corresponds to 'bulk'
const TIPO_HORARIO_AUTO = 1; // Assume ID 1 corresponds to 'Auto'

// Configuration for an automatic schedule
const configuracionHorarioAuto = {
    nombre: "Horario de atencion automatica",
    descripcion: "Horario de lunes a viernes de 9 a 20h y sábados de 9 a 13h, creado desde flowTest.",
    tipoHorario_id: TIPO_HORARIO_AUTO, 
    zonaHoraria: "America/Argentina/Buenos_Aires",
    activo: true,
    reglas: [
        { diaSemana: 1, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Lunes
        { diaSemana: 2, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Martes
        { diaSemana: 3, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Miércoles
        { diaSemana: 4, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Jueves
        { diaSemana: 5, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Viernes
        { diaSemana: 6, horaInicio: "09:00:00", horaFin: "13:00:00", activo: true }, // Sábado
        { diaSemana: 0, horaInicio: "00:00:00", horaFin: "00:00:00", activo: false }, // Domingo (inactivo)
    ],
    excepciones: [
        { fechaExcepcion: "2025-12-25", estado: "cerrado", descripcion: "Cerrado por Navidad" },
        { fechaExcepcion: "2025-12-31", estado: "horario_personalizado", horaInicio: "09:00:00", horaFin: "12:00:00", descripcion: "Horario especial de fin de año" },
    ],
};

// Configuration for bulk message schedules
const configuracionHorarioBulk = {
    nombre: "Horario de envíos masivos",
    descripcion: "Horario para envíos masivos de mensajes, creado desde flowTest.",
    tipoHorario_id: TIPO_HORARIO_BULK,
    zonaHoraria: "America/Argentina/Buenos_Aires",
    activo: true,
    reglas: [
        { diaSemana: 1, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Lunes
        { diaSemana: 2, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Martes
        { diaSemana: 3, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Miércoles
        { diaSemana: 4, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Jueves
        { diaSemana: 5, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Viernes
        { diaSemana: 6, horaInicio: "09:00:00", horaFin: "18:00:00", activo: true }, // Sábado
        { diaSemana: 0, horaInicio: "00:00:00", horaFin: "00:00:00", activo: false }, // Domingo (inactivo)
    ],
    excepciones: [],
};

// Function to handle message status checking logic
async function handleMessageStatusCheck(provider, flowDynamic) {
    try {
        const messageStatusChecker = new MessageStatusChecker(provider);
        const statuses = await messageStatusChecker.getAllMessageStatusesHoy();
        //const statuses = await messageStatusChecker.mensajesBulkEnviadosEstaSemana();

        if (!statuses) {
            throw new Error('No message statuses were retrieved');
        }

        console.log("Message statuses retrieved:", statuses);
        await flowDynamic(`Here are today's message statuses: ${JSON.stringify(statuses, null, 2)}`);
    } catch (error) {
        console.error("Error checking message statuses:", error);
        const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error occurred');
        await flowDynamic(`❌ Error checking message statuses: ${errorMessage}`);
    }
}

// Define the flow for handling various keywords
const flowTest = addKeyword(['t1', 't2', 'status'])
    .addAction(async (ctx, { provider, flowDynamic, endFlow }) => {
        const horarioService = new HorarioManagerService();
        const botName = provider.globalVendorArgs.name || "BotTest";
        let configuracionHorario;

        try {
            if (ctx.body === 't1') {
                configuracionHorario = configuracionHorarioAuto; // Use automatic schedule config
                await flowDynamic(`Creating automatic schedule for *${botName}*, please wait...`);
                const nuevoHorario = await horarioService.crearHorarioBot(botName, configuracionHorario);
                if (nuevoHorario) {
                    await flowDynamic("✅ Schedule created successfully.");
                }
            } else if (ctx.body === 't2') {
                configuracionHorario = configuracionHorarioBulk; // Use bulk schedule config
                await flowDynamic(`Creating bulk schedule for *${botName}*, please wait...`);
                const nuevoHorario = await horarioService.crearHorarioBot(botName, configuracionHorario);
                if (nuevoHorario) {
                    await flowDynamic("✅ Schedule created successfully.");
                }
            } else if (ctx.body === 'status') {
                await handleMessageStatusCheck(provider, flowDynamic);
            }
        } catch (error) {
            console.error("Error occurred:", error);
            await flowDynamic(`❌ An error occurred: ${error?.message ?? error}`);
        } finally {
            return endFlow();
        }
    });

module.exports = flowTest;