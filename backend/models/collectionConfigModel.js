import { Schema, model } from "mongoose";

const collectionConfigSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const CollectionConfig = model("collectionConfig", collectionConfigSchema);
export default CollectionConfig;
