import express from 'express';
const router = express.Router();
import SqliteManager from '../database/SqliteManager.js';

// Helper to get database models
async function getDbModels() {
    const db = await SqliteManager.getInstance();
    return db.models;
}

// --- Utilidad: listar bots (botName) ---
router.get('/bots', async (req, res) => {
    try {
        const models = await getDbModels();
        const horarios = await models.Horarios.findAll({ attributes: ['botName'], raw: true });
        const botNames = [...new Set(horarios.map(h => h.botName))];
        res.json(botNames);
    } catch (error) {
        console.error('Error fetching bot names:', error);
        res.status(500).json({ message: 'Error al obtener los bots', error: error.message });
    }
});

// --- Rutas para Reglas de Horario (Schedules) ---

/**
 * GET /api/schedules
 * Obtiene las reglas de horario. Permite filtrar por botName via query ?botName=XXX
 */
router.get('/schedules', async (req, res) => {
    try {
        const { botName } = req.query;
        const models = await getDbModels();

        if (botName) {
            const horarios = await models.Horarios.findAll({ where: { botName } });
            if (!horarios || horarios.length === 0) {
                return res.json([]);
            }
            const horarioIds = horarios.map(h => h.horarioId);
            const reglasRaw = await models.ReglasHorario.findAll({
                where: { horarioId: horarioIds },
                include: [{ model: models.Horarios, attributes: ['tipoHorario_id'] }]
            });
            const reglas = reglasRaw.map(r => {
                const obj = r.toJSON();
                obj.tipoHorario_id = obj.Horario.tipoHorario_id;
                delete obj.Horario;
                return obj;
            });
            return res.json(reglas);
        }

        const reglasRaw = await models.ReglasHorario.findAll({
            include: [{ model: models.Horarios, attributes: ['tipoHorario_id'] }]
        });
        const reglas = reglasRaw.map(r => {
            const obj = r.toJSON();
            obj.tipoHorario_id = obj.Horario.tipoHorario_id;
            delete obj.Horario;
            return obj;
        });
        res.json(reglas);
    } catch (error) {
        console.error('Error fetching schedule rules:', error);
        res.status(500).json({ message: 'Error al obtener las reglas de horario', error: error.message });
    }
});

/**
 * POST /api/schedules
 * Crea una nueva regla de horario.
 * Asocia a un horario por defecto o por botName si se especifica.
 */
router.post('/schedules', async (req, res) => {
    try {
        // Aceptar tanto dayOfWeek como diaSemana
        const { dayOfWeek, diaSemana, horaInicio, horaFin, activo } = req.body;
        const bodyBotName = req.body.botName || req.query.botName;
        const day = dayOfWeek !== undefined ? dayOfWeek : diaSemana;

        if (day === undefined || !horaInicio || !horaFin) {
            return res.status(400).json({ message: 'dayOfWeek/diaSemana, horaInicio y horaFin son requeridos.' });
        }

        const models = await getDbModels();

        // Buscar o crear un horario para el bot indicado (o default)
        const targetBotName = bodyBotName || 'default_bot';
        let horario = await models.Horarios.findOne({ where: { botName: targetBotName } });
        if (!horario) {
            horario = await models.Horarios.create({
                nombre: `${targetBotName} Default Schedule`,
                descripcion: 'Horario por defecto para reglas individuales',
                botName: targetBotName,
                tipoHorario_id: '1',
                zonaHoraria: 'America/Argentina/Buenos_Aires',
                activo: true,
            });
        }

        const newRule = await models.ReglasHorario.create({
            horarioId: horario.horarioId,
            diaSemana: day,
            horaInicio,
            horaFin,
            activo: activo !== undefined ? activo : true,
        });

        res.status(201).json(newRule);
    } catch (error) {
        console.error('Error creating schedule rule:', error);
        res.status(500).json({ message: 'Error al crear la regla de horario', error: error.message });
    }
});

/**
 * PUT /api/schedules/:id
 * Actualiza una regla de horario existente por su reglaId.
 */
