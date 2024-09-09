import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import util from 'util';
import { exec } from 'child_process';
import { networkInterfaces } from 'os';
import * as dotenv from 'dotenv';

// For Vite environment the env variables need a VITE_ prefix to be exposed client side

dotenv.config();

const PORT = process.env.VITE_DEBUGGER_SERVER_PORT;

// Write Debugger IP
const debuggerIp = getDebuggerIp();
writeDebuggerIP();

function getDebuggerIp() {
    const networks = networkInterfaces();
    const debuggerIp = networks.en0.filter((item) => {
        return item.family === 'IPv4';
    })[0].address;
    return debuggerIp;
}

function writeDebuggerIP() {
    const envFileContent = fs.readFileSync('./.env', 'utf8');
    const envFileLines = envFileContent.split('\n');

    let debuggerLineFounded = false;

    for (let i = 0; i < envFileLines.length; i++) {
        if (envFileLines[i].includes('VITE_DEBUGGER_SERVER_IP')) {
            envFileLines[i] = `VITE_DEBUGGER_SERVER_IP=${debuggerIp}`;
            debuggerLineFounded = true;
        }
    }

    if (debuggerLineFounded) {
        const newEnvFileContent = envFileLines.join('\n');
        fs.writeFileSync('./.env', newEnvFileContent, 'utf-8');
    } else {
        console.error('\nVITE_DEBUGGER_SERVER_IP env variable was not found, creating it at the end of the file\n');
        envFileLines.push(`VITE_DEBUGGER_SERVER_IP=${debuggerIp}`);
        const newEnvFileContent = envFileLines.join('\n');
        fs.writeFileSync('./.env', newEnvFileContent, 'utf-8');
    }
}

// Init server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(cors({ origin: '*' }));

app.listen(PORT, () => {
    console.log(`\n🟢 Debugger server running on http://${debuggerIp}:${PORT}\n`);
});

app.post('/save', (req, res) => {
    const body = req.body;
    const file = body.file;

    fs.writeFileSync(file, 'export default ' + util.inspect(body.data, false, 7, false) + ';', 'utf-8');
    exec(`npx eslint --fix ${file}`);

    res.sendStatus(200);
});

app.get('/check', (req, res) => {
    res.send('check');
});
