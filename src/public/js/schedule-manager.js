document.addEventListener('DOMContentLoaded', () => {
    const botNameSelect = document.getElementById('botNameSelect');
    const reloadAllBtn = document.getElementById('reloadAllBtn');

    const reloadSchedulesBtn = document.getElementById('reloadSchedulesBtn');
    const saveAllSchedulesBtn = document.getElementById('saveAllSchedulesBtn');

    const exceptionDateInput = document.getElementById('exceptionDate');
    const exceptionStateSelect = document.getElementById('exceptionState');
    const exceptionStartTimeInput = document.getElementById('exceptionStartTime');
    const exceptionEndTimeInput = document.getElementById('exceptionEndTime');
    const exceptionDescriptionInput = document.getElementById('exceptionDescription');
    const addExceptionBtn = document.getElementById('addExceptionBtn');
    const exceptionsTableBody = document.getElementById('exceptionsTableBody');

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let allSchedules = []; // To store all fetched schedules (regular rules)
    let activeDayIndex = 1; // Default to Lunes (1 matching DB diaSemana)

    // Cargar lista de bots en el combo
    async function loadBots() {
        try {
            const res = await fetch('/api/bots');
            const bots = await res.json();
            botNameSelect.innerHTML = '<option value="" disabled selected>-- Elegir bot --</option>';
            bots.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b;
                opt.textContent = b;
                botNameSelect.appendChild(opt);
            });
        } catch (e) {
            console.error('Error cargando bots', e);
        }
    }

    function getSelectedBotName() {
        const v = botNameSelect.value;
        if (!v) {
            alert('Selecciona un bot para continuar.');
        }
        return v;
    }

    // --- Funciones para Horarios Regulares ---

    async function fetchSchedules() {
        const botName = getSelectedBotName();
        if (!botName) return;
        try {
            const response = await fetch(`/api/schedules?botName=${encodeURIComponent(botName)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allSchedules = await response.json();
            displayTipoHorario();
            renderAllDays();
        } catch (error) {
            console.error('Error fetching schedules:', error);
            alert('Error al cargar los horarios. Consulta la consola para más detalles.');
        }
    }


    function displayTipoHorario() {
        const el = document.getElementById('tipoHorarioDisplay');
        const tipos = [...new Set(allSchedules.map(s => s.tipoHorario_id))];
        el.innerText = tipos.length === 1
            ? `Tipo de Horario: ${tipos[0]}`
            : `Tipos de Horario: ${tipos.join(', ')}`;
    }

    function addTimeSlot(dayIndex, schedule = { reglaId: null, horaInicio: '', horaFin: '' }, parentContainer) {
        const timeSlotEntry = document.createElement('div');
        timeSlotEntry.classList.add('time-slot-entry');
        timeSlotEntry.dataset.reglaId = schedule.reglaId; // Use reglaId for rules

        timeSlotEntry.innerHTML = `
            <div class="time-input-group">
                <label>Inicio</label>
                <input type="time" value="${schedule.horaInicio || ''}" class="start-time">
            </div>
            <div class="time-input-group">
                <label>Fin</label>
                <input type="time" value="${schedule.horaFin || ''}" class="end-time">
            </div>
            ${schedule.reglaId ? '<button class="remove-time-slot-btn-day">Eliminar</button>' : ''}
        `;
        (parentContainer || document.getElementById('allDaysContent')).appendChild(timeSlotEntry);

        const removeBtn = timeSlotEntry.querySelector('.remove-time-slot-btn-day');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
                    timeSlotEntry.remove();
                    // Mark for deletion if it was an existing rule
                    if (schedule.reglaId) {
                        const index = allSchedules.findIndex(s => s.reglaId === schedule.reglaId);
                        if (index !== -1) {
                            allSchedules[index]._deleted = true;
                        }
                    }
                }
            });
        }
    }

    saveAllSchedulesBtn.addEventListener('click', async () => {
        const botName = getSelectedBotName();
        if (!botName) return;

        const currentDayRulesInUI = [];
        const timeSlotEntries = dayContentContainer.querySelectorAll('.time-slot-entry');

        for (const entry of timeSlotEntries) {
            const startTime = entry.querySelector('.start-time').value;
            const endTime = entry.querySelector('.end-time').value;

            if (!startTime || !endTime) {
                alert('Por favor, asegúrate de que todos los horarios tengan hora de inicio y fin.');
                return;
            }
            if (startTime >= endTime) {
                alert('La hora de fin debe ser posterior a la hora de inicio para todos los horarios.');
                return;
            }
            currentDayRulesInUI.push({
                reglaId: entry.dataset.reglaId || null,
                diaSemana: activeDayIndex,
                horaInicio: startTime,
                horaFin: endTime
            });
        }
    
        function renderAllDays() {
            const container = document.getElementById('allDaysContent');
            container.innerHTML = '';
            daysOfWeek.forEach((day, index) => {
                const section = document.createElement('div');
                section.classList.add('day-section');
                section.dataset.dayIndex = index;
                const header = document.createElement('h3');
                header.innerText = day;
                section.appendChild(header);
                const content = document.createElement('div');
                content.classList.add('day-content');
                section.appendChild(content);
                const daySchedules = allSchedules.filter(s => s.diaSemana === index && !s._deleted);
                if (daySchedules.length) {
                    daySchedules.forEach(schedule => addTimeSlot(index, schedule, content));
                } else {
                    addTimeSlot(index, {}, content);
                }
                const addBtn = document.createElement('button');
                addBtn.classList.add('btn-primary', 'add-time-slot-btn-day');
                addBtn.textContent = 'Añadir Horario';
                addBtn.addEventListener('click', () => addTimeSlot(index, {}, content));
                section.appendChild(addBtn);
                container.appendChild(section);
            });
        }

        const originalDayRules = allSchedules.filter(s => s.diaSemana === activeDayIndex && !s._deleted);

        const rulesToCreate = currentDayRulesInUI.filter(rule => !rule.reglaId);
        const rulesToUpdate = currentDayRulesInUI.filter(rule => rule.reglaId);
        
        const rulesToDelete = originalDayRules.filter(originalRule => 
            !currentDayRulesInUI.some(uiRule => uiRule.reglaId === originalRule.reglaId)
        );

        try {
            // Delete rules
            for (const rule of rulesToDelete) {
                await fetch(`/api/schedules/${rule.reglaId}`, {
                    method: 'DELETE'
                });
            }

            // Create new rules
            for (const rule of rulesToCreate) {
                await fetch(`/api/schedules?botName=${encodeURIComponent(botName)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rule)
                });
            }

            // Update existing rules
            for (const rule of rulesToUpdate) {
                await fetch(`/api/schedules/${rule.reglaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rule)
                });
            }

            alert('Horarios guardados exitosamente.');
            fetchSchedules(); // Recargar para ver los cambios
        } catch (error) {
            console.error('Error saving schedules:', error);
            alert('Error al guardar los horarios. Consulta la consola para más detalles.');
        }
    });

    reloadSchedulesBtn.addEventListener('click', fetchSchedules);
    reloadAllBtn.addEventListener('click', () => {
        activeDayIndex = 0;
        fetchSchedules();
        fetchExceptions();
    });
    botNameSelect.addEventListener('change', () => {
        activeDayIndex = 0;
        fetchSchedules();
        fetchExceptions();
    });

    // --- Funciones para Manejo de Excepciones ---

    async function fetchExceptions() {
        const botName = getSelectedBotName();
        if (!botName) return;
        try {
            const response = await fetch(`/api/exceptions?botName=${encodeURIComponent(botName)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const exceptions = await response.json();
            renderExceptions(exceptions);
        } catch (error) {
            console.error('Error fetching exceptions:', error);
            alert('Error al cargar las excepciones. Consulta la consola para más detalles.');
        }
    }

    function renderExceptions(exceptions) {
        exceptionsTableBody.innerHTML = '';
        if (exceptions.length === 0) {
            exceptionsTableBody.innerHTML = '<tr><td colspan="6">No hay excepciones configuradas.</td></tr>';
            return;
        }

        exceptions.forEach(exception => {
            const row = exceptionsTableBody.insertRow();
            row.dataset.exceptionId = exception.excepcionId; // Use excepcionId for exceptions
            row.innerHTML = `
                <td>${exception.fechaExcepcion}</td>
                <td>${exception.estado}</td>
                <td>${exception.horaInicio || '-'}</td>
                <td>${exception.horaFin || '-'}</td>
                <td>${exception.descripcion || '-'}</td>
                <td class="actions">
                    <button class="edit-exception-btn edit" data-id="${exception.excepcionId}">Editar</button>
                    <button class="delete-exception-btn delete" data-id="${exception.excepcionId}">Eliminar</button>
                </td>
            `;
        });

        document.querySelectorAll('.edit-exception-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                const exceptionToEdit = exceptions.find(e => e.excepcionId == id);
                if (exceptionToEdit) {
                    exceptionDateInput.value = exceptionToEdit.fechaExcepcion;
                    exceptionStateSelect.value = exceptionToEdit.estado;
                    exceptionDescriptionInput.value = exceptionToEdit.descripcion;

                    const isCustomSchedule = exceptionToEdit.estado === 'horario_personalizado';
                    exceptionStartTimeInput.disabled = !isCustomSchedule;
                    exceptionEndTimeInput.disabled = !isCustomSchedule;

                    if (isCustomSchedule) {
                        exceptionStartTimeInput.value = exceptionToEdit.horaInicio;
                        exceptionEndTimeInput.value = exceptionToEdit.horaFin;
                    } else {
                        exceptionStartTimeInput.value = '';
                        exceptionEndTimeInput.value = '';
                    }
                    addExceptionBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
                    addExceptionBtn.dataset.editingId = id;
                }
            });
        });

        document.querySelectorAll('.delete-exception-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const id = event.target.dataset.id;
                if (!confirm('¿Estás seguro de que quieres eliminar esta excepción?')) {
                    return;
                }
                try {
                    const response = await fetch(`/api/exceptions/${id}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    alert('Excepción eliminada exitosamente.');
                    fetchExceptions();
                } catch (error) {
                    console.error('Error deleting exception:', error);
                    alert('Error al eliminar la excepción. Consulta la consola para más detalles.');
                }
            });
        });
    }

    exceptionStateSelect.addEventListener('change', (event) => {
        const isCustomSchedule = event.target.value === 'horario_personalizado';
        exceptionStartTimeInput.disabled = !isCustomSchedule;
        exceptionEndTimeInput.disabled = !isCustomSchedule;
        if (!isCustomSchedule) {
            exceptionStartTimeInput.value = '';
            exceptionEndTimeInput.value = '';
        }
    });

    addExceptionBtn.addEventListener('click', async () => {
        const botName = getSelectedBotName();
        if (!botName) return;

        const fechaExcepcion = exceptionDateInput.value;
        const estado = exceptionStateSelect.value;
        const horaInicio = exceptionStartTimeInput.value;
        const horaFin = exceptionEndTimeInput.value;
        const descripcion = exceptionDescriptionInput.value;
        const editingId = addExceptionBtn.dataset.editingId;

        if (!fechaExcepcion || !estado) {
            alert('Por favor, completa la fecha y el estado de la excepción.');
            return;
        }

        if (estado === 'horario_personalizado') {
            if (!horaInicio || !horaFin) {
                alert('Para un horario personalizado, debes ingresar la hora de inicio y fin.');
                return;
            }
            if (horaInicio >= horaFin) {
                alert('La hora de fin de la excepción debe ser posterior a la hora de inicio.');
                return;
            }
        }

        const data = {
            fechaExcepcion,
            estado,
            horaInicio: estado === 'horario_personalizado' ? horaInicio : null,
            horaFin: estado === 'horario_personalizado' ? horaFin : null,
            descripcion
        };

        try {
            let response;
            if (editingId) {
                response = await fetch(`/api/exceptions/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch(`/api/exceptions?botName=${encodeURIComponent(botName)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Excepción guardada exitosamente.');
            // Limpiar formulario
            exceptionDateInput.value = '';
            exceptionStateSelect.value = 'cerrado';
            exceptionStartTimeInput.value = '';
            exceptionEndTimeInput.value = '';
            exceptionStartTimeInput.disabled = true;
            exceptionEndTimeInput.disabled = true;
            exceptionDescriptionInput.value = '';
            addExceptionBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar excepción';
            delete addExceptionBtn.dataset.editingId;

            fetchExceptions();
        } catch (error) {
            console.error('Error saving exception:', error);
            alert('Error al guardar la excepción. Consulta la consola para más detalles.');
        }
    });

    // Initial load
    loadBots();
});