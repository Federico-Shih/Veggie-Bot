import mongoose from 'mongoose';

const { Schema, model: Model } = mongoose;

mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const IdSchema = new Schema({
  number: String,
});

export const Group = Model('Groups', IdSchema);
export const Consumer = Model('Clients', IdSchema);
