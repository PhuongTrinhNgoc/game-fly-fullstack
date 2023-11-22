const PORT = process.env.PORT ?? 8000
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
dotenv.config();
 





app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan("common"));

const authorRoute = require("./router/author");
const gamesRoute = require("./router/games");
// app.get("/get",async (req,res)=>{
//     try {
//         const data = await pool.query("SELECT * FROM authors")
//         res.json(data.rows)
//     } catch (error) {
//         console.log(error);
//     }
// })
app.use("/v1/author",authorRoute)
app.use("/v1/game",gamesRoute)

app.listen(PORT,()=>{
    console.log(`server runing on PORT ${PORT}`);
})