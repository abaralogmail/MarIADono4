const { addKeyword } = require('@bot-whatsapp/bot');
const HorarioManagerService = require('../services/HorarioManagerService');

// Define la constante para el tipo de horario masivo
const TIPO_HORARIO_BULK = 2; // Asume que el ID 2 corresponde al tipo 'bulk'
const TIPO_HORARIO_AUTO = 1; // Asume que el ID 1 corresponde al tipo 'Auto'


// Configuración completa para un nuevo horario de prueba.
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
        {
            fechaExcepcion: "2025-12-25", // Navidad
            estado: "cerrado",
            descripcion: "Cerrado por Navidad",
        },
        {
            fechaExcepcion: "2025-12-31", // Fin de año
            estado: "horario_personalizado",
            horaInicio: "09:00:00",
            horaFin: "12:00:00",
            descripcion: "Horario especial de fin de año",
        },
    ],
};

// Configuración para horarios de envío de mensajes masivos
const configuracionHorarioBulk = {
    nombre: "Horario de envíos masivos",
    descripcion: "Horario para envíos masivos de mensajes, creado desde flowTest.",
    tipoHorario_id: TIPO_HORARIO_BULK,
    zonaHoraria: "America/Argentina/Buenos_Aires",
    activo: true,

    reglas: [
        { diaSemana: 1, horaInicio: "10:00:00", horaFin: "20:00:00", activo: true }, // Lunes
        { diaSemana: 2, horaInicio: "10:00:00", horaFin: "20:00:00", activo: true }, // Martes
        { diaSemana: 3, horaInicio: "10:00:00", horaFin: "20:00:00", activo: true }, // Miércoles
        { diaSemana: 4, horaInicio: "10:00:00", horaFin: "20:00:00", activo: true }, // Jueves
        { diaSemana: 5, horaInicio: "10:00:00", horaFin: "20:00:00", activo: true }, // Viernes
        { diaSemana: 6, horaInicio: "10:00:00", horaFin: "18:00:00", activo: true }, // Sábado
        { diaSemana: 0, horaInicio: "00:00:00", horaFin: "00:00:00", activo: false }, // Domingo (inactivo)
    ],

    excepciones: [
        // Puedes agregar excepciones si es necesario
    ],
};

/**
 * Este flujo se activa con la palabra clave 't1' o 't2' y utiliza
 * el HorarioManagerService para crear los horarios respectivos.
 */
const flowTest = addKeyword(['t1', 't2'])
    .addAction(async (ctx, { provider, flowDynamic, endFlow }) => {
        const horarioService = new HorarioManagerService();
        const botName = provider.globalVendorArgs.name || "BotTest";
        let configuracionHorario;

        try {
            if (ctx.body === 't1') {
                configuracionHorario = configuracionHorarioAuto; // Usar configuración automática
                console.log(`Iniciando creación de horario automático para el bot: ${botName}...`);
                await flowDynamic(` Creando horario automático para *${botName}*, por favor espera...`);
            } else if (ctx.body === 't2') {
                configuracionHorario = configuracionHorarioBulk; // Usar configuración bulk
                console.log(`Iniciando creación de horario bulk para el bot: ${botName}...`);
                await flowDynamic(` Creando horario bulk para *${botName}*, por favor espera...`);
            }

            const nuevoHorario = await horarioService.crearHorarioBot(
                botName,
                configuracionHorario
            );

            if (nuevoHorario) {
                console.log("Horario creado exitosamente:", nuevoHorario);
                await flowDynamic("✅ Horario creado exitosamente.");
            } else {
                throw new Error("El servicio no devolvió un nuevo horario.");
            }

        } catch (error) {
            console.error("Error al crear el horario:", error);
            await flowDynamic(`❌ Ocurrió un error: ${error.message}`);
        } finally {
            return endFlow();
        }
    });

module.exports = flowTest;