// src/database/seeders/horariosSeeder.js
const SqliteManager = require('../SqliteManager');

async function seedHorarios() {
  const dbManager = await SqliteManager.getInstance();
  const { Horarios, ReglasHorario, ExcepcionesHorario } = dbManager.models;

  try {
    // Verificar si ya existen horarios para no duplicar datos
    const count = await Horarios.count();
    if (count > 0) {
      console.log('✅ Los datos de horarios ya existen, omitiendo el sembrado.');
      return;
    }

    console.log('🌱 Sembrando datos de horarios comerciales...');

    // 1. Horario Comercial Estándar (para un Bot o Sucursal)
    const horarioComercial = await Horarios.create({
      nombre: 'Horario Comercial Principal',
      descripcion: 'Lunes a Viernes de 9 a 18hs, Sábados de 9 a 13hs.',
      schedulableId: 1,
      schedulableType: 'Bot', // Puede ser 'Bot', 'Sucursal', etc.
      zonaHoraria: 'America/Argentina/Buenos_Aires',
      activo: true
    });

    // Reglas para Lunes a Viernes
    for (let i = 1; i <= 5; i++) {
      await ReglasHorario.create({
        horarioId: horarioComercial.id,
        diaSemana: i, // 1: Lunes, ..., 5: Viernes
        horaInicio: '08:00:00',
        horaFin: '19:00:00',
        activo: true
      });
    }

    // Regla para Sábado
    await ReglasHorario.create({
      horarioId: horarioComercial.id,
      diaSemana: 6, // 6: Sábado
      horaInicio: '09:00:00',
      horaFin: '13:00:00',
      activo: true
    });

    // Excepciones para feriados
    const anioActual = new Date().getFullYear();
    await ExcepcionesHorario.create({
      horarioId: horarioComercial.id,
      fechaExcepcion: `${anioActual}-12-25`,
      estado: 'cerrado',
      descripcion: 'Navidad'
    });

    await ExcepcionesHorario.create({
      horarioId: horarioComercial.id,
      fechaExcepcion: `${anioActual + 1}-01-01`,
      estado: 'cerrado',
      descripcion: 'Año Nuevo'
    });

    console.log('👍 Datos de horarios comerciales sembrados exitosamente.');
  } catch (error) {
    console.error('❌ Error al sembrar los datos de horarios:', error);
    throw error; // Relanzamos el error para que el script principal lo capture
  }
}

module.exports = { seedHorarios };