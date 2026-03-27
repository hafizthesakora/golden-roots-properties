import 'server-only';
import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export const connectDB = () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI environment variable');

  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  return global._mongooseConn;
};
