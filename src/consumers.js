import minimist from 'minimist';
import pkg from 'whatsapp-web.js';
import fs from 'fs';
import util from 'util';

import {
  messageType, whatsappIds, checkPrepend, groupBy, removeDiacritics, capitalize,
} from './helpers.js';
import { Consumer, Group } from './database.js';
import { getPhotos } from './photos-manager.js';

const readdir = util.promisify(fs.readdir);

const { MessageMedia } = pkg;

const commandsHelp = {
  help: {
    message: '*veg help*. Devuelve posibles comandos',
  },
  menu: {
    message: '*veg menu*. Devuelve el menu del día. Si utilizas \n*veg menu --dia lunes*\n te devuelve el menu de tal dia',
  },
  cat: {
    message: '*veg cat*. Tu gato diario',
  },
};

// Get app settings
const settings = JSON.parse(fs.readFileSync('./dist/app-settings.json'));

// Receives a message and a client if the message.from is a consumer
export const consumerCommands = async (message, client) => {
  // Checks that it does not come from a group
  if (messageType(message.from) !== whatsappIds.group) {
    // Checks that consumer is not present
    const consumerResult = await Consumer.findOne({ number: message.from });
    if (consumerResult === null) {
      // Saves consumer in database and sends introductory message
      const newConsumer = new Consumer({ number: message.from });
      await newConsumer.save().catch((err) => { throw err; });
      client.sendMessage(message.from,
        `Buenos días! Soy el nuevo bot de Veggie Club!
        \nSi busca consultar el menú, puede pedirmelo mandando el mensaje\n*veg menu*.
        \nSi quiere hacer un pedido, escriba y dentro de poco será respondido por uno.`);
    } else if (checkPrepend(message.body)) {
      // Checks if the consumer has sent a command
      const options = {
        boolean: ['--dia'],
        alias: {
          d: 'dia',
        },
      };
      const commands = message.body.split(' ');
      const args = minimist(commands.slice(2), options);
      if (commands.length < 2) {
        message.reply(`No haz ingresado un comando. ${commandsHelp.help}`);
        return;
      }

      // Parses the args sent and redirects
      if (commands[1] === 'menu') {
        let currentDay = -1;
        // Gets current date and get the photos from that day
        if (typeof args.dia === 'string' || args.dia instanceof String) {
          const normalizedString = removeDiacritics(args.dia).toLowerCase();
          const mapper = {
            domingo: 0,
            lunes: 1,
            martes: 2,
            miercoles: 3,
            jueves: 4,
            viernes: 5,
            sabado: 6,
          };
          if (!Object.prototype.hasOwnProperty.call(mapper, normalizedString)) {
            message.reply('Disculpe, ese no es un dia valido.');
            return;
          }
          currentDay = mapper[normalizedString];
        } else {
          currentDay = new Date(new Date().toLocaleString('en-US', {
            timeZone: 'America/Argentina/Buenos_Aires',
          })).getDay();
        }
        const todayPhotos = await getPhotos(currentDay).catch(() => { throw new Error('Error getting photos.'); });
        if (todayPhotos.length === 0) message.reply('Disculpe, no esta disponible el menu de hoy');
        else {
          // Groups photos by category
          const foodMap = groupBy(todayPhotos, (photo) => photo.category.trim().toLowerCase());
          let menu = 'Menu del día de Veggie Club:\n\n';
          // Creates menu by category
          Object.keys(foodMap).forEach((category) => {
            menu = menu.concat(`*${capitalize(category)}*: \n\n`);
            foodMap[category].forEach((food) => {
              menu = menu.concat(`${food.name}: ${settings['cdn-link']}${food.path}\n`);
            });
            client.sendMessage(message.from, menu);
            menu = '';
          });
        }
      } else if (commands[1] === 'cat') {
        // Returns a random cat
        const photoList = await readdir(`${settings.photosPath}/cat`).catch((err) => { throw err; });
        const appendFile = `${settings.photosPath}/cat/${photoList[Math.floor(Math.random() * photoList.length)]}`;
        const newPhoto = MessageMedia.fromFilePath(appendFile);
        client.sendMessage(message.from, newPhoto);
      } else if (commands[1] === 'help') {
        let string = 'Comandos existentes:\n ----------------- \n';
        Object.entries(commandsHelp).forEach((command) => {
          if (Object.prototype.hasOwnProperty.call(command[1], 'message')) {
            string = string.concat(`» ${command[0]}: ${command[1].message}. \n`);
          }
        });
        client.sendMessage(message.from, string);
      }
    } else {
      const groups = await Group.find().catch((err) => { throw err; });
      const consumer = await Consumer.findOne({ number: message.from })
        .catch((err) => { throw err; });
      let name = '';
      if (typeof consumer.name !== 'undefined') {
        name = consumer.name;
      }
      groups.forEach(({ number }) => {
        const messageContent = `${message.from}: ${name}\n${message.body}`;
        client.sendMessage(number, messageContent);
      });
    }
  }
};

export const temp = null;
