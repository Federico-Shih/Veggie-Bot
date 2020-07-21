import axios from 'axios';
import fs from 'fs';
import util from 'util';
import mongoose from 'mongoose';
import inquirer from 'inquirer';
import minimist from 'minimist';

import { getImageExtension } from './helpers.js';
import { addPhoto } from './photos-manager.js';

const readdir = util.promisify(fs.readdir);

const options = {
  boolean: ['--setgroup'],
  string: ['--menu'],
  alias: {
    h: 'help',
    m: 'menu',
  },
};

// const args = minimist('--menu=hi'.split(' '), options);
// console.log(typeof args.menu);

// const readdir = util.promisify(fs.readdir);

// console.log(getImageExtension('lalala/sdakdsa./lol.png'));

/*
const questions = [{
  type: 'input',
  name: 'name',
  message: 'Photo tag?',
},
{
  type: 'input',
  name: 'category',
  message: 'Photo category?',
},
{
  type: 'confirm',
  name: 'confirm',
  message: 'Confirm?',
}];

async function photoCataloger() {
  const images = await readdir('./photos/temp');
  const list = [];
  images.forEach((image) => {
    const object = {};
    object.category = '';
    object.name = '';
    object.oldName = image;
    object.day = -1;
    list.push(object);
  });

  const jsonString = JSON.stringify(list);
  fs.writeFileSync('./photos.json', jsonString);
}

async function photoExporter() {
  const json = JSON.parse(fs.readFileSync('./photos.json'));
  json.forEach((x) => { addPhoto(x.oldName, x.name, x.category, x.day); });
}

// photoExporter();
photoCataloger();
*/
/*
async function downloadPhoto() {
  const res = await axios({
    method: 'get',
    url: 'https://api.thecatapi.com/v1/images/search',
  }).catch('Error connecting to api');

  const { url, id } = res.data[0];
  const photoPath = url.split('.');
  const photoExtension = photoPath[photoPath.length - 1];

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url,
      responseType: 'stream',
    })
      .then((response) => {
        response.data.pipe(fs.createWriteStream(`./photos/cat/${id}.${photoExtension}`));
        resolve(`${id}.${photoExtension}`);
      })
      .catch('Error downloading photo');
  });
}
*/
// search();
// wait();
