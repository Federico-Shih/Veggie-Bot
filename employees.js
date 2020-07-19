import fs from 'fs';
import minimist from 'minimist';

import { messageType, whatsappIds, checkPrepend } from './helpers.js';

const settings = JSON.parse(fs.readFileSync('./app-settings.json'));

function setGroupId(groupId) {
  const filter = JSON.parse(fs.readFileSync('./filter.json'));
  filter.group = groupId;
  fs.writeFileSync('./filter.json', JSON.stringify(filter));
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
      console.log("Main group has been set");
      setGroupId(message.from);
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

export const isEmployee = function checkifEmployee(message) {
  const filter = JSON.parse(fs.readFileSync('./filter.json'));
  if (filter.group === message.from) {
    return true;
  }
  return false;
};

export const employeeFunctions = (message, client) => {

};
