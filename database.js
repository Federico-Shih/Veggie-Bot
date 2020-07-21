import mongoose from 'mongoose';

const { Schema, model: Model } = mongoose;

mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const IdSchema = new Schema({
  number: String,
});

const PhotoSchema = new Schema({
  path: String,
  name: String,
  category: String,
  day: {
    type: Number,
    min: -1,
    max: 6,
    default: -1,
  },
});

export const Group = Model('Groups', IdSchema);
export const Consumer = Model('Clients', IdSchema);
export const Food = Model('Foods', PhotoSchema);
