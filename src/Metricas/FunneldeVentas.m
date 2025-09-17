let
    #"Respuestas BulkMessages" = let
    // 1. Cargar la tabla de origen
    Source = Conversations_Filtrado,
    
    // 2. Filtrar solo los mensajes de tipo "bulkMessage"
    FiltrarBulkMessages = Table.SelectRows(Source, each [role] = "BulkMessage"),
    ConteoBulkMessages = Table.RowCount(FiltrarBulkMessages),  // Contar cantidad de bulkMessages
    
    FiltrarIncoming = Table.SelectRows(Source, each [role] = "incoming"),
    ConteoIncoming = Table.RowCount(FiltrarIncoming),  // Contar cantidad de Assistant

    // 3. Filtrar solo los mensajes de tipo "incoming" (respuestas de usuarios)
    FiltrarAssistant = Table.SelectRows(Source, each [pushName] = "Assistant" and [role] <> "BulkMessage"),
    ConteoAssistant = Table.RowCount(FiltrarAssistant),  // Contar cantidad de Assistant
    
    // 4. Realizar un join entre los mensajes "bulkMessage" y "incoming" por el campo 'from'
    //FiltrarRespuestasEntrantes = Table.NestedJoin(FiltrarBulkMessages, {"from"}, FiltrarIncoming, {"from"}, "RespuestasEntrantes", JoinKind.Inner),
    
    // 5. Eliminar duplicados por columna 'from' (usuario) para contar solo una respuesta por usuario
    //EliminarDuplicados = Table.Distinct(FiltrarRespuestasEntrantes, {"from"}),
    
    // 6. Filtrar las filas donde 'etapaEmbudo' sea numérico
    AgregarTipoNumerico = Table.AddColumn(Source, "EsNumerico", each try Number.From([etapaEmbudo]) is number otherwise false),
    FiltrarNumericos = Table.SelectRows(AgregarTipoNumerico, each [EsNumerico] = true),
    ConvertirEtapaEmbudoANumero = Table.TransformColumns(FiltrarNumericos, {{"etapaEmbudo", each Number.From(_)}}),
    
    // 7. Contar las respuestas entrantes en etapas 1-3 del embudo
    FiltrarEtapas1a3 = Table.SelectRows(ConvertirEtapaEmbudoANumero, each [etapaEmbudo] >= 1 and [etapaEmbudo] <= 3),
    ConteoEtapas1a3 = Table.RowCount(FiltrarEtapas1a3),
    
    // 8. Contar las respuestas entrantes en etapas 4-5 del embudo
    FiltrarEtapas4a5 = Table.SelectRows(ConvertirEtapaEmbudoANumero, each [etapaEmbudo] >= 4 and [etapaEmbudo] <= 5),
    ConteoEtapas4a5 = Table.RowCount(FiltrarEtapas4a5),
    
    // Filtrar y contar envios para BotOfertasTucuman
    enviosBotOfertasTucuman = Table.SelectRows(FiltrarBulkMessages, each [botName] = "BotOfertasTucuman"),
    ConteoEnvioBotOfertasTucuman = Table.RowCount(enviosBotOfertasTucuman),
    
    // Filtrar y contar respuestas para BotOfertasTucuman
    //FiltrarBotOfertasTucuman = Table.SelectRows(EliminarDuplicados, each [botName] = "BotOfertasTucuman"),
    //ConteoBotOfertasTucuman = Table.RowCount(FiltrarBotOfertasTucuman),

    // Filtrar y contar envios para bot
   /*
    enviosFiltrarBot = Table.SelectRows(FiltrarBulkMessages, each [botName] = "bot"),
    ConteoEnviosBot = Table.RowCount(enviosFiltrarBot),

    // Filtrar y contar respuestas para bot
    FiltrarBot = Table.SelectRows(EliminarDuplicados, each [botName] = "bot"),
    ConteoBot = Table.RowCount(FiltrarBot),
*/
     Bots = {"BotOfertasTucuman", "bot"},  // Lista de bots a incluir
    BotMetrics = List.Transform(Bots, (botName) => 
        let
            enviosBot = Table.RowCount(Table.SelectRows(FiltrarBulkMessages, each [botName] = botName)),
            respuestasBot = Table.RowCount(Table.SelectRows(FiltrarAssistant, each [botName] = botName))
        in
            [ Bot = botName, Envio = enviosBot, Respuesta = respuestasBot ]
    ),

    // Convertir la lista de métricas de bots a tabla
    TablaBotMetrics = Table.FromRecords(BotMetrics),

    // Obtener los valores de cada bot en manera detallada
    // modifica la forma en que se transforma en lista para ser más clara
    ValoresPorBot = List.Transform(Table.ToRecords(TablaBotMetrics), each "Bot: " & _[Bot] & ", Envio: " & Text.From(_[Envio]) & ", Respuesta: " & Text.From(_[Respuesta])),

    enviosbot = Table.RowCount(Table.SelectRows(FiltrarBulkMessages, each [botName] = "bot")),
    respuestasbot = Table.RowCount(Table.SelectRows(FiltrarAssistant, each [botName] = "bot"))

    enviosbot = Table.RowCount(Table.SelectRows(FiltrarBulkMessages, each [botName] = "bot")),
    respuestasbot = Table.RowCount(Table.SelectRows(FiltrarAssistant, each [botName] = "bot"))

    enviosbot = Table.RowCount(Table.SelectRows(FiltrarBulkMessages, each [botName] = "bot")),
    respuestasbot = Table.RowCount(Table.SelectRows(FiltrarAssistant, each [botName] = "bot"))

    enviosbot = Table.RowCount(Table.SelectRows(FiltrarBulkMessages, each [botName] = "bot")),
    respuestasbot = Table.RowCount(Table.SelectRows(FiltrarAssistant, each [botName] = "bot"))

    in
    //FiltrarBot
    [
        CantidadBulkMessages = ConteoBulkMessages,
        CantidadIncoming = ConteoIncoming,
        CantidadAssistant = ConteoAssistant,
        CantidadEtapas1a3 = ConteoEtapas1a3,
        CantidadEtapas4a5 = ConteoEtapas4a5,
        EnvioBotOfertasTucuman = ConteoEnvioBotOfertasTucuman,
        // RespuestasBotOfertasTucuman = ConteoBotOfertasTucuman,
        // EnviosBot = ConteoEnviosBot,
        // RespuestasBot = ConteoBot,
        MetricsPorBot = ValoresPorBot
        
    ]
in
    #"Respuestas BulkMessages"