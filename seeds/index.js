// this script is responsible for clearing existing data in the 'checkpoints' collection
// and populating it with random data
const mongoose = require("mongoose");
const cities = require("./cities");
const { styles, descriptors } = require("./seedHelpers");
const Checkpoint = require("../models/checkpoint");

mongoose.connect("mongodb://127.0.0.1:27017/arcade-atlas");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Checkpoint.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const random1000 = Math.floor(Math.random() * 1000);
    const cp = new Checkpoint({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(styles)}`,
    });
    await cp.save();
  }
};

// after seeding the db connection is closed so you can run app.js
seedDB().then(() => {
  mongoose.connection.close();
});