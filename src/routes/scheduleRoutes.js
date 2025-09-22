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
            include: ['reglas', 'excepciones']
        });
        res.json(horarios);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Error al obtener los horarios', error: error.message });
    }
});

/**
 * GET /api/schedules/:id
 * Obtiene un horario específico por su ID.
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const horarioService = getHorarioService();
        await horarioService.initialize();
        const horario = await horarioService.db.models.Horarios.findByPk(id, {
            include: ['reglas', 'excepciones']
        });
        if (horario) {
            res.json(horario);
        } else {
            res.status(404).json({ message: `No se encontró horario con ID: ${id}` });
        }
    } catch (error) {
        console.error(`Error fetching schedule with ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al obtener el horario', error: error.message });
    }
});

/**
 * POST /api/schedules
 * Crea un nuevo horario.
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, botName, tipoHorario_id, zonaHoraria, activo, reglas, excepciones } = req.body;

        if (!nombre || !botName || !tipoHorario_id) {
            return res.status(400).json({ message: 'nombre, botName y tipoHorario_id son requeridos.' });
        }

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const nuevoHorario = await horarioService.db.models.Horarios.create({
            nombre,
            descripcion,
            botName,
            tipoHorario_id,
            zonaHoraria: zonaHoraria || 'America/Argentina/Buenos_Aires',
            activo: activo !== undefined ? activo : true,
        });

        if (reglas && reglas.length > 0) {
            for (const regla of reglas) {
                await horarioService.db.models.ReglasHorario.create({
                    horarioId: nuevoHorario.horarioId,
                    ...regla
                });
            }
        }

        if (excepciones && excepciones.length > 0) {
            for (const excepcion of excepciones) {
                await horarioService.db.models.ExcepcionesHorario.create({
                    horarioId: nuevoHorario.horarioId,
                    ...excepcion
                });
            }
        }

        res.status(201).json(nuevoHorario);
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ message: 'Error al crear el horario', error: error.message });
    }
});

/**
 * PUT /api/schedules/:id
 * Actualiza un horario existente.
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, botName, tipoHorario_id, zonaHoraria, activo, reglas, excepciones } = req.body;

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const horario = await horarioService.db.models.Horarios.findByPk(id);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado.' });
        }

        await horario.update({
            nombre,
            descripcion,
            botName,
            tipoHorario_id,
            zonaHoraria,
            activo,
        });

        // Actualizar reglas (simplificado: borrar y recrear)
        await horarioService.db.models.ReglasHorario.destroy({ where: { horarioId: id } });
        if (reglas && reglas.length > 0) {
            for (const regla of reglas) {
                await horarioService.db.models.ReglasHorario.create({
                    horarioId: id,
                    ...regla
                });
            }
        }

        // Actualizar excepciones (simplificado: borrar y recrear)
        await horarioService.db.models.ExcepcionesHorario.destroy({ where: { horarioId: id } });
        if (excepciones && excepciones.length > 0) {
            for (const excepcion of excepciones) {
                await horarioService.db.models.ExcepcionesHorario.create({
                    horarioId: id,
                    ...excepcion
                });
            }
        }

        const updatedHorario = await horarioService.db.models.Horarios.findByPk(id, {
            include: ['reglas', 'excepciones']
        });

        res.status(200).json(updatedHorario);
    } catch (error) {
        console.error(`Error updating schedule ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al actualizar el horario', error: error.message });
    }
});

/**
 * DELETE /api/schedules/:id
 * Elimina un horario y todas sus reglas y excepciones asociadas.
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const horarioService = getHorarioService();
        await horarioService.initialize();

        // Eliminar en cascada (manual)
        await horarioService.db.models.ExcepcionesHorario.destroy({ where: { horarioId: id } });
        await horarioService.db.models.ReglasHorario.destroy({ where: { horarioId: id } });
        const deletedCount = await horarioService.db.models.Horarios.destroy({ where: { horarioId: id } });

        if (deletedCount > 0) {
            res.status(200).json({ message: 'Horario eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'No se encontró el horario para eliminar.' });
        }
    } catch (error) {
        console.error(`Error deleting schedule ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al eliminar el horario', error: error.message });
    }
});

// Rutas para Reglas de Horario
/**
 * POST /api/schedules/:horarioId/rules
 * Añade una nueva regla a un horario específico.
 */
router.post('/:horarioId/rules', async (req, res) => {
    try {
        const { horarioId } = req.params;
        const { diaSemana, horaInicio, horaFin, activo } = req.body;

        if (!diaSemana || !horaInicio || !horaFin) {
            return res.status(400).json({ message: 'diaSemana, horaInicio y horaFin son requeridos.' });
        }

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const horario = await horarioService.db.models.Horarios.findByPk(horarioId);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado.' });
        }

        const newRule = await horarioService.db.models.ReglasHorario.create({
            horarioId,
            diaSemana,
            horaInicio,
            horaFin,
            activo: activo !== undefined ? activo : true,
        });

        res.status(201).json(newRule);
    } catch (error) {
        console.error(`Error adding rule to schedule ${req.params.horarioId}:`, error);
        res.status(500).json({ message: 'Error al añadir regla al horario', error: error.message });
    }
});