router.put('/schedules/:id', async (req, res) => {
    try {
        const { id } = req.params; // id es reglaId
        const { dayOfWeek, diaSemana, horaInicio, horaFin, activo } = req.body;
        const day = dayOfWeek !== undefined ? dayOfWeek : diaSemana;

        const models = await getDbModels();

        const rule = await models.ReglasHorario.findByPk(id);
        if (!rule) {
            return res.status(404).json({ message: 'Regla de horario no encontrada.' });
        }

        await rule.update({
            diaSemana: day !== undefined ? day : rule.diaSemana,
            horaInicio: horaInicio !== undefined ? horaInicio : rule.horaInicio,
            horaFin: horaFin !== undefined ? horaFin : rule.horaFin,
            activo: activo !== undefined ? activo : rule.activo,
        });

        res.status(200).json(rule);
    } catch (error) {
        console.error(`Error updating schedule rule ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al actualizar la regla de horario', error: error.message });
    }
});

/**
 * DELETE /api/schedules/:id
 * Elimina una regla de horario por su reglaId.
 */
router.delete('/schedules/:id', async (req, res) => {
    try {
        const { id } = req.params; // id es reglaId

        const models = await getDbModels();

        const deletedCount = await models.ReglasHorario.destroy({ where: { reglaId: id } });

        if (deletedCount > 0) {
            res.status(200).json({ message: 'Regla de horario eliminada correctamente.' });
        } else {
            res.status(404).json({ message: 'No se encontró la regla de horario para eliminar.' });
        }
    } catch (error) {
        console.error(`Error deleting schedule rule ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al eliminar la regla de horario', error: error.message });
    }
});

// --- Rutas para Excepciones de Horario ---

/**
 * GET /api/exceptions
 * Obtiene las excepciones de horario. Permite filtrar por botName via query ?botName=XXX
 */
router.get('/exceptions', async (req, res) => {
    try {
        const { botName } = req.query;
        const models = await getDbModels();

        if (botName) {
            const horarios = await models.Horarios.findAll({ where: { botName } });
            if (!horarios || horarios.length === 0) {
                return res.json([]);
            }
            const horarioIds = horarios.map(h => h.horarioId);
            const excepciones = await models.ExcepcionesHorario.findAll({ where: { horarioId: horarioIds } });
            return res.json(excepciones);
        }

        const excepciones = await models.ExcepcionesHorario.findAll();
        res.json(excepciones);
    } catch (error) {
        console.error('Error fetching exceptions:', error);
        res.status(500).json({ message: 'Error al obtener las excepciones', error: error.message });
    }
});

/**
 * POST /api/exceptions
 * Añade una nueva excepción.
 */
router.post('/exceptions', async (req, res) => {
    try {
        const { fechaExcepcion, estado, horaInicio, horaFin, descripcion } = req.body;
        const bodyBotName = req.body.botName || req.query.botName;

        if (!fechaExcepcion || !estado) {
            return res.status(400).json({ message: 'fechaExcepcion y estado son requeridos.' });
        }

        const models = await getDbModels();

        // Buscar o crear un horario para el bot indicado (o default) para asociar la excepción
        const targetBotName = bodyBotName || 'default_bot';
        let horario = await models.Horarios.findOne({ where: { botName: targetBotName } });
        if (!horario) {
            horario = await models.Horarios.create({
                nombre: `${targetBotName} Default Schedule`,
                descripcion: 'Horario por defecto para excepciones individuales',
                botName: targetBotName,
                tipoHorario_id: '1',
                zonaHoraria: 'America/Argentina/Buenos_Aires',
                activo: true,
            });
        }

        const newException = await models.ExcepcionesHorario.create({
            horarioId: horario.horarioId,
            fechaExcepcion,
            estado,
            horaInicio: estado === 'horario_personalizado' ? horaInicio : null,
            horaFin: estado === 'horario_personalizado' ? horaFin : null,
            descripcion,
        });

        res.status(201).json(newException);
    } catch (error) {
        console.error('Error adding exception:', error);
        res.status(500).json({ message: 'Error al añadir excepción', error: error.message });
    }
});

/**
 * PUT /api/exceptions/:id
 * Actualiza una excepción específica por su excepcionId.
 */
router.put('/exceptions/:id', async (req, res) => {
    try {
        const { id } = req.params; // id es excepcionId
        const { fechaExcepcion, estado, horaInicio, horaFin, descripcion } = req.body;

        const models = await getDbModels();

        const exception = await models.ExcepcionesHorario.findByPk(id);

        if (!exception) {
            return res.status(404).json({ message: 'Excepción no encontrada.' });
        }

        await exception.update({
            fechaExcepcion,
            estado,
            horaInicio: estado === 'horario_personalizado' ? horaInicio : null,
            horaFin: estado === 'horario_personalizado' ? horaFin : null,
            descripcion,
        });

        res.status(200).json(exception);
    } catch (error) {
        console.error(`Error updating exception ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al actualizar la excepción', error: error.message });
    }
});

/**
 * DELETE /api/exceptions/:id
 * Elimina una excepción específica por su excepcionId.
 */
router.delete('/exceptions/:id', async (req, res) => {
    try {
        const { id } = req.params; // id es excepcionId

        const models = await getDbModels();

        const deletedCount = await models.ExcepcionesHorario.destroy({ where: { excepcionId: id } });

        if (deletedCount > 0) {
            res.status(200).json({ message: 'Excepción eliminada correctamente.' });
        } else {
            res.status(404).json({ message: 'No se encontró la excepción para eliminar.' });
        }
    } catch (error) {
        console.error(`Error deleting exception ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al eliminar la excepción', error: error.message });
    }
});

export default router;