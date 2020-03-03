'use strict'
require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CONNECTION_STRING}`, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
const people = require('../data/people.json')
const PersonSchema = require('../schemas/personSchema')
const PersonModel = mongoose.model('Person', PersonSchema)

PersonModel.collection.insertMany(people, (err, docs) => {
    if (err) {return console.error(err)}
    else console.log('people inserted into collection')
    process.exit()
})
