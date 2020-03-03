let isConnected

module.exports = connectToDatabase = (mongoose) => {

    if (isConnected) {
        console.log('using existing database connection')
        return Promise.resolve(isConnected)
    }
    mongoose.Promise = global.Promise
    console.log('using new database connection')
    const connectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CONNECTION_STRING}`
    return mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }).then(db => {
        isConnected = db
        mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'))
        return isConnected
    })
}