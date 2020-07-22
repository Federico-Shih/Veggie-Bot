import minimist from 'minimist';
import pkg from 'whatsapp-web.js';
import mime from 'mime-types';
import fs from 'fs';
import util from 'util';

import { group } from 'console';
import {
  messageType, whatsappIds, checkPrepend, groupBy,
} from './helpers.js';
import { Consumer } from './database.js';
import { getPhotos } from './photos-manager.js';

const readdir = util.promisify(fs.readdir);

const { MessageMedia } = pkg;

const commandsHelp = {
  help: {
    message: 'veg -h. Devuelve posibles comandos',
  },
};

const settings = JSON.parse(fs.readFileSync('./app-settings.json'));

export const consumerCommands = async (message, client) => {
  if (messageType(message.from) !== whatsappIds.group) {
    const consumerResult = await Consumer.findOne({ number: message.from });
    if (consumerResult === null) {
      const newConsumer = new Consumer({ number: message.from });
      await newConsumer.save().catch((err) => { throw err; });
      client.sendMessage(message.from,
        `Buenos días! Soy el nuevo bot de Veggie Club!
        \nSi busca consultar el menú, puede pedirmelo mandando el mensaje *veg --menu*.
        \nSi quiere hacer un pedido, escriba y dentro de poco será respondido por uno.`);
    } else if (checkPrepend(message.body)) {
      const options = {
        boolean: ['--menu', '--cat'],
        alias: {
          m: 'menu',
          c: 'cat',
        },
      };
      const args = minimist(message.body.split(' ').slice(1), options);

      if (args.menu) {
        const currentDay = new Date(new Date().toLocaleString('en-US', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })).getDay();
        const todayPhotos = await getPhotos(currentDay).catch((err) => { throw new Error('Error getting photos.'); });
        if (todayPhotos.length === 0) message.reply('Disculpe, no esta disponible el menu de hoy');
        else {
          const foodMap = groupBy(todayPhotos, (photo) => photo.category);
          let menu = 'Menu del dia de Veggie Club:\n';
          Object.keys(foodMap).forEach((category) => {
            menu = menu.concat(`${category}: \n`);
            foodMap[category].forEach((food) => {
              menu = menu.concat(`${food.name}: ${settings['cdn-link']}${food.path}`);
            });
          });
          message.reply(menu);
        }
      } else if (args.cat) {
        const photoList = await readdir(`${settings.photosPath}/cat`).catch((err) => { throw err; });
        const appendFile = `${settings.photosPath}/cat/${photoList[Math.floor(Math.random() * photoList.length)]}`;
        const newPhoto = MessageMedia.fromFilePath(appendFile);
        client.sendMessage(message.from, newPhoto);
      }
    }
  }
};

export const temp = null;
