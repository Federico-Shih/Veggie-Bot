import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
import fs from 'fs';

import { messageType, whatsappIds } from './src/helpers.js';
import { employeeCommands, isEmployee } from './src/employees.js';
import { consumerCommands } from './src/consumers.js';
import { Group, Consumer } from './src/database.js';

const { Client } = pkg;
const SESSION_FILE_PATH = './session.json';

// Check if command sent is restart.
let restart = false;

if (process.argv[process.argv.length - 1] === 'restart') {
  restart = true;
}

let sessionJSON = null;

// Obtain session filepath if already in the system
if (fs.existsSync(SESSION_FILE_PATH)) {
  if (!restart) {
    const stringJSON = fs.readFileSync(SESSION_FILE_PATH);
    sessionJSON = JSON.parse(stringJSON);
  }
} else {
  restart = true;
}

// Start client with session or without if null
const client = new Client({
  session: sessionJSON,
});

// Generate qr code if not started with session JSON
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

// Client always authenticated. If there is not a session.json, save it.
client.on('authenticated', (session) => {
  if (restart) {
    const stringSession = JSON.stringify(session);
    fs.writeFile('session.json', stringSession, (err) => {
      if (err) throw err;
    });
  }
});

client.on('ready', () => {
  console.log('Client is ready!');
});

// Redirect the message depending on who sends it
client.on('message', async (message) => {
  const groups = await Group.find().catch((err) => { throw err; });
  // console.log(message);
  // console.log(await message.getQuotedMessage())
  if (groups.length === 0 && whatsappIds.group === messageType(message.from)) {
    employeeCommands(message, client);
  } else if (await isEmployee(message)) {
    await employeeCommands(message, client).catch((err) => {
      throw err;
    });
  } else {
    await consumerCommands(message, client).catch((err) => {
      throw err;
    });
  }
});

client.initialize();