/**
 * PUT /api/schedules/:horarioId/rules/:ruleId
 * Actualiza una regla específica de un horario.
 */
router.put('/:horarioId/rules/:ruleId', async (req, res) => {
    try {
        const { horarioId, ruleId } = req.params;
        const { diaSemana, horaInicio, horaFin, activo } = req.body;

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const rule = await horarioService.db.models.ReglasHorario.findOne({
            where: { reglaId: ruleId, horarioId: horarioId }
        });

        if (!rule) {
            return res.status(404).json({ message: 'Regla no encontrada.' });
        }

        await rule.update({
            diaSemana,
            horaInicio,
            horaFin,
            activo,
        });

        res.status(200).json(rule);
    } catch (error) {
        console.error(`Error updating rule ${req.params.ruleId} for schedule ${req.params.horarioId}:`, error);
        res.status(500).json({ message: 'Error al actualizar la regla', error: error.message });
    }
});

/**
 * DELETE /api/schedules/:horarioId/rules/:ruleId
 * Elimina una regla específica de un horario.
 */
router.delete('/:horarioId/rules/:ruleId', async (req, res) => {
    try {
        const { horarioId, ruleId } = req.params;

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const deletedCount = await horarioService.db.models.ReglasHorario.destroy({
            where: { reglaId: ruleId, horarioId: horarioId }
        });

        if (deletedCount > 0) {
            res.status(200).json({ message: 'Regla eliminada correctamente.' });
        } else {
            res.status(404).json({ message: 'No se encontró la regla para eliminar.' });
        }
    } catch (error) {
        console.error(`Error deleting rule ${req.params.ruleId} for schedule ${req.params.horarioId}:`, error);
        res.status(500).json({ message: 'Error al eliminar la regla', error: error.message });
    }
});

// Rutas para Excepciones de Horario
/**
 * POST /api/schedules/:horarioId/exceptions
 * Añade una nueva excepción a un horario específico.
 */
router.post('/:horarioId/exceptions', async (req, res) => {
    try {
        const { horarioId } = req.params;
        const { fechaExcepcion, estado, horaInicio, horaFin, descripcion } = req.body;

        if (!fechaExcepcion || !estado) {
            return res.status(400).json({ message: 'fechaExcepcion y estado son requeridos.' });
        }

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const horario = await horarioService.db.models.Horarios.findByPk(horarioId);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado.' });
        }

        const newException = await horarioService.db.models.ExcepcionesHorario.create({
            horarioId,
            fechaExcepcion,
            estado,
            horaInicio: estado === 'horario_personalizado' ? horaInicio : null,
            horaFin: estado === 'horario_personalizado' ? horaFin : null,
            descripcion,
        });

        res.status(201).json(newException);
    } catch (error) {
        console.error(`Error adding exception to schedule ${req.params.horarioId}:`, error);
        res.status(500).json({ message: 'Error al añadir excepción al horario', error: error.message });
    }
});

/**
 * PUT /api/schedules/:horarioId/exceptions/:exceptionId
 * Actualiza una excepción específica de un horario.
 */
router.put('/:horarioId/exceptions/:exceptionId', async (req, res) => {
    try {
        const { horarioId, exceptionId } = req.params;
        const { fechaExcepcion, estado, horaInicio, horaFin, descripcion } = req.body;

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const exception = await horarioService.db.models.ExcepcionesHorario.findOne({
            where: { excepcionId: exceptionId, horarioId: horarioId }
        });

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
        console.error(`Error updating exception ${req.params.exceptionId} for schedule ${req.params.horarioId}:`, error);
        res.status(500).json({ message: 'Error al actualizar la excepción', error: error.message });
    }
});

/**
 * DELETE /api/schedules/:horarioId/exceptions/:exceptionId
 * Elimina una excepción específica de un horario.
 */
router.delete('/:horarioId/exceptions/:exceptionId', async (req, res) => {
    try {
        const { horarioId, exceptionId } = req.params;

        const horarioService = getHorarioService();
        await horarioService.initialize();

        const deletedCount = await horarioService.db.models.ExcepcionesHorario.destroy({
            where: { excepcionId: exceptionId, horarioId: horarioId }
        });

        if (deletedCount > 0) {
            res.status(200).json({ message: 'Excepción eliminada correctamente.' });
        }

        else {
            res.status(404).json({ message: 'No se encontró la excepción para eliminar.' });
        }
    } catch (error) {
        console.error(`Error deleting exception ${req.params.exceptionId} for schedule ${req.params.horarioId}:`, error);
        res.status(500).json({ message: 'Error al eliminar la excepción', error: error.message });
    }
});

module.exports = router;