import SqliteManager from '../database/SqliteManager.js';
//const PostgreSQLManager = require('../database/PostgreSQLManager');

class HorarioManagerService {
  constructor(databaseType = 'sqlite') { // Default to sqlite
    this.databaseType = databaseType;
    this.db = null;
  }

  async initialize() {
    if (this.databaseType === 'postgresql') {
      this.db = await PostgreSQLManager.getInstance();
    } else {
      this.db = await SqliteManager.getInstance();
    }
  }

  // Crear un horario completo con reglas
  async crearHorarioBot(botName, configuracion) {
  await this.initialize();

  const horario = await this.db.crearHorario({
    nombre: configuracion.nombre || `Horario Bot ${botName}`,
    descripcion: configuracion.descripcion || 'Horario de atención del bot',
    botName, // Use botName directly
    tipoHorario_id: configuracion.tipoHorario_id,
    zonaHoraria: configuracion.zonaHoraria || 'America/Argentina/Buenos_Aires'
  });

    // Crear reglas de horario
    for (const regla of configuracion.reglas) {
      await this.db.crearReglaHorario({
        horarioId: horario.horarioId || horario.horario_id,
        diaSemana: regla.diaSemana, // 0=Domingo, 1=Lunes, ..., 6=Sábado
        horaInicio: regla.horaInicio,
        horaFin: regla.horaFin
      });
    }

    // Crear excepciones si existen
    if (configuracion.excepciones) {
      for (const excepcion of configuracion.excepciones) {
        await this.db.crearExcepcionHorario({
          horarioId: horario.horarioId || horario.horario_id,
          fechaExcepcion: excepcion.fechaExcepcion,
          estado: excepcion.estado,
          horaInicio: excepcion.horaInicio,
          horaFin: excepcion.horaFin,
          descripcion: excepcion.descripcion
        });
      }
    }

    return horario;
  }

  // Crear horario para campañas
  async crearHorarioCampaña(campaignId, configuracion) {
    await this.initialize();

    const horario = await this.db.crearHorario({
      nombre: configuracion.nombre || `Ventana de envío - Campaña ${campaignId}`,
      descripcion: configuracion.descripcion || 'Ventana de tiempo para envío de campaña',
      schedulableId: campaignId,
      schedulableType: 'Campaign',
      zonaHoraria: configuracion.zonaHoraria || 'America/Argentina/Buenos_Aires'
    });

    for (const regla of configuracion.reglas) {
      await this.db.crearReglaHorario({
        horarioId: horario.id,
        diaSemana: regla.diaSemana,
        horaInicio: regla.horaInicio,
        horaFin: regla.horaFin
      });
    }

    return horario;
  }

  // Verificar si el bot debe estar activo ahora
  async botEstaActivo(tipo_horario_id, bot_name, fechaHora = new Date()) {
    if (bot_name === null || typeof bot_name === 'undefined') {
      console.warn(`⚠️ [botEstaActivo] Se recibió un bot_name inválido (${bot_name}) para tipo_horario_id: ${tipo_horario_id}. Se retorna false.`);
      return false;
    }
    await this.initialize();
    return await this.db.verificarDisponibilidad(tipo_horario_id, bot_name, fechaHora);
  }

  // Verificar si se puede enviar campaña ahora
  async puedeEnviarCampaña(campaignId, fechaHora = new Date()) {
    if (campaignId === null || typeof campaignId === 'undefined') {
      console.warn(`⚠️ [puedeEnviarCampaña] Se recibió un campaignId inválido (${campaignId}). Se retorna false.`);
      return false;
    }
    await this.initialize();
    return await this.db.verificarDisponibilidad('campaign', campaignId, fechaHora);
  }

  // Verificar si un bot está dentro de su horario de atención
  async verificarHorarioBot(tipo_horario_id, bot_name, fechaHora = new Date()) {
    if (bot_name === null || typeof bot_name === 'undefined') {
      console.warn(`⚠️ [verificarHorarioBot] Se recibió un bot_name inválido (${bot_name}) para tipo_horario_id: ${tipo_horario_id}. Se retorna false.`);
      return false;
    }
    await this.initialize();
    return await this.db.verificarDisponibilidad(tipo_horario_id, bot_name, fechaHora);
  }

  // Obtener horario completo con reglas y excepciones
  async obtenerHorario(schedulableType, schedulableId) {
    await this.initialize();
    return await this.db.obtenerHorarioCompleto(schedulableType, schedulableId);
  }

  // Crear excepción temporal (ej: cerrar bot por mantenimiento)
  async crearExcepcionTemporal(schedulableType, schedulableId, fecha, estado = 'cerrado', descripcion = '') {
    await this.initialize();
    
    const horario = await this.obtenerHorario(schedulableType, schedulableId);
    if (!horario) {
      throw new Error('No se encontró horario para esta entidad');
    }

    return await this.db.crearExcepcionHorario({
      horarioId: horario.id,
      fechaExcepcion: fecha,
      estado,
      descripcion
    });
  }
}

export default HorarioManagerService;
