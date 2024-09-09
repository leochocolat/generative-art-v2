// Utils
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { SerialPort } = require('serialport');

// Config
require('dotenv').config();

// Open Serial port
const port = new SerialPort({
    path:  '/dev/cu.usbserial-120',
    // path:  '/dev/cu.usbserial-120',
    baudRate: 28800,
});

port.on('open', () => {
    console.log('Serial port open');
});

// Configure server
const serverPort = 6842;
const app = express();
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));
app.use(cors({ origin: '*' }));

app.listen(serverPort, () => {
    console.log(`Server running on port http://localhost:${serverPort}\n`);
});

app.post('/send', (req, res) => {
    const buffer = req.body;
    
    res.sendStatus(200);

    // Decode the RGBA color values
    // const red = buffer.readUInt8(0);
    // const green = buffer.readUInt8(1);
    // const blue = buffer.readUInt8(2);
    // const alpha = buffer.readUInt8(3);

    port.write(buffer, (err) => {
        if (err) return console.log('Error on write: ', err.message);
    });
});

// Listen serial port data reception
port.on('data', (data) => {
    console.log(data.toString());
});

// port.on('readable', function() {
//     console.log('Data:', port.read().toString());
// });
