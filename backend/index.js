const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000;

// parse options
app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.json({limit: '10mb'}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

// routes
const articleRoutes = require("./src/routes/article.route")
const commentRoutes = require("./src/routes/comment.route")
const userRoutes = require("./src/routes/auth.user.route")
app.use("/api/articles", articleRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/auth", userRoutes)

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);

  app.get('/', (req, res) => {
    res.send('OPS server is running...')
  })

}


main().then(() => console.log("MongoDB connected successfully!")).catch(err => console.log(err));



app.listen(port, () => {
  console.log(`OPS listening on port ${port}`)
})