import fs from 'fs';
import minimist from 'minimist';
import lodash from 'lodash';

import {
  messageType, whatsappIds, checkPrepend, checkValidId,
} from './helpers.js';
import { Group, Consumer } from './database.js';

const settings = JSON.parse(fs.readFileSync('./dist/app-settings.json'));

async function addGroupId(groupId) {
  const checkGroup = await Group.find({ number: groupId }).catch(() => {
    throw new Error('Error buscando el grupo');
  });
  if (checkGroup.length === 0) {
    const newGroup = new Group({ number: groupId });
    await newGroup.save().catch(() => {
      throw new Error('Error guardando el grupo.');
    });
  } else {
    throw new Error('Este grupo ya ha sido agregado.');
  }
}

async function removeGroupId(groupId) {
  const group = await Group.findOne({ number: groupId })
    .catch(() => { throw new Error('Error buscando en la base de datos. '); });
  if (group !== null) {
    await Group.deleteOne({ number: groupId })
      .catch(() => { throw new Error('El grupo no ha sido borrado'); });
  } else {
    throw new Error('El grupo no existe.');
  }
}

const commandsHelp = {
  help: {
    message: '*veg -h*. Devuelve posibles comandos',
  },
  setGroup: {
    message: '*veg setgroup*. Establece el grupo como grupo principal',
  },
  removeGroup: {
    message: '*veg removegroup*. Elimina el grupo de la base de datos.',
  },
  setName: {
    message: '*veg setname nombre*. Si envias el comando respondiendo a un cliente, establece el nombre del cliente',
  },
  setAddress: {
    message: '*veg setdir -c calle -n numero*. Si envias el comando respondiendo a un cliente, establece la direccion del cliente.',
  },
  info: {
    message: '*veg info*. Si envias el comando respondiendo a un cliente, indica informacion del cliente.',
  },
};

// Process all employee commands uses minimist to get which flags have been triggered.
export const employeeCommands = async (message, client) => {
  const options = {
    boolean: ['--help', '--calle', '--numero'],
    alias: {
      h: 'help',
      c: 'calle',
      n: 'numero',
    },
  };

  // Check if employee is actually using any commands.
  if (checkPrepend(message.body)) {
    const commands = message.body.split(' ');
    const args = minimist(commands.slice(1), options);
    if ((commands.length >= 2)) {
      if (typeof commands[1] !== 'string') {
        message.reply('No haz ingresado un comando valido');
      }
      const command = commands[1].toLowerCase();
      if (message.hasQuotedMsg) {
        const quoted = await message.getQuotedMessage().catch((err) => { throw err; });
        const respondTo = quoted.body.split(':')[0];
        if (checkValidId(respondTo)) {
          if (command === 'setname') {
            if (commands.length === 3) {
              if (typeof commands[2] === 'string') {
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
            }
            message.reply('No haz ingresado el nombre del cliente');
            return;
          }
          if (command === 'setdir') {
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
          if (command === 'info') {
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
      }
      if (command === 'setgroup') {
        addGroupId(message.from).then(() => {
          message.reply('Este grupo se ha designado como el grupo principal.');
        }).catch((err) => {
          message.reply(err.message);
        });
        return;
      }
      if (command === 'removegroup') {
        removeGroupId(message.from).then(() => {
          message.reply('Este grupo ha sido borrado.');
        }).catch((err) => {
          message.reply(err.message);
        });
        return;
      }
      if (args.help) {
        let string = 'Comandos existentes:\n ----------------- \n';
        Object.entries(commandsHelp).forEach((help) => {
          if (Object.prototype.hasOwnProperty.call(help[1], 'message')) {
            string = string.concat(`» ${help[0]}: ${help[1].message}. \n`);
          }
        });
        client.sendMessage(message.from, string);
        return;
      }
    }
    client.sendMessage(message.from, 'Lista de comandos: veg -h');
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
