import lodash from 'lodash';
import fs from 'fs';
import axios from 'axios';

export async function downloadCatPhoto() {
  const res = await axios({
    method: 'get',
    url: 'https://api.thecatapi.com/v1/images/search',
  }).catch('Error connecting to api');

  const { url } = res.data[0];
  const photoPath = url.split('.');
  const photoExtension = photoPath[photoPath.length - 1];
  // const isDownloaded = files.some((name) => name === `${id}.${photoExtension}`);

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url,
      responseType: 'stream',
    })
      .then((response) => {
        response.data.pipe(fs.createWriteStream(`./photos/randomcat.${photoExtension}`));
        resolve(`randomcat.${photoExtension}`);
      })
      .catch((err) => reject(err));
  });
}
const settings = JSON.parse(fs.readFileSync('./app-settings.json'));

export const messageType = (id) => id.split('@')[1];

export const whatsappIds = {
  contact: 'c.us',
  group: 'g.us',
};

export const checkPrepend = (message) => {
  if (settings.prepend.includes(message.split(' ')[0])) {
    return true;
  }
  return false;
};

export const getImageExtension = (imagePath) => {
  const imageList = imagePath.split('.');
  return imageList[imageList.length - 1];
};

// Copied bc lazy from https://stackoverflow.com/a/38327540
export const groupBy = (list, keyGetter) => {
  const map = {};
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map[key];
    if (!collection) {
      map[key] = [item];
    } else {
      map[key].push(item);
    }
  });
  return map;
};
