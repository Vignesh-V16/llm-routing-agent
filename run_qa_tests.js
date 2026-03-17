const https = require('https');

const API_KEY = 'my-secret-key-123';
const HOSTNAME = 'llm-routing-agent.onrender.com';
const PATH = '/api/v1/router/query';

function makeRequest(queryName, queryText) {
    return new Promise((resolve) => {
        const body = JSON.stringify({ query: queryText });
        const options = {
            hostname: HOSTNAME,
            port: 443,
            path: PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const startTime = Date.now();
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const latency = Date.now() - startTime;
                resolve({
                    name: queryName,
                    status: res.statusCode,
                    latency: latency,
                    data: data,
                    query: queryText
                });
            });
        });

        req.on('error', (e) => {
            resolve({
                name: queryName,
                status: 'ERROR',
                error: e.message,
                query: queryText
            });
        });

        req.write(body);
        req.end();
    });
}

async function runAllTests() {
    console.log("🚀 Starting FINAL E2E QA Validation on Production MoE Router...\n");

    const tests = [
        { name: '1. Basic Functional', query: 'Explain binary search' },
        { name: '2A. Model Routing - Coding', query: 'Write Java code for quicksort' },
        { name: '2B. Model Routing - Summarization', query: 'Summarize this paragraph: AI is transforming the world rapidly by automating workflows.' },
        { name: '2C. Model Routing - Realtime/Search', query: 'Latest AI news today' },
        { name: '2D. Model Routing - General', query: 'Explain gravity' },
        { name: '2E. Model Routing - Simple', query: 'Hi' },
        { name: '4. Error Handling - Empty', query: '' }
    ];

    for (const test of tests) {
        console.log(`\n⏳ Running Test: ${test.name}`);
        console.log(`   Query: "${test.query}"`);
        const result = await makeRequest(test.name, test.query);
        
        console.log(`   HTTP Status: ${result.status}`);
        console.log(`   RTT Latency: ${result.latency}ms`);
        
        try {
            const json = JSON.parse(result.data);
            if(json.modelUsed) console.log(`   Model Used: ${json.modelUsed}`);
            if(json.secondaryModel) console.log(`   Secondary Model: ${json.secondaryModel}`);
            if(json.fallbackUsed !== undefined) console.log(`   Fallback Used: ${json.fallbackUsed}`);
            if(json.latencyMs) console.log(`   Internal Latency: ${json.latencyMs}ms`);
            
            if(json.answer) {
                 console.log(`   Response Preview: ${json.answer.substring(0, 100).replace(/\\n/g, ' ')}...`);
            } else if (json.error || json.message) {
                 console.log(`   Error Message: ${json.error || json.message}`);
            }
            if (result.status !== 200 && result.status !== 400) console.log(`   Raw Data: ${result.data}`);
        } catch (e) {
            console.log(`   Raw Data: ${result.data}`);
        }
    }
    
    console.log('\n\n⏳ Running Test 5: Cache Validation...');
    console.log('   Query: "Explain binary search" (Second time)');
    const cacheResult = await makeRequest('Cache Test', 'Explain binary search');
    console.log(`   HTTP Status: ${cacheResult.status}`);
    console.log(`   RTT Latency: ${cacheResult.latency}ms`);
    try {
        const json = JSON.parse(cacheResult.data);
         console.log(`   Internal Latency: ${json.latencyMs}ms`);
    } catch(e){}

    console.log("\n=========================================");
    console.log("🏁 Final QA Validation Execution Completed.");
    console.log("=========================================");
}

runAllTests();
