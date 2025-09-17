const { addKeyword } = require('@bot-whatsapp/bot');
const HorarioManagerService = require('../services/HorarioManagerService');

/**
 * Configuración completa para un nuevo horario de prueba.
 * Este objeto define el horario, sus reglas semanales y excepciones.
 */
const configuracionHorario = {
    nombre: "Horario de atencion automatica",
    descripcion: "Horario de lunes a viernes de 9 a 20h y sábados de 9 a 13h, creado desde flowTest.",
    tipoHorario_id: 1, // ID para tipo 'bot'
    zonaHoraria: "America/Argentina/Buenos_Aires",
    activo: true,

    // Reglas para los días de la semana
    reglas: [
        { diaSemana: 1, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Lunes
        { diaSemana: 2, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Martes
        { diaSemana: 3, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Miércoles
        { diaSemana: 4, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Jueves
        { diaSemana: 5, horaInicio: "09:00:00", horaFin: "20:00:00", activo: true }, // Viernes
        { diaSemana: 6, horaInicio: "09:00:00", horaFin: "13:00:00", activo: true }, // Sábado
        { diaSemana: 0, horaInicio: "00:00:00", horaFin: "00:00:00", activo: false }, // Domingo (inactivo)
    ],

    // Excepciones para fechas específicas
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

/**
 * Este flujo de prueba se activa con la palabra clave 't1' y utiliza
 * el HorarioManagerService para crear un horario completo con sus reglas y excepciones.
 * Es la forma recomendada de interactuar con el módulo de horarios.
 */
const flowTest = addKeyword(['t1'])
    .addAction(async (ctx, { provider, flowDynamic, endFlow }) => {
        const horarioService = new HorarioManagerService();
        const botName = provider.globalVendorArgs.name || "BotTest"; // Usar nombre del provider o uno por defecto

        try {
            console.log(`Iniciando creación de horario de Respuestas automaticas para el bot: ${botName}...`);
            await flowDynamic(` Creando horario de Respuestas automaticas para *${botName}*, por favor espera...`);

            // Usamos el servicio para crear el horario, pasándole el nombre del bot y la configuración
            const nuevoHorario = await horarioService.crearHorarioBot(
                botName,
                configuracionHorario
            );

            if (nuevoHorario) {
                console.log("Horario de Respuestas automaticas creado exitosamente:", nuevoHorario);
                await flowDynamic("✅ Horario de de Respuestas automaticas creado exitosamente.");
            } else {
                // Esto no debería ocurrir si el servicio funciona como se espera
                throw new Error("El servicio no devolvió un nuevo horario.");
            }

        } catch (error) {
            console.error("Error al crear el horario de prueba:", error);
            await flowDynamic(`❌ Ocurrió un error: ${error.message}`);
        } finally {
            return endFlow();
        }
    });

module.exports = flowTest;
