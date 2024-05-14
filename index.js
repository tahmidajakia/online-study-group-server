const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      // "https://online-study-group-assignment-server.vercel.app",
      "https://online-study-group-assignment.web.app",
      "https://online-study-group-assignment.firebaseapp.com"
    ],
    credentials: true,
  })
);


app.use(express.json());

console.log(process.env.DB_PASS);



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m3whnjn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const assignmentCollection = client.db('onlineGroupStudy').collection('assignment');
    const takeAssignment = client.db('onlineGroupStudy').collection('takeAssignment');

    // get all assignment from db

    app.get('/assignment', async(req,res) => {
        const result = await assignmentCollection.find().toArray()

        res.send(result)
    })

    // save a assignment data in db

    app.post('/assignment',async(req,res) =>{
        const assignmentData = req.body

        const result = await assignmentCollection.insertOne(assignmentData)
        res.send(result)
    })

    app.get('/assignment/:id', async(req,res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await assignmentCollection.findOne(query);
        res.send(result);
      })

      app.post('/takeAssignment', async(req,res) => {
        const takeData = req.body
        const result = await takeAssignment.insertOne(takeData)
        res.send(result)
      })
    //  for my submmited assignment 
      app.get('/my-submitted-assignment/:email', async(req,res) => {
        const email = req.params.email
        const query = {email}
        const result = await takeAssignment.find(query).toArray();
        res.send(result);
      })

    //  pending assignment 
      app.get('/pending-assignment/:email', async(req,res) => {
        const email = req.params.email;
        const query = {'examiner.email':email};
        const result = await takeAssignment.find(query).toArray();
        res.send(result);
      })

      // update pending status
      app.patch('/pending-status/:id', async(req,res) => {
        const id = req.params.id;
        const status = req.body
        const query = {_id: new ObjectId(id)}
        const updateDoc = {
          $set: status
        }
        const result = await takeAssignment.updateOne(query,updateDoc)
        res.send(result)
      })

      // delete assignment by specific user

      app.delete('/assignment/:email', async(req,res) => {
        const email = req.params.email;
        const query = {_id: new ObjectId(email)};
        const result = await assignmentCollection.deleteOne(query)
        res.send(result)
      })

      // update assignment in db
      app.put('/assignment/:id', async(req,res) => {
        const id = req.params.id;
        const assignmentData = req.body;
        const query = {_id: new ObjectId(id)};
        const option = {upsert:true}
        const updateDoc = {
          $set: {
            ...assignmentData,
          },
        }
        const result = await assignmentCollection.updateOne(query,updateDoc,option)
        res.send(result)

      })

      

    //  app.get('/assignment', async(req,res) => {
    //   const filter = req.query.filter
    //   let query ={}
    //   if (filter) query = {difficulty_level:filter}
    //   const result = await assignmentCollection.find(query).toArray();
    //   res.send(result)

    //  })


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Online study group server is running')
})

app.listen(port,() => {
    console.log(`Study group is running on:${port}`)
})