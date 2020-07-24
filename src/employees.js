import fs from 'fs';
import minimist from 'minimist';
import lodash from 'lodash';

import {
  messageType, whatsappIds, checkPrepend, checkValidId,
} from './helpers.js';
import { Group, Consumer } from './database.js';

const settings = JSON.parse(fs.readFileSync('./dist/app-settings.json'));

async function addGroupId(groupId) {
  const newGroup = new Group({ number: groupId });
  await newGroup.save().catch((err) => {
    throw err;
  });
}

const commandsHelp = {
  help: {
    message: '*veg -h*. Devuelve posibles comandos',
  },
  setGroup: {
    message: '*veg --setgroup*. Establece el grupo como grupo principal',
  },
  setName: {
    message: '*veg --setname nombre*. Si envias el comando respondiendo a un cliente, establece el nombre del cliente',
  },
  setAddress: {
    message: '*veg --setdir -c calle -n numero*. Si envias el comando respondiendo a un cliente, establece la direccion del cliente.',
  },
  info: {
    message: '*veg --info*. Si envias el comando respondiendo a un cliente, indica informacion del cliente.',
  }
};

// Process all employee commands uses minimist to get which flags have been triggered.
export const employeeCommands = async (message, client) => {
  const options = {
    boolean: ['--setgroup', '--help', '--setdir', '--calle', '--numero', '--setname', '--info'],
    alias: {
      h: 'help',
      c: 'calle',
      n: 'numero',
      i: 'info',
    },
  };

  // Check if employee is actually using any commands.
  if (checkPrepend(message.body)) {
    const args = minimist(message.body.split(' ').slice(1), options);
    if (message.hasQuotedMsg) {
      const quoted = await message.getQuotedMessage().catch((err) => { throw err; });
      const respondTo = quoted.body.split(':')[0];
      if (checkValidId(respondTo)) {
        if (args.setname) {
          if (typeof args.setname === 'string') {
            const consumer = await Consumer.findOne({ number: respondTo })
              .catch((err) => { throw err; });
            if (consumer === null) {
              message.reply('No existe el cliente en la base de datos.');
              return;
            }
            consumer.name = args.setname;
            await consumer.save().catch(() => {
              message.reply('El nombre del cliente no ha sido guardado.');
              throw new Error('Unable to save client');
            });
            message.reply('El nombre del cliente ha sido guardado.');
            return;
          }
          message.reply('No ha ingresado el nombre del cliente');
          return;
        }
        if (args.setdir) {
          if (!args.calle || typeof args.calle !== 'string') {
            message.reply('No ha ingresado la calle del cliente');
            return;
          }
          if (!args.numero || typeof args.numero !== 'number') {
            message.reply('No ha ingresado el numero de la calle del cliente');
            return;
          }
          const consumer = await Consumer.findOne({ number: respondTo })
            .catch((err) => { throw err; });
          if (consumer === null) {
            message.reply('No existe el cliente en la base de datos.');
            return;
          }
          consumer.address = `${args.calle} ${args.numero}`;
          await consumer.save().catch(() => {
            message.reply('La direccion del cliente no ha sido guardado.');
            throw new Error('Unable to save client');
          });
          message.reply('La direccion del cliente ha sido guardado.');
          return;
        }
        if (args.info) {
          const consumer = await Consumer.findOne({ number: respondTo })
            .catch((err) => { throw err; });
          if (consumer === null) {
            message.reply('El cliente no esta en la base de datos.');
            return;
          }
          let string = `Informacion de ${respondTo}:\n`;
          if ('address' in consumer && typeof consumer.address !== 'undefined') {
            string = string.concat(`Direccion: ${consumer.address}\n`);
          } else {
            string = string.concat('No hay informacion de su direccion\n');
          }
          if ('name' in consumer && typeof consumer.name !== 'undefined') {
            string = string.concat(`Nombre: ${consumer.name}`);
          } else {
            string = string.concat('No hay informacion de su nombre');
          }
          message.reply(string);
          return;
        }
      } else {
        message.reply('No estas respondiendo a un numero valido.');
        return;
      }
    } else if (args.setdir || args.setname || args.info) {
      message.reply('Tiene que responder a un mensaje del cliente');
      return;
    }

    if (args.setgroup) {
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
  } else if (message.hasQuotedMsg) {
    const quoted = await message.getQuotedMessage().catch((err) => { throw err; });
    const respondTo = quoted.body.split(':')[0];
    if (checkValidId(respondTo)) {
      client.sendMessage(respondTo, message.body);
    } else {
      message.reply('No estas respondiendo a un numero valido.');
    }
  }
};

export const isEmployee = async function checkifEmployee(message) {
  const groups = await Group.find().catch((err) => { throw err; });
  const isInDb = groups.some(({ number }) => number === message.from);
  return isInDb;
};
