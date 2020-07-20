import { Group } from './database.js';

const newGroup = new Group({ number: '10000' });
newGroup.save((err, doc) => {
  if (err) throw err;
  console.log(doc);
});

async function search() {
  const searchres = await Group.find();
  console.log(searchres);
}

search();
// wait();
