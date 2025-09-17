document.addEventListener('DOMContentLoaded', () => {
    const botIdInput = document.getElementById('botId');
    const loadBotScheduleBtn = document.getElementById('loadBotSchedule');
    const scheduleEditor = document.getElementById('scheduleEditor'); // Este es el contenedor principal del editor
    const editingBotIdSpan = document.getElementById('editingBotId');
    const horarioIdInput = document.getElementById('horarioId');
    const scheduleNameInput = document.getElementById('scheduleName');
    const scheduleDescriptionInput = document.getElementById('scheduleDescription');
    const rulesContainer = document.getElementById('rulesContainer');
    const exceptionsContainer = document.getElementById('exceptionsContainer');
    const addRuleBtn = document.getElementById('addRule');
    const addExceptionBtn = document.getElementById('addException');
    const saveScheduleBtn = document.getElementById('saveSchedule');
    const editorBotIdInput = document.getElementById('editorBotId');
    const deleteScheduleBtn = document.getElementById('deleteSchedule');

    const ruleTemplate = document.getElementById('ruleTemplate');
    const exceptionTemplate = document.getElementById('exceptionTemplate');

    loadBotScheduleBtn.addEventListener('click', async () => {
        const botId = botIdInput.value;
        if (!botId) {
            alert('Por favor, introduce un ID de Bot.');
            return;
        }
        try {
            const response = await fetch(`/api/schedules/${botId}`);
            clearEditor();
            if (response.ok) {
                const schedule = await response.json();
                populateEditor(botId, schedule);
            } else {
                alert(`No se encontró un horario para el Bot ID ${botId}. Puedes crear uno nuevo.`);
                populateEditor(botId, null);
            }
            scheduleEditor.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar el horario.');
        }
    });

    addRuleBtn.addEventListener('click', () => {
        const newRule = ruleTemplate.content.cloneNode(true);
        rulesContainer.appendChild(newRule);
        attachRemoveListener(rulesContainer, '.remove-rule');
    });

    addExceptionBtn.addEventListener('click', () => {
        const newException = exceptionTemplate.content.cloneNode(true);
        exceptionsContainer.appendChild(newException);
        attachRemoveListener(exceptionsContainer, '.remove-exception');
        attachExceptionStateListener(exceptionsContainer);
    });

    saveScheduleBtn.addEventListener('click', async () => {
        const scheduleData = {
            botId: parseInt(editorBotIdInput.value),
            botId: parseInt(botId),
            nombre: scheduleNameInput.value,
            descripcion: scheduleDescriptionInput.value,
            reglas: [],
            excepciones: []
        };

        // Recolectar reglas
        document.querySelectorAll('#rulesContainer .rule-row').forEach(row => {
            scheduleData.reglas.push({
                diaSemana: parseInt(row.querySelector('.day-of-week').value),
                horaInicio: row.querySelector('.start-time').value,
                horaFin: row.querySelector('.end-time').value
            });
        });

        // Recolectar excepciones
        document.querySelectorAll('#exceptionsContainer .exception-row').forEach(row => {
            scheduleData.excepciones.push({
                fecha: row.querySelector('.exception-date').value,
                estado: row.querySelector('.exception-state').value,
                horaInicio: row.querySelector('.exception-start-time').value || null,
                horaFin: row.querySelector('.exception-end-time').value || null,
                descripcion: row.querySelector('.exception-description').value
            });
        });

        try {
            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scheduleData)
            });

            if (response.ok) {
                alert('Horario guardado con éxito.');
                const newSchedule = await response.json();
                populateEditor(botId, newSchedule);
            } else {
                const error = await response.json();
                alert(`Error al guardar: ${error.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de red al guardar el horario.');
        }
    });

    deleteScheduleBtn.addEventListener('click', async () => {
        const horarioId = horarioIdInput.value;
        if (!horarioId || !confirm('¿Estás seguro de que quieres eliminar este horario? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch(`/api/schedules/${horarioId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Horario eliminado con éxito.');
                clearEditor();
                scheduleEditor.style.display = 'none';
            } else {
                const error = await response.json();
                alert(`Error al eliminar: ${error.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de red al eliminar el horario.');
        }
    });

    function populateEditor(botId, schedule) {
        editingBotIdSpan.textContent = botId;
        editorBotIdInput.value = botId; // Asignar botId al input del editor
        if (schedule) {
            horarioIdInput.value = schedule.id;
            scheduleNameInput.value = schedule.nombre;
            scheduleDescriptionInput.value = schedule.descripcion;
            schedule.reglas.forEach(rule => {
                const newRule = ruleTemplate.content.cloneNode(true);
                newRule.querySelector('.day-of-week').value = rule.diaSemana;
                newRule.querySelector('.start-time').value = rule.horaInicio;
                newRule.querySelector('.end-time').value = rule.horaFin;
                rulesContainer.appendChild(newRule);
            });
            schedule.excepciones.forEach(exception => {
                const newException = exceptionTemplate.content.cloneNode(true);
                const row = newException.querySelector('.exception-row');
                row.querySelector('.exception-date').value = exception.fecha;
                row.querySelector('.exception-state').value = exception.estado;
                row.querySelector('.exception-description').value = exception.descripcion;
                
                const startTimeInput = row.querySelector('.exception-start-time');
                const endTimeInput = row.querySelector('.exception-end-time');

                if (exception.estado === 'horario_personalizado') {
                    startTimeInput.value = exception.horaInicio;
                    endTimeInput.value = exception.horaFin;
                    startTimeInput.style.display = 'block';
                    endTimeInput.style.display = 'block';
                }
                exceptionsContainer.appendChild(newException);
            });
            deleteScheduleBtn.style.display = 'inline-block';
        } else {
            scheduleNameInput.value = `Horario para Bot ${botId}`;
            scheduleDescriptionInput.value = '';
            deleteScheduleBtn.style.display = 'none';
        }
        attachAllListeners();
    }

    function clearEditor() {
        horarioIdInput.value = '';
        editingBotIdSpan.textContent = '';
        scheduleNameInput.value = '';
        scheduleDescriptionInput.value = '';
        rulesContainer.innerHTML = '';
        exceptionsContainer.innerHTML = '';
        deleteScheduleBtn.style.display = 'none';
    }

    function attachRemoveListener(container, selector) {
        container.querySelectorAll(selector).forEach(button => {
            button.addEventListener('click', (e) => e.target.closest('.rule-row, .exception-row').remove());
        });
    }

    function attachExceptionStateListener(container) {
        container.querySelectorAll('.exception-state').forEach(select => {
            select.addEventListener('change', (e) => {
                const row = e.target.closest('.exception-row');
                const startTimeInput = row.querySelector('.exception-start-time');
                const endTimeInput = row.querySelector('.exception-end-time');
                if (e.target.value === 'horario_personalizado') {
                    startTimeInput.style.display = 'block';
                    endTimeInput.style.display = 'block';
                } else {
                    startTimeInput.style.display = 'none';
                    endTimeInput.style.display = 'none';
                }
            });
        });
    }

    function attachAllListeners() {
        attachRemoveListener(rulesContainer, '.remove-rule');
        attachRemoveListener(exceptionsContainer, '.remove-exception');
        attachExceptionStateListener(exceptionsContainer);
    }
});