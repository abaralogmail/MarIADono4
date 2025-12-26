/*
  Integration test runner for the local app.

  - Starts the app (`src/app.js`) in a child process
  - Waits until the HTTP server is responsive
  - Executes a small set of requests against the app endpoints:
    `/v1/messages`, `/v1/register`, `/v1/samples`, `/v1/blacklist`
  - Prints a concise summary and exits (kills the child process)

  Usage (PowerShell):
    node tests/appTesting.js

  Notes:
  - Ensure dependencies are installed (`npm install`) before running.
  - The script uses global `fetch` (Node 18+). If your Node is older,
    run the tests with a newer Node version.
*/

import assert from 'assert'
import fs from 'fs'
import path from 'path'

//const PORT = process.env.PORT ?? 3000
const PORT = 3000
// Origin of the exposed dev tunnel (no path suffix) or local override via env BASE_URL
const BASE = process.env.BASE_URL ?? `http://localhost:3008`
// Health-check URL (the provider exposes /webhook as a root endpoint)
const HEALTH = `${BASE}/webhook`

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForServer(timeout = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(HEALTH)
      // server responded (status may be 404) -> consider ready
      return true
    } catch (err) {
      await sleep(250)
    }
  }
  return false
}

async function runTests() {
  console.log('Waiting for server to be available at', BASE)
  let ready = await waitForServer(15000)
  if (!ready) {
    throw new Error('Server did not become available within timeout. Start the app first and retry.')
  }

  console.log('Server is up — running tests against', BASE)

  const VERBOSE = String(process.env.VERBOSE ?? 'true').toLowerCase() === 'true'
  const LOG_FILE = process.env.LOG_FILE ?? path.join('tests', 'test-results.log')

  const results = []

  try {
    // helper to perform request and collect metadata
    async function doRequest(name, input) {
      const start = Date.now()
      const res = await fetch(input.url, input.options)
      const duration = Date.now() - start
      let body = null
      let bodyText = ''
      try {
        if (input.expectJson) {
          body = await res.json().catch(() => null)
          bodyText = body ? JSON.stringify(body) : ''
        } else {
          bodyText = await res.text()
          try { body = JSON.parse(bodyText) } catch { body = bodyText }
        }
      } catch (e) {
        bodyText = `<unreadable: ${e.message}>`
      }

      const size = Buffer.byteLength(bodyText || '', 'utf8')
      const preview = (bodyText || '').slice(0, 1000)
      const okChecks = input.check ? input.check({ res, body, bodyText }) : res.ok

      const entry = { name, ok: !!okChecks, status: res.status, duration, size, body, bodyText, preview }
      results.push(entry)
      return entry
    }

    // 1) /v1/messages
    await doRequest('/v1/messages', {
      url: BASE + '/v1/messages',
      options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '5493815908557', message: 'contacto — prueba local', test: 'local' }) },
      expectJson: false,
      check: ({ res, bodyText }) => res.ok && bodyText.includes('sended'),
    })

    // 2) /v1/register
    await doRequest('/v1/register', {
      url: BASE + '/v1/register',
      options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '5493815908557', name: 'Test User', test: 'local' }) },
      expectJson: false,
      check: ({ res, bodyText }) => res.ok && bodyText.includes('trigger'),
    })

    // 3) /v1/samples
    await doRequest('/v1/samples', {
      url: BASE + '/v1/samples',
      options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '5493815908557', name: 'Samples Test', test: 'local' }) },
      expectJson: false,
      check: ({ res, bodyText }) => res.ok && bodyText.includes('trigger'),
    })

    // 4) /v1/blacklist (add)
    await doRequest('/v1/blacklist', {
      url: BASE + '/v1/blacklist',
      options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: '5493815908557', intent: 'add', test: 'local' }) },
      expectJson: true,
      check: ({ res, body }) => res.ok && body && body.status === 'ok',
    })
    
    // 5) /webhook (simular mensaje entrante para disparar flowPrincipal)
    await doRequest('/webhook - incoming message', {
      url: BASE + '/webhook',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'test',
              changes: [
                {
                  value: {
                    messages: [
                      {
                        from: '5493815908557',
                        id: 'wamid.test.123',
                        timestamp: Math.floor(Date.now()/1000),
                        text: { body: 'hola' },
                        type: 'text'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        })
      },
      expectJson: false,
      check: ({ res }) => res.ok,
    })

    // Build a detailed results summary (always saved to file)
    const now = new Date().toISOString()
    let fileContent = `Test run: ${now}\nTarget: ${BASE}\n\n`
    fileContent += `Detailed results:\n`
    for (const r of results) {
      fileContent += `- ${r.name}: ok=${r.ok} status=${r.status} duration=${r.duration}ms size=${r.size}b\n`
      if (r.preview && r.preview.length > 0) fileContent += `  preview: ${r.preview.replace(/\n/g, ' ')}${r.bodyText && r.bodyText.length > 1000 ? '... (truncated)' : ''}\n`
      if (r.bodyText) {
        fileContent += `  body: ${r.bodyText.slice(0, 5000)}${r.bodyText.length > 5000 ? '... (truncated)' : ''}\n`
      }
    }

    try {
      const dir = path.dirname(LOG_FILE)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(LOG_FILE, fileContent + '\n', 'utf8')
    } catch (e) {
      console.error('Failed to write log file:', e.message)
    }

    // Console output respects VERBOSE flag
    if (VERBOSE) {
      console.log('\nTest results summary:')
      for (const r of results) {
        console.log(`- ${r.name}: ok=${r.ok} status=${r.status} duration=${r.duration}ms size=${r.size}b`)
        if (r.preview && r.preview.length > 0) console.log(`  preview: ${r.preview.replace(/\n/g, ' ')}${r.bodyText && r.bodyText.length > 1000 ? '... (truncated)' : ''}`)
      }
      console.log(`\nFull detailed log saved to ${LOG_FILE}`)
    } else {
      console.log('\nTest results:')
      for (const r of results) console.log(`- ${r.name}: ok=${r.ok} status=${r.status}`)
      console.log(`\nDetailed log written to ${LOG_FILE} (set VERBOSE=true to print details)`)    
    }

    // Basic assertions (will throw on failure)
    for (const r of results) {
      assert(r.ok, `${r.name} failed (status ${r.status}) body=${JSON.stringify(r.body || r.bodyText)}`)
    }

    console.log('\nAll tests passed ✅ — detalles arriba')
  } catch (err) {
    console.error('\nTest failures:\n', err)

    // Save failure run details as well
    try {
      const failureContent = `Test run failure: ${new Date().toISOString()}\nTarget: ${BASE}\n\nError: ${err.stack || err.message}\n\nResults summary:\n` + results.map(r => `- ${r.name}: ok=${r.ok} status=${r.status} duration=${r.duration}ms size=${r.size}b`).join('\n') + '\n'
      fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
      fs.appendFileSync(LOG_FILE, failureContent + '\n', 'utf8')
    } catch (e) {
      console.error('Failed to append failure to log file:', e.message)
    }

    console.log('\nResults summary:')
    for (const r of results) console.log(`- ${r.name}: ok=${r.ok} status=${r.status}`)
    process.exitCode = 1
    return
  }
}

runTests().catch(err => {
  console.error(err)
  process.exitCode = 2
})