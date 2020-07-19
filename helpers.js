import lodash from 'lodash';
import fs from 'fs';

const settings = JSON.parse(fs.readFileSync('./app-settings.json'));

let filter = JSON.parse(fs.readFileSync('./filter.json'));

async function addClient(clientId) {
  const newFilter = lodash.cloneDeep(filter);
  newFilter.clients.push(clientId);
  await fs.writeFile('./filter.json', JSON.stringify(newFilter),
    (err) => {
      throw err;
    });
  filter = lodash.cloneDeep(newFilter);
}

function checkifClient(message, client) {
  if (!isEmployee && !filter.clients.includes(message.from)) {
    addClient(message.from);
    return true;
  }
}

export const isClient = checkifClient;

export const messageType = (id) => {
  return id.split("@")[1];
}

export const whatsappIds = {
  contact: 'c.us',
  group: 'g.us',
}

export const checkPrepend = (message) => {
  if (message.split(" ")[0] === settings.prepend) {
    return true;
  }
  return false;
}

