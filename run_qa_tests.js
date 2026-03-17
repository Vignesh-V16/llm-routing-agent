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
    console.log("🚀 Starting E2E QA Validation on Production MoE Router...\n");

    const tests = [
        { name: 'A. Coding', query: 'Write Java code for quicksort' },
        { name: 'B. Summarization', query: 'Summarize this paragraph: Artificial Intelligence is transforming industries rapidly by automating workflows, enhancing decision-making, and creating entirely new product categories.' },
        { name: 'C. Real-time / Search', query: 'What is the latest AI news today?' },
        { name: 'D. General knowledge', query: 'Explain gravity in simple terms' },
        { name: 'E. Simple query', query: 'Hi' },
        { name: 'F. Multi-model Execution', query: 'Compare machine learning, deep learning, and AI with examples. I need a very detailed technical breakdown.' }
    ];

    for (const test of tests) {
        console.log(`\n⏳ Running Test: ${test.name}`);
        console.log(`   Query: "${test.query}"`);
        const result = await makeRequest(test.name, test.query);
        
        console.log(`   HTTP Status: ${result.status}`);
        console.log(`   RTT Latency: ${result.latency}ms`);
        
        try {
            const json = JSON.parse(result.data);
            console.log(`   Model Used: ${json.modelUsed}`);
            console.log(`   Secondary Model: ${json.secondaryModel || 'N/A'}`);
            console.log(`   Fallback Used: ${json.fallbackUsed}`);
            console.log(`   Internal Latency: ${json.latencyMs}ms`);
            console.log(`   Response Preview: ${json.answer ? json.answer.substring(0, 100).replace(/\n/g, ' ') + '...' : 'EMPTY'}`);
            if (result.status !== 200) console.log(`   Raw Data: ${result.data}`);
        } catch (e) {
            console.log(`   Parse Error! Raw Data: ${result.data}`);
        }
    }
    
    console.log('\n\n⏳ Running Cache Validation Test...');
    console.log('   Query: "Explain gravity in simple terms" (Second time)');
    const cacheResult = await makeRequest('Cache Test', 'Explain gravity in simple terms');
    console.log(`   HTTP Status: ${cacheResult.status}`);
    console.log(`   RTT Latency: ${cacheResult.latency}ms`);
    try {
        const json = JSON.parse(cacheResult.data);
         console.log(`   Internal Latency: ${json.latencyMs}ms`);
    } catch(e){}

    console.log("\n=========================================");
    console.log("🏁 QA Validation Execution Completed.");
    console.log("=========================================");
}

runAllTests();
