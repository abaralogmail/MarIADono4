const express = require('express');
const path = require('path');
const ejs = require('ejs');
const scheduleRoutes = require('../routes/scheduleRoutes'); // Importar las nuevas rutas

class WebServerService {
    constructor() {}

    initializeWebServer(app) {
        // Middleware para parsear JSON
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Static files configuration
        app.use(express.static(path.join(__dirname, '../public')));
        
        // View engine setup
        app.set('views', path.join(__dirname, '../views'));
        app.set('view engine', 'html');
        app.engine('html', ejs.renderFile);
        
        // Routes
        app.get('/dashboard', (req, res) => {
            res.render('dashboard');
        });

        // Nueva ruta para el gestor de horarios
        app.get('/horarios', (req, res) => {
            res.render('Gestion_horario_bot');
        });

        // Rutas de la API para gestionar horarios
        app.use('/api', scheduleRoutes);

        console.log('Web server configuration initialized');
    }
}

module.exports = WebServerService;
