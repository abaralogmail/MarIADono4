/**
 * Test for the new External Request Webhook
 * 
 * Usage: node src/tests/Test_ExternalRequest.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EXTERNAL_TOKEN = process.env.EXTERNAL_TOKEN || 'config_this_in_env';

async function runTest() {
    console.log(`Starting test for /v1/external-request against ${BASE_URL}...`);

    try {
        // 1. Test Unauthorized access
        console.log('Testing unauthorized access...');
        const resUnauthorized = await fetch(`${BASE_URL}/v1/external-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                number: '5493812010781',
                message: 'Should fail',
                token: 'wrong_token'
            })
        });
        if (resUnauthorized.status === 401) {
            console.log('✅ Unauthorized access correctly rejected.');
        } else {
            console.error('❌ Unauthorized access was NOT rejected correctly:', resUnauthorized.status);
        }

        // 2. Test Success
        console.log('Testing successful request...');
        const resSuccess = await fetch(`${BASE_URL}/v1/external-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                number: '5493812010781',
                message: 'Hola desde aplicación externa! — Prueba automatizada',
                token: EXTERNAL_TOKEN
            })
        });
        
        const data = await resSuccess.json();
        if (resSuccess.ok && data.status === 'triggered') {
            console.log('✅ Successful request triggered correctly.');
            console.log('Response:', data);
        } else {
            console.error('❌ Successful request FAILED:', resSuccess.status, data);
        }

        // 3. Test Missing fields
        console.log('Testing missing fields...');
        const resMissing = await fetch(`${BASE_URL}/v1/external-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                number: '5493812010781',
                token: EXTERNAL_TOKEN
            })
        });
        if (resMissing.status === 400) {
            console.log('✅ Missing fields correctly rejected.');
        } else {
            console.error('❌ Missing fields was NOT rejected correctly:', resMissing.status);
        }

    } catch (error) {
        console.error('❌ Test execution error:', error.message);
    }
}

runTest();
