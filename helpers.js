import lodash from 'lodash';
import fs from 'fs';

const settings = JSON.parse(fs.readFileSync('./app-settings.json'));

export const messageType = (id) => id.split('@')[1];

export const whatsappIds = {
  contact: 'c.us',
  group: 'g.us',
};

export const checkPrepend = (message) => {
  if (message.split(' ')[0] === settings.prepend) {
    return true;
  }
  return false;
};
