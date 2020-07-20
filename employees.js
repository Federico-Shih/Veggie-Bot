import fs from 'fs';
import minimist from 'minimist';

import { messageType, whatsappIds, checkPrepend } from './helpers.js';
import { Group } from './database.js';

const settings = JSON.parse(fs.readFileSync('./app-settings.json'));

async function addGroupId(groupId) {
  const newGroup = new Group({ number: groupId });
  await newGroup.save().catch((err) => {
    throw err;
  });
}

export const commandsHelp = {
  help: {
    message: 'veg -h. Devuelve posibles comandos',
  },
  setgroup: {
    message: 'veg --setgroup. Establece el grupo como grupo principal',
  },
};

// Process all employee commands uses minimist to get which flags have been triggered.
export const employeeCommands = (message, client) => {
  const options = {
    boolean: ['--setgroup', '--help'],
    alias: {
      h: 'help',
    },
  };

  if (checkPrepend(message.body)) {
    const args = minimist(message.body.split(' ').slice(1), options);
    if (args.setgroup) {
      console.log('Main group has been set');
      addGroupId(message.from);
      message.reply('Este grupo se ha designado como el grupo principal.');
    } else if (args.help) {
      let string = 'Comandos existentes:\n ----------------- \n';
      Object.entries(commandsHelp).forEach((command) => {
        if (Object.prototype.hasOwnProperty.call(command[1], 'message')) {
          string = string.concat(`» ${command[0]}: ${command[1].message}. \n`);
        }
      });
      client.sendMessage(message.from, string);
    } else {
      client.sendMessage(message.from, 'Lista de comandos: veg -h');
    }
  }
};

export const isEmployee = async function checkifEmployee(message) {
  const groups = await Group.find().catch((err) => { throw err; });

  return groups.some(({ number }) => number === message.from);
};

export const employeeFunctions = (message, client) => {

};
