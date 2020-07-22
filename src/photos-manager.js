import { v4 as uuid } from 'uuid';
import fs from 'fs';
import util from 'util';

import { Food } from './database.js';
import { getImageExtension } from './helpers.js';

const settings = JSON.parse(fs.readFileSync('./app-settings.json'));

const readdir = util.promisify(fs.readdir);

export async function addPhoto(inImagePath, name, category, day) {
  const images = await readdir(`${settings.photosPath}/temp`).catch((err) => { throw new Error(err.message, 'Error loading images'); });
  if (images.includes(inImagePath)) {
    if (!fs.existsSync(`${settings.photosPath}/food`)) {
      fs.mkdirSync(`${settings.photosPath}/${category}`);
    }
    const foodUuid = uuid();
    const newPath = `${foodUuid}.${getImageExtension(inImagePath)}`;
    const newFood = new Food({
      path: newPath,
      name,
      category,
      day,
    });
    await newFood.save().catch((err) => {
      throw new Error('Unable to save new food');
    });
    fs.rename(`${settings.photosPath}/temp/${inImagePath}`, `${settings.photosPath}/food/${newPath}`, (err) => {
      if (err) throw err;
    });
  } else {
    throw new Error('That is not a valid image path');
  }
}

export async function getPhotos(day) {
  if (day > 6 || day < -1) {
    throw new Error('Wrong day parametres');
  }
  const foods = await Food.find({ day: { $in: [day] } }).catch((err) => { throw err; });
  const permanentFoods = await Food.find({ day: { $in: [-1] } }).catch((err) => { throw err; });

  return foods.concat(permanentFoods);
}

export async function replacePhoto(inImagePath, imageId) {
  const image = await Food.findOne({ _id: imageId }).catch((err) => { throw err; });
  if (Object.entries(image).length === 0) {
    console.log('That image is not in the database');
  } else {
    fs.rename(inImagePath, `${settings.photosPath}/${image.category}/${image.path}`, (err) => {
      if (err) throw err;
    });
  }
}

export async function removePhoto(imageId) {
  const image = await Food.findOne({ _id: imageId }).catch((err) => { throw err; });
  if (Object.entries(image).length === 0) {
    console.log('That image is not in the database.');
  } else {
    await Food.deleteOne({ _id: imageId }).catch(
      (err) => { throw new Error(err, 'Element not in database'); },
    );
    fs.unlink(image.path, (err) => {
      throw err;
    });
  }
}

export async function photoExporter() {
  const json = JSON.parse(fs.readFileSync('./photos.json'));
  json.forEach((x) => { addPhoto(x.oldName, x.name, x.category, x.day); });
}
