import minimist from 'minimist';
import pkg from 'whatsapp-web.js';
import mime from 'mime-types';
import fs from 'fs';
import util from 'util';

import {
  messageType, whatsappIds, checkPrepend, groupBy,
} from './helpers.js';
import { Consumer, Group } from './database.js';
import { getPhotos } from './photos-manager.js';

const readdir = util.promisify(fs.readdir);

const { MessageMedia } = pkg;

/*
const commandsHelp = {
  help: {
    message: 'veg -h. Devuelve posibles comandos',
  },
};
*/
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
        \nSi busca consultar el menú, puede pedirmelo mandando el mensaje *veg --menu*.
        \nSi quiere hacer un pedido, escriba y dentro de poco será respondido por uno.`);
    } else if (checkPrepend(message.body)) {
      // Checks if the consumer has sent a command
      const options = {
        boolean: ['--menu', '--cat'],
        alias: {
          m: 'menu',
          c: 'cat',
        },
      };
      const args = minimist(message.body.split(' ').slice(1), options);

      // Parses the args sent and redirects
      if (args.menu) {
        // Gets current date and get the photos from that day
        const currentDay = new Date(new Date().toLocaleString('en-US', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })).getDay();
        const todayPhotos = await getPhotos(currentDay).catch((err) => { throw new Error('Error getting photos.'); });
        if (todayPhotos.length === 0) message.reply('Disculpe, no esta disponible el menu de hoy');
        else {
          // Groups photos by category
          const foodMap = groupBy(todayPhotos, (photo) => photo.category);
          let menu = 'Menu del dia de Veggie Club:\n';
          // Creates menu by category
          Object.keys(foodMap).forEach((category) => {
            menu = menu.concat(`${category}: \n`);
            foodMap[category].forEach((food) => {
              menu = menu.concat(`${food.name}: ${settings['cdn-link']}${food.path}`);
            });
          });
          message.reply(menu);
        }
      } else if (args.cat) {
        // Returns a random cat
        const photoList = await readdir(`${settings.photosPath}/cat`).catch((err) => { throw err; });
        const appendFile = `${settings.photosPath}/cat/${photoList[Math.floor(Math.random() * photoList.length)]}`;
        const newPhoto = MessageMedia.fromFilePath(appendFile);
        client.sendMessage(message.from, newPhoto);
      }
    } else {
      const groups = await Group.find().catch((err) => { throw err; });
      groups.forEach(({ number }) => {
        const messageContent = `${message.from}:\n${message.body}`;
        client.sendMessage(number, messageContent);
      });
    }
  }
};

export const temp = null;
