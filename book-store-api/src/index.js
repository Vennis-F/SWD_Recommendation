const express = require("express");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const frameguard = require("frameguard");
const MongoStore = require("connect-mongo");
const userRouter = require("./routers/user");
const categoriesRouter = require("./routers/categories");
const productsRouter = require("./routers/products");
const cartRouter = require("./routers/cart");
const rolesRouter = require("./routers/role");
const checkoutRouter = require("./routers/checkout");
const ordersRouter = require("./routers/orders");
const sessionRouter = require("./routers/session");
const postRouter = require("./routers/post");
const blogRouter = require("./routers/blog");
const feedbackRouter = require("./routers/feedback");
const sliderRouter = require("./routers/slider");
const customerRouter = require("./routers/customer");
const dashboardRouter = require("./routers/dashboard");
const app = express();
const port = process.env.PORT || 6969;

//Config
app.use(frameguard({ action: "SAMEORIGIN" }));
require("./db/mongoose");
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:5000" }));

//Session
app.use(
  session({
    secret: "Asu",
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 18000000000,
      secure: false,
    },
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/book-store", //YOUR MONGODB URL
      // ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
    }),
  })
);

//Config express
app.use("/user", userRouter);
app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);
app.use("/roles", rolesRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);
app.use("/orders", ordersRouter);
app.use("/session", sessionRouter);
app.use("/posts", postRouter);
app.use("/blogs", blogRouter);
app.use("/feedbacks", feedbackRouter);
app.use("/sliders", sliderRouter);
app.use("/customers", customerRouter);
app.use("/dashboards", dashboardRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const { saveCateCrawl } = require("./utils/crawl-data/dataCategory");
// const {
//   createDataCrawl,
//   saveDataCrawl,
// } = require("./utils/crawl-data/dataProduct");
// // const Product = require("./models/product");
// // Product.findOneAndUpdate(
// //   { _id: "62b1e79c671781b4fe64e11b" },
// //   {
// //     salePrice: -1,
// //   },
// //   { new: true, runValidators: true }
// // )
// //   .then((result) => console.log(result))
// //   .catch((err) => console.log(err));
// saveCateCrawl();
// createDataCrawl();
// saveDataCrawl();

/**/
//Product Clicked
//Product Added to Cart
// const aa = require("search-insights");
// aa("init", {
//   appId: "HSL9DXG942",
//   apiKey: "d352733a9ed989c6ade9b097b79a65c9",
// });
// aa("clickedObjectIDs", {
//   userToken: "62e53fca77641dbc223febfe", // required for Node.js
//   index: "book-store-2",
//   eventName: "Product Clicked",
//   objectIDs: ["62d4450859c8e8f766fbdbc1"],
// });
// aa("convertedObjectIDs", {
//   userToken: "62e53fca77641dbc223febfe", // required for Node.js
//   index: "book-store-2",
//   eventName: "Product Added to Cart",
//   objectIDs: ["62d4450859c8e8f766fbdbc1"],
// });
