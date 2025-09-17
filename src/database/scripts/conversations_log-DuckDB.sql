SELECT * FROM main.metricas_cliente;

-- existing SQL code ...

CREATE TABLE conversations AS 
SELECT * FROM read_json('../../Logs/conversations_log.json');

-- rest of SQL code ...

-- existing SQL code ...

-- Cargar datos desde el archivo CSV y agregar a la tabla conversations
COPY conversations FROM '../../Logs/conversations_log.csv' DELIMITER ',' CSV HEADER;

-- rest of SQL code ...

SELECT *
FROM conversations_log
WHERE "from" = '5493814015410'
limit 100






DROP TABLE IF EXISTS conversations_log;


-- 1. Crear la tabla con los tipos de datos deseados
CREATE TABLE conversations_log (
    date DATE,
    time TIME,
    "from" VARCHAR(20),
    role VARCHAR(20),
    pushName VARCHAR(100),
    body TEXT,
    messageId VARCHAR(50),
    etapaEmbudo VARCHAR(10),
    interesCliente VARCHAR(50),
    botName VARCHAR(50)
);

-- 2. Insertar los datos desde el JSON
INSERT INTO conversations_log
SELECT 
    TRY_CAST(date AS DATE) AS date,
    TRY_CAST(time AS TIME) AS time,
    "from",
    role,
    pushName,
    body,
    messageId,
    etapaEmbudo,
    interesCliente,
    botName
FROM read_json_auto('..\..\Logs\conversations_log.json');

-- Insert data from JSON file with proper handling of the "from" field
INSERT INTO conversations_log
SELECT 
    TRY_CAST(date AS DATE) AS date,
    TRY_CAST(time AS TIME) AS time,
    REPLACE("from", '"', '') AS "from", -- Remove any quotes from the "from" field
    role,
    pushName,
    body,
    messageId,
    etapaEmbudo,
    interesCliente,
    botName
FROM read_json_auto('../../../Logs/conversations_log.json');


SELECT 
                date,
                time,
                "from",
                body,
                role,
                pushName,
                etapaEmbudo,
                interesCliente,
                botName,
                messageId
            FROM conversations_log

            WHERE "from" = '5493812010781'

            ORDER BY date DESC, time DESC
            LIMIT 15