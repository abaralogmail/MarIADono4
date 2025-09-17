const express = require('express');
const router = express.Router();
const HorarioManagerService = require('../services/HorarioManagerService');

// Instancia del servicio
const getHorarioService = () => new HorarioManagerService('sqlite');

/**
 * GET /api/schedules
 * Obtiene todos los horarios de todos los bots.
 */
router.get('/', async (req, res) => {
    try {
        const horarioService = getHorarioService();
        await horarioService.initialize();
        const horarios = await horarioService.db.models.Horarios.findAll({
            where: { schedulableType: 'Bot' },
            include: ['reglas', 'excepciones']
        });
        res.json(horarios);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Error al obtener los horarios', error: error.message });
    }
});

/**
 * GET /api/schedules/:botId
 * Obtiene el horario completo de un bot específico.
 */
router.get('/:botId', async (req, res) => {
    try {
        const { botId } = req.params;
        const horarioService = getHorarioService();
        const horario = await horarioService.obtenerHorario('Bot', botId);
        if (horario) {
            res.json(horario);
        } else {
            res.status(404).json({ message: `No se encontró horario para el Bot ID: ${botId}` });
        }
    } catch (error) {
        console.error(`Error fetching schedule for bot ${req.params.botId}:`, error);
        res.status(500).json({ message: 'Error al obtener el horario del bot', error: error.message });
    }
});

/**
 * POST /api/schedules
 * Crea o actualiza un horario completo para un bot.
 */
router.post('/', async (req, res) => {
    try {
        const { botId, nombre, descripcion, reglas, excepciones } = req.body;

        if (!botId || !nombre) {
            return res.status(400).json({ message: 'botId y nombre son requeridos.' });
        }

        const horarioService = getHorarioService();
        await horarioService.initialize();

        // Buscar si ya existe un horario para este bot
        let horario = await horarioService.obtenerHorario('Bot', botId);

        if (horario) {
            // Si existe, lo borramos para crearlo de nuevo con las nuevas reglas.
            // Una estrategia más avanzada sería actualizar campo por campo.
            await horarioService.db.models.ExcepcionesHorario.destroy({ where: { horarioId: horario.id } });
            await horarioService.db.models.ReglasHorario.destroy({ where: { horarioId: horario.id } });
            await horarioService.db.models.Horarios.destroy({ where: { id: horario.id } });
        }

        // Crear el nuevo horario con sus reglas y excepciones
        const nuevoHorario = await horarioService.crearHorarioBot(botId, {
            nombre,
            descripcion,
            reglas: reglas || [],
            excepciones: excepciones || []
        });

        res.status(201).json(nuevoHorario);
    } catch (error) {
        console.error('Error creating/updating schedule:', error);
        res.status(500).json({ message: 'Error al crear o actualizar el horario', error: error.message });
    }
});

/**
 * DELETE /api/schedules/:horarioId
 * Elimina un horario y todas sus reglas y excepciones asociadas.
 */
router.delete('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;
        const horarioService = getHorarioService();
        await horarioService.initialize();

        // Eliminar en cascada (manual)
        await horarioService.db.models.ExcepcionesHorario.destroy({ where: { horarioId } });
        await horarioService.db.models.ReglasHorario.destroy({ where: { horarioId } });
        const deletedCount = await horarioService.db.models.Horarios.destroy({ where: { id: horarioId } });

        if (deletedCount > 0) {
            res.status(200).json({ message: 'Horario eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'No se encontró el horario para eliminar.' });
        }
    } catch (error) {
        console.error(`Error deleting schedule ${req.params.horarioId}:`, error);
        res.status(500).json({ message: 'Error al eliminar el horario', error: error.message });
    }
});

module.exports = router;