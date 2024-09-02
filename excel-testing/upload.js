<<<<<<< HEAD
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri =
  "mongodb+srv://audora:audora@lottingcluster.yvd0tpe.mongodb.net/?retryWrites=true&w=majority&appName=Lottingcluster";
const dbName = "lotting";
const collectionName = "schedules";

const folderPath = "./exceldata/";

async function main() {
  const client = new MongoClient(uri, {});

  try {
    await client.connect();
    console.log("connected to Mongoose babburger");
=======
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb+srv://audora:audora@cluster0.rprrl8p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // MongoDB 서버 URI
const dbName = 'Cluster0';
const collectionName = 'test2';

const filePath = '1차.json';

const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('MongoDB connected.');
>>>>>>> 99393eb5251eba3dd8c7a9f064c2361d8be07e29

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

<<<<<<< HEAD
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const result = await collection.insertOne(jsonData);
      console.log(`Inserted file ${file} with ID: ${result.insertedId}`);
    }
  } catch (err) {
    console.error("err", err);
=======
    const result = await collection.insertOne(jsonData);
    console.log(`DOC inserted: ${result.insertedId}`);
  } catch (err) {
    console.error('err', err);
>>>>>>> 99393eb5251eba3dd8c7a9f064c2361d8be07e29
  } finally {
    await client.close();
  }
}

main().catch(console.error);
