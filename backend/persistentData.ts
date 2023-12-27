// persistentData.ts

import mongoose, { Schema, Document } from 'mongoose';

interface IPersistentData extends Document {
  userId: string;
  parameters: any; // Adjust the type based on the actual parameters used
}

const PersistentDataSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  parameters: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

const PersistentData = mongoose.model<IPersistentData>('PersistentData', PersistentDataSchema);

export default PersistentData;
