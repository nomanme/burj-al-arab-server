const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()
// console.log(process.env.DB_PASS)
const port = 6000;

// app.get('/', (req, res) => {
//     res.send('hello mongodb')
// })

const app = express();

app.use(cors());
app.use(bodyParser.json())

var serviceAccount = require("./configs/burj-al-arab-1331c-firebase-adminsdk-ocb9j-a46ccd1020.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w8usp.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    console.log(err)
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                // console.log(result)
                res.send(result.insertedCount > 0)
            })
        console.log(newBooking);
    })
})

app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    console.log(bearer)
    if (bearer && bearer.startsWith('Bearer ')) {
        const idToken = bearer.split(' ')[1];
        console.log(idToken)
        admin.auth().verifyIdToken(idToken)
            .then(function (decodedToken) {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;
                console.log(queryEmail === tokenEmail)
                if (tokenEmail == queryEmail) {
                    bookings.find({ email: queryEmail })
                        .toArray((err, documents) => {
                            res.status(200).send(documents);
                        })
                }
                else {
                    res.status(401).send('un-authorized access')
                }
            }).catch(function (error) {
                res.status(401).send('un-authorized access')
            });
    }
    else {
        res.status(401).send('un-authorized access')
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port);
