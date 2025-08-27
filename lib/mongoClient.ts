import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

if (!uri) {
  throw new Error("❌ Please add your Mongo URI to .env.local");
}

let client;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;