const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/mainRouter");
const excelRouter = require("./routes/excelRouter");
const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");
const cors = require("cors");
const bodyparse = require("body-parser");
const cookieSession = require("cookie-session");

const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "lotting-login-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);
const db = require("./models");
const Role = db.role;

db.mongoose
  .connect(
    "mongodb+srv://audora:audora@lottingcluster.yvd0tpe.mongodb.net/lotting?retryWrites=true&w=majority&appName=Lottingcluster",
    {
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    initial();
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

const initial = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });
    }
  });
};

app.post("/test", (req, res) => {
  const { username, email } = req.body;

  console.log(username, email);
});

app.use(mainRouter);
app.use(authRouter);
app.use(userRouter);
app.use(excelRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});