import mongoose from 'mongoose';

const { Schema, model: Model } = mongoose;

mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const IdSchema = new Schema({
  number: String,
});

const ConsumerSchema = new Schema({
  number: String,
  name: String,
  address: String,
});

const PhotoSchema = new Schema({
  path: String,
  name: String,
  category: String,
  day: {
    type: Array,
  },
});

export const Group = Model('Groups', IdSchema);
export const Consumer = Model('Clients', ConsumerSchema);
export const Food = Model('Foods', PhotoSchema);
