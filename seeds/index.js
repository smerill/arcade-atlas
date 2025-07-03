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
  for (let i = 0; i < 300; i++) {
    const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const cp = new Checkpoint({
      author: '6860caef07258d19dfadf609',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(styles)}`,
      images: { url: `https://picsum.photos/400?random=${Math.random()}`, filename: `${Math.random() * 10 + 1}` },
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. At, voluptatum impedit nam maxime faci',
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      }
    });
    await cp.save();
  }
};

// after seeding the db connection is closed so you can run app.js
seedDB().then(() => {
  mongoose.connection.close();
});