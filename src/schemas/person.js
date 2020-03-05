const mongoose = require('mongoose')

module.exports = new mongoose.model('Person',{
    index: Number,
    name: String,
    isActive: Boolean,
    registered: String,
    age: Number,
    gender: String,
    eyeColor: String,
    favoriteFruit: String,
    company: {
        title: String,
        email: String,
        phone: String,
        location: {
            country: String,
            address: String
        }
    },
    tags: []
})
