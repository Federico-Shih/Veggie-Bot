import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
import fs from 'fs';

import { messageType, whatsappIds } from './src/helpers.js';
import { employeeCommands, isEmployee } from './src/employees.js';
import { consumerCommands } from './src/consumers.js';
import { Group, Consumer } from './src/database.js';

const { Client } = pkg;
const SESSION_FILE_PATH = './session.json';

let restart = false;

if (process.argv[process.argv.length - 1] === 'restart') {
  restart = true;
}

let sessionJSON = null;

if (fs.existsSync(SESSION_FILE_PATH)) {
  if (!restart) {
    const stringJSON = fs.readFileSync(SESSION_FILE_PATH);
    sessionJSON = JSON.parse(stringJSON);
  }
} else {
  restart = true;
}

const client = new Client({
  session: sessionJSON,
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

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

client.on('message', async (message) => {
  const groups = await Group.find().catch((err) => { throw err; });
  if (groups.length === 0 && whatsappIds.group === messageType(message.from)) {
    employeeCommands(message, client);
  } else if (await isEmployee(message)) {
    await employeeCommands(message, client);
  } else {
    await consumerCommands(message, client);
  }
});

client.initialize();
