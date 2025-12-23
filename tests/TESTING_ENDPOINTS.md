# Pruebas de endpoints y puertos

## **Resumen**

- **Propósito:**: Comandos `curl` y pruebas PowerShell para verificar endpoints expuestos y puertos.
- **Archivo:**: `TESTING_ENDPOINTS.md` (este documento).

## **Variables a reemplazar**

- **`<HOST>`:**: `localhost` o IP del servidor (ej. `192.168.x.x`).
- **`<PORT>`:**: Puerto donde corre la app (por defecto `3008`).
- **`<ACCESS_TOKEN>`:**: Token Bearer si el endpoint requiere autenticación.
- **`<TO_IN_E164>`, `<FROM_NUMBER>`, `<TO_NUMBER>`, `<NUMBER>`:**: Números en formato E.164 (sin `+` si la API lo exige).
- **`<NOMBRE>`, `<EDAD>`:**: Campos usados en los cuerpos JSON.

## **Comandos curl (PowerShell / Windows)**

- **Nota:**: En PowerShell `curl` es alias de `Invoke-WebRequest`. Use `curl.exe` para invocar el binario `curl` real.

**GET raíz**

```
curl.exe -i "http://<HOST>:<PORT>/"
```

**POST /v1/messages** (envía texto)

```
curl.exe -i -X POST "http://<HOST>:<PORT>/v1/messages" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"to":"<TO_IN_E164>","type":"text","text":{"body":"Hola desde curl"}}'
```

**POST /v1/register** (simular registro)

```
curl.exe -i -X POST "http://<HOST>:<PORT>/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"from":"<FROM_NUMBER>","name":"<NOMBRE>","age":<EDAD>}'
```

**POST /v1/samples**

```
curl.exe -i -X POST "http://<HOST>:<PORT>/v1/samples" -H "Content-Type: application/json" -d '{"to":"<TO_NUMBER>"}'

curl.exe -i -X POST "http://localhost:3000/v1/samples" -H "Content-Type: application/json" -d '{"to":"5493812010782"}'
```

**POST /v1/blacklist** (añadir al blacklist)

```
curl.exe -i -X POST "http://<HOST>:<PORT>/v1/blacklist" \
  -H "Content-Type: application/json" \
  -d '{"number":"<NUMBER>","action":"add"}'
```

## **Ejemplos concretos (reemplazados)**

- **GET raíz (local):** `curl.exe -i "http://localhost:3008/"`

- **Enviar texto a un usuario (local):**

```
curl.exe -i -X POST "http://localhost:3008/v1/messages" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{"to":"5493812010781","type":"text","text":{"body":"Prueba desde local"}}'
```

- **Registrar usuario (local):**

```
curl.exe -i -X POST "http://localhost:3008/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"from":"5493812010781","name":"María","age":30}'

curl.exe -i -X POST "http://localhost:3008/v1/register" -H "Content-Type: application/json" -d '{"from":"5493812010781","name":"María","age":30}'


curl.exe -i -X POST "http://localhost:3000/v1/register" -H "Content-Type: application/json" -d '{"from":"5493812010781","name":"María","age":30}'

curl.exe -i -X POST "http://localhost:3000/v1/register" -H "Content-Type: application/json" -d '{"number":"5493812010781","name":"María"}'
```

## **Comprobación de puertos (PowerShell)**

- **Test TCP:**

```
Test-NetConnection -ComputerName <HOST> -Port <PORT>
```

- **Ejemplo:** `Test-NetConnection -ComputerName localhost -Port 3008`

- **Interpretación:**
  - **TcpTestSucceeded : True**: puerto accesible.
  - **False**: puerto cerrado o servicio inalcanzable.

## **Consejos / Buenas prácticas**

- **Usar `curl.exe` en PowerShell**: evita el alias `curl` de PowerShell.
- **Escapar JSON:** en PowerShell mantén comillas simples externas y dobles internas.
- **Tokens y secretos:** nunca subir `ACCESS_TOKEN` al repositorio; usar `.env` o variables de entorno.
- **Formato de números:** usar E.164 (ej. `5493812010781`) según el provider.

**Prueba realizada / Nota sobre PowerShell y JSON**

- **Comando (inline) que falló:** `curl.exe -i -X POST "http://localhost:3000/v1/register" -H "Content-Type: application/json" -d '{"number":"5493812010781","name":"María"}'`  
  - **Resultado:** `HTTP/1.1 400 Bad Request` con mensaje `Expected property name or '}' in JSON at position 1`. Esto indica que PowerShell alteró/rompió las comillas del JSON al enviarlo inline.

- **Método que funcionó (recomendado en PowerShell):** crear un archivo con el JSON y enviarlo crudo:
  - `Set-Content -Path payload.json -Value '{"number":"5493812010781","name":"María"}' -Encoding utf8`
  - `curl.exe -i -X POST "http://localhost:3000/v1/register" -H "Content-Type: application/json" --data-binary "@payload.json"`
  - **Resultado:** `HTTP/1.1 200 OK` y cuerpo `trigger` — la app parseó correctamente el JSON.

- **Alternativas / consejos rápidos:**
  - Escapar las comillas y usar `--data-raw "{\"key\":\"value\"}"` si prefieres inline.  
  - Siempre usar `curl.exe` en PowerShell para evitar el alias.  
  - Guardar el payload en UTF-8 evita problemas con acentos.

---
