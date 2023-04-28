const mongoUnit = require("mongo-unit")

export const startDB = () => {
    console.log("fake mongo starting...");
    return mongoUnit.start()
        .then(() => {
            console.log("fake mongo is started: ", mongoUnit.getUrl())
            process.env.MONGO_URL = mongoUnit.getUrl() // this var process.env.DATABASE_URL = will keep link to fake mongo
            // run() // this line start mocha tests
        })
        .catch((e: any) => {
            console.log("fake mongo start error: ", e)
        });
}

// after(() => {
//     // const dao = require('./dao')
//     // console.log('stop')
//     // dao.close()
//     return mongoUnit.stop()
// })

//todo: jsmaps for front
