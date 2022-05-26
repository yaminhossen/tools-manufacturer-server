const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2oa2k.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('tools-manufacturer-site').collection('tools');
        const bookingCollection = client.db('tools-manufacturer-site').collection('bookings');
        const reviewCollection = client.db('tools-manufacturer-site').collection('reviews');

        app.get('/tool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });

        app.get('/booking', async (req, res) => {
            const useremail = req.query.useremail;
            const query = { useremail: useremail };
            // const cursor = bookingCollection.find(query);
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        });

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { toolname: booking.toolname, useremail: booking.useremail, username: booking.username }
            const exists = await bookingCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookingCollection.insertOne(booking);
            return res.send({ success: true, result });
        })

        // post
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.delete('/booking/:useremail', async (req, res) => {
            const useremail = req.params.useremail;
            const filter = { useremail: useremail };
            const result = await bookingCollection.deleteOne(filter);
            res.send(result);
        })


    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from tools manufacturer company')
})

app.listen(port, () => {
    console.log(`Tools app listening on port ${port}`)
})