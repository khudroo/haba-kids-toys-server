
const express = require("express");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zfgw9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("habaToys");
    console.log("database connected");
    console.log(client)
    // collection
    const toysCollection = database.collection("toysCollection");
    const reviewCollection = database.collection("reviewCollection");
    const bookingCollection = database.collection("bookingCollection");

    // POST METHODS===========================
    // =======================================

    // Post add toys data
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      console.log(result);
      res.json(result);
    });

    // Post add review data
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
    });

    //Post add booking data
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.json(result);
    });

    // GET METHODS===========================
    // =======================================

    // Get all toys data
    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find({});
      const toy = await cursor.toArray();
      res.send(toy);
    });

    // Get single toys data
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const toy = await toysCollection.findOne(query);
      res.send(toy);
    });

    // Get all reviews data
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // Get all booking data
    app.get("/bookings", async (req, res) => {
      const cursor = bookingCollection.find({});
      const bookings = await cursor.toArray();
      res.send(bookings);
    });

    // Get specific user's bookings
    app.get("/bookings", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { email: email };
      }
      const cursor = bookingCollection.find(query);
      const bookings = await cursor.toArray();
      res.send(bookings);
    });

    // Get Admin User
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const adminUser = await bookingCollection.findOne(query);
      let isAdmin = false;
      if (adminUser?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // DELETE METHODS===========================
    // =========================================

    // Delete my orders/booking
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });

    // delete Toys
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });

    // PUT METHODS============================
    // =======================================
    app.put("/bookings/admin", async (req, res) => {
      const booking = req.body;
      console.log("put", booking);
      const filter = { email: booking.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

// initial get
app.get("/", (req, res) => {
  res.send("HabaToys Server Successfully Connected!");
});
// Localhost url
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
