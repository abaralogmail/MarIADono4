const HorarioManagerService = require('../services/HorarioManagerService');

// Ejemplo de uso del sistema de horarios polimórfico
async function ejemplosDeUso() {
  const horarioService = new HorarioManagerService('sqlite');

  // 1. Crear horario para un bot (Lunes a Viernes de 9:00 a 18:00)
  const horarioBot = await horarioService.crearHorarioBot(1, {
    nombre: 'Horario Atención Bot Principal',
    descripcion: 'Horario comercial estándar',
    reglas: [
      { diaSemana: 1, horaInicio: '09:00:00', horaFin: '18:00:00' }, // Lunes
      { diaSemana: 2, horaInicio: '09:00:00', horaFin: '18:00:00' }, // Martes
      { diaSemana: 3, horaInicio: '09:00:00', horaFin: '18:00:00' }, // Miércoles
      { diaSemana: 4, horaInicio: '09:00:00', horaFin: '18:00:00' }, // Jueves
      { diaSemana: 5, horaInicio: '09:00:00', horaFin: '18:00:00' }  // Viernes
    ]
  });

  // 2. Crear horario partido para otro bot (mañana y tarde)
  const horarioPartido = await horarioService.crearHorarioBot(2, {
    nombre: 'Horario Bot Sucursal',
    descripcion: 'Horario con descanso al mediodía',
    reglas: [
      { diaSemana: 1, horaInicio: '09:00:00', horaFin: '13:00:00' }, // Mañana
      { diaSemana: 1, horaInicio: '15:00:00', horaFin: '19:00:00' }, // Tarde
      { diaSemana: 2, horaInicio: '09:00:00', horaFin: '13:00:00' },
      { diaSemana: 2, horaInicio: '15:00:00', horaFin: '19:00:00' },
      { diaSemana: 3, horaInicio: '09:00:00', horaFin: '13:00:00' },
      { diaSemana: 3, horaInicio: '15:00:00', horaFin: '19:00:00' },
      { diaSemana: 4, horaInicio: '09:00:00', horaFin: '13:00:00' },
      { diaSemana: 4, horaInicio: '15:00:00', horaFin: '19:00:00' },
      { diaSemana: 5, horaInicio: '09:00:00', horaFin: '13:00:00' },
      { diaSemana: 5, horaInicio: '15:00:00', horaFin: '19:00:00' },
      { diaSemana: 6, horaInicio: '09:00:00', horaFin: '14:00:00' }  // Sábado medio día
    ]
  });

  // 3. Crear ventana de envío para campañas (solo horarios específicos)
  const horarioCampaña = await horarioService.crearHorarioCampaña(101, {
    nombre: 'Ventana Envío Promociones',
    descripcion: 'Envío de promociones en horarios de alta actividad',
    reglas: [
      { diaSemana: 1, horaInicio: '10:00:00', horaFin: '12:00:00' }, // Lunes mañana
      { diaSemana: 1, horaInicio: '16:00:00', horaFin: '18:00:00' }, // Lunes tarde
      { diaSemana: 2, horaInicio: '10:00:00', horaFin: '12:00:00' },
      { diaSemana: 2, horaInicio: '16:00:00', horaFin: '18:00:00' },
      { diaSemana: 3, horaInicio: '10:00:00', horaFin: '12:00:00' },
      { diaSemana: 3, horaInicio: '16:00:00', horaFin: '18:00:00' },
      { diaSemana: 4, horaInicio: '10:00:00', horaFin: '12:00:00' },
      { diaSemana: 4, horaInicio: '16:00:00', horaFin: '18:00:00' },
      { diaSemana: 5, horaInicio: '10:00:00', horaFin: '12:00:00' },
      { diaSemana: 5, horaInicio: '16:00:00', horaFin: '18:00:00' }
    ]
  });

  // 4. Crear excepciones para feriados
  await horarioService.crearExcepcionTemporal('Bot', 1, '2025-01-01', 'cerrado', 'Año Nuevo');
  await horarioService.crearExcepcionTemporal('Bot', 1, '2025-12-25', 'cerrado', 'Navidad');
  
  // Excepción con horario personalizado
  await horarioService.crearExcepcionTemporal('Bot', 2, '2025-07-09', 'horario_personalizado', 'Día de la Independencia - horario reducido');

  // 5. Ejemplos de verificación
  console.log('=== EJEMPLOS DE VERIFICACIÓN ===');
  
  // Verificar si el bot está activo ahora
  const botActivo = await horarioService.botEstaActivo(1);
  console.log('Bot 1 activo ahora:', botActivo);
  
  // Verificar en fecha específica
  const fechaEspecifica = new Date('2025-09-02T10:30:00');
  const botActivoFecha = await horarioService.botEstaActivo(1, fechaEspecifica);
  console.log('Bot 1 activo el 02/09/2025 a las 10:30:', botActivoFecha);
  
  // Verificar campaña
  const puedeEnviar = await horarioService.puedeEnviarCampaña(101);
  console.log('Puede enviar campaña 101 ahora:', puedeEnviar);
  
  // Obtener horario completo
  const horarioCompleto = await horarioService.obtenerHorario('Bot', 1);
  console.log('Horario completo Bot 1:', JSON.stringify(horarioCompleto, null, 2));

  return {
    horarioBot,
    horarioPartido, 
    horarioCampaña
  };
}

// Ejemplo de integración en flujos de WhatsApp
async function integrarConFlows() {
  const horarioService = new HorarioManagerService();
  
  // Función para usar en flows de WhatsApp
  const verificarHorarioAtencion = async (ctx, { flowDynamic, endFlow }) => {
    const botActivo = await horarioService.botEstaActivo(1);
    
    if (!botActivo) {
      const horario = await horarioService.obtenerHorario('Bot', 1);
      return await endFlow([
        '🤖 Fuera del horario de atención',
        '',
        '🕐 Nuestro horario es:',
        'Lunes a Viernes: 9:00 a 18:00 hs',
        '', 
        '📝 Deja tu consulta y te responderemos en el próximo horario hábil.'
      ]);
    }
    
    return await flowDynamic(['¡Hola! Te atiendo ahora mismo 😊']);
  };

  // Función para verificar antes de enviar campañas
  const puedeEnviarCampañaMasiva = async (campaignId) => {
    return await horarioService.puedeEnviarCampaña(campaignId);
  };

  return {
    verificarHorarioAtencion,
    puedeEnviarCampañaMasiva
  };
}

// Casos de uso avanzados
async function casosAvanzados() {
  const horarioService = new HorarioManagerService();

  // 1. Múltiples bots con horarios diferentes
  const configuraciones = [
    {
      botId: 10,
      nombre: 'Bot Ventas',
      reglas: [
        { diaSemana: 1, horaInicio: '08:00:00', horaFin: '20:00:00' },
        { diaSemana: 2, horaInicio: '08:00:00', horaFin: '20:00:00' },
        { diaSemana: 3, horaInicio: '08:00:00', horaFin: '20:00:00' },
        { diaSemana: 4, horaInicio: '08:00:00', horaFin: '20:00:00' },
        { diaSemana: 5, horaInicio: '08:00:00', horaFin: '20:00:00' },
        { diaSemana: 6, horaInicio: '10:00:00', horaFin: '16:00:00' }
      ]
    },
    {
      botId: 11,
      nombre: 'Bot Soporte Técnico',
      reglas: [
        { diaSemana: 1, horaInicio: '09:00:00', horaFin: '18:00:00' },
        { diaSemana: 2, horaInicio: '09:00:00', horaFin: '18:00:00' },
        { diaSemana: 3, horaInicio: '09:00:00', horaFin: '18:00:00' },
        { diaSemana: 4, horaInicio: '09:00:00', horaFin: '18:00:00' },
        { diaSemana: 5, horaInicio: '09:00:00', horaFin: '18:00:00' }
      ]
    }
  ];

  for (const config of configuraciones) {
    await horarioService.crearHorarioBot(config.botId, config);
  }

  // 2. Diferentes tipos de campañas
  const campanias = [
    {
      id: 200,
      tipo: 'Promocionales',
      ventanas: [
        { diaSemana: 2, horaInicio: '10:00:00', horaFin: '11:00:00' }, // Martes
        { diaSemana: 4, horaInicio: '15:00:00', horaFin: '16:00:00' }  // Jueves
      ]
    },
    {
      id: 201,
      tipo: 'Recordatorios',
      ventanas: [
        { diaSemana: 1, horaInicio: '09:00:00', horaFin: '10:00:00' }, // Lunes
        { diaSemana: 3, horaInicio: '14:00:00', horaFin: '15:00:00' }, // Miércoles
        { diaSemana: 5, horaInicio: '11:00:00', horaFin: '12:00:00' }  // Viernes
      ]
    }
  ];

  for (const campania of campanias) {
    await horarioService.crearHorarioCampaña(campania.id, {
      nombre: `Ventana ${campania.tipo}`,
      reglas: campania.ventanas
    });
  }

  // Verificar estado de todos los bots
  const estadoBots = {};
  for (const config of configuraciones) {
    estadoBots[config.botId] = await horarioService.botEstaActivo(config.botId);
  }

  return {
    estadoBots,
    configuraciones,
    campanias
  };
}

module.exports = {
  ejemplosDeUso,
  integrarConFlows,
  casosAvanzados
};
