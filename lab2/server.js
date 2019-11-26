const express = require('express');

const config = require('./config/config');

const hebb = require('./module/Hebb');

// let session = require('express-session');
// let MongoDBStore = require('connect-mongodb-session')(session);

let app = express();

app.use(express.json({
    type: ['application/json', 'text/plain']
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-string");
    next();
});

app.get("/", async (req, res)=>{
    res.send(await hebb.getLearnResult());
});

app.post("/learn", async(req, res) => {
    console.log(req.body);
    await hebb.learn(req.body);
    // console.log(req.body);
});

app.post("/research", async(req, res) => {
   let oParameters = req.body;
   let result = await hebb.research(oParameters);
   res.send(result);
});

const server = app.listen(process.env.PORT || '5000', ()=>{
    console.log(`App listen on port ${server.address().port}`);
    console.log('Press Ctrl+C to quit');
});
