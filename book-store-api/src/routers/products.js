const { auth } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const Product = require("../models/product");
const router = require("express").Router();
const { isValidUpdate, updatesFilter } = require("../utils/valid");
const Category = require("../models/category");
const aa = require("search-insights");
aa("init", {
  appId: "HSL9DXG942",
  apiKey: "d352733a9ed989c6ade9b097b79a65c9",
});

// ////////////////////////////RECOMMENDED///////////////
router.post("/recommendation/click/:objectID", auth, async (req, res) => {
  try {
    aa("clickedObjectIDs", {
      userToken: req?.user?._id ? req.user._id : "62e53fca77641dbc223febfe", // required for Node.js
      index: "book-store-2",
      eventName: "Product Clicked",
      objectIDs: [req.params.objectID],
    });
    console.log("[RECOMMEDED CLICK]");
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
});
router.post("/recommendation/converted/:objectID", auth, async (req, res) => {
  try {
    aa("convertedObjectIDs", {
      userToken: req?.user?._id ? req.user._id : "62e53fca77641dbc223febfe", // required for Node.js
      index: "book-store-2",
      eventName: "Product Added to Cart",
      objectIDs: [req.params.objectID],
    });
    console.log("[RECOMMEDED CONVERTED]");
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

///////////////////////////////////COMMON///////////////////////////////////////
//GET /products?featured=true
router.get("/", async (req, res) => {
  const { feartured, limit, page, sortBy, publicDate, status } = req.query;
  const match = {};
  const sort = { "briefInformation.publicDate": -1 };
  const options = {
    sort,
  };

  //Product fearture
  if (feartured) {
    match.feartured = feartured === "true";
  }
  //Product status
  if (status) {
    match.status = status === "true";
  }

  //Paging
  if (limit) options.limit = parseInt(limit);
  if (page) options.skip = parseInt(limit) * (parseInt(page) - 1);
  if (publicDate) {
    sort["briefInformation.publicDate"] = publicDate === "desc" ? -1 : 1;
  }

  try {
    const products = await Product.find(match, null, options);
    console.log(match, options);
    res.send(products);
  } catch (e) {
    res.status(500).send();
  }
});

//GET /products/search
router.post("/search", async (req, res) => {
  try {
    const products = await Product.find({
      $text: { $search: req.body.searchText },
      status: true,
    })
      .skip(0)
      .limit(10);
    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/search/marketing", async (req, res) => {
  try {
    console.log(req.body);
    const products = await Product.find({
      $text: { $search: req.body.searchText },
    }).populate({ path: "category" });
    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

//GET /products/category/
router.get("/category/:categoryId", async (req, res) => {
  const cateId = req.params.categoryId;
  const { limit, page, sortBy, publicDate, status } = req.query;
  const match = { category: cateId };
  const sort = { "briefInformation.publicDate": -1 };
  const options = {
    sort,
  };

  //Product status
  if (status) {
    match.status = status === "true";
  }

  //Paging
  if (limit) options.limit = parseInt(limit);
  if (page) options.skip = parseInt(limit) * (parseInt(page) - 1);
  if (publicDate) {
    sort["briefInformation.publicDate"] = publicDate === "desc" ? -1 : 1;
  }

  console.log(match, options, "++++");
  try {
    //Find and Check product exist:
    const product = await Product.find(match, null, options);
    const count = await Product.countDocuments(match);
    console.log(count);
    res.send({ product, count });
  } catch (e) {
    if (e.name === "CastError" && e.kind === "ObjectId")
      return res.status(400).send({ error: "Invalid ID" });
    res.status(500).send(e);
  }
});

//GET /products/size
router.get("/size", async (req, res) => {
  const { limit, page, sortBy, publicDate, status, category } = req.query;

  const match = {};
  if (category) match.category = category;
  if (status) match.status = status === "true";

  try {
    const count = await Product.count(match);
    res.status(200).send({ count });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

////////////////////////////////////Marketing////////////////////////////

//GEt /products/marketing
//get product list
//Pagination:     ?limit=...&page=...
//Filter:         ?category=...&status=...
//Sort:           ?sortedBy=  title/category/listPrice/salePrice/featured/status_desc/asc
// ex: sortedBy=title_desc          //ex:sortedBy=status_asc
router.get("/marketing", async (req, res) => {
  const {
    category,
    sortedBy,
    feartured,
    limit,
    page,
    sortBy,
    publicDate,
    status,
  } = req.query;
  const match = {};
  const sort = { "briefInformation.publicDate": -1 };
  const options = {
    limit: 12,
    skip: 0,
    sort,
  };

  //Product fearture
  if (feartured) {
    match.feartured = feartured === "true";
  }
  //Product status
  if (status) {
    match.status = status === "true";
  }

  //Paging
  if (limit) options.limit = parseInt(limit);
  if (page) options.skip = parseInt(limit) * (parseInt(page) - 1);
  if (publicDate) {
    sort["briefInformation.publicDate"] = publicDate === "desc" ? -1 : 1;
  }
  const count = await Product.countDocuments();
  try {
    const products = await Product.find(match, null, options);
    const lstProducts = await Promise.all(
      products.map((product) =>
        product.populate({ path: "category", model: Category })
      )
    );
    res.send({ products, count });
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/test", async (req, res) => {
  const { feartured, limit, page, sortBy, publicDate, status } = req.query;
  const match = {};
  const sort = { "briefInformation.publicDate": -1 };
  const options = {
    limit: 12,
    skip: 0,
    sort,
  };

  //Product fearture
  if (feartured) {
    match.feartured = feartured === "true";
  }
  //Product status
  if (status) {
    match.status = status === "true";
  }

  //Paging
  if (limit) options.limit = parseInt(limit);
  if (page) options.skip = parseInt(limit) * (parseInt(page) - 1);
  if (publicDate) {
    sort["briefInformation.publicDate"] = publicDate === "desc" ? -1 : 1;
  }
  const count = await Product.countDocuments();
  try {
    const products = await Product.find(match, null, options).populate({
      path: "category",
    });
    res.send({ products, count });
  } catch (e) {
    res.status(500).send();
  }
});

//GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    //Find and Check product exist:
    const product = await Product.findById(req.params.id);
    if (!product) return res.sendStatus(404);

    res.send(product);
  } catch (e) {
    if (e.name === "CastError" && e.kind === "ObjectId")
      return res.status(400).send({ error: "Invalid ID" });
    res.status(500).send(e);
  }
});

//PATCH /categories/:id (ALL field)
router.put("/:id", async (req, res) => {
  console.log(req.body);
  let updates = updatesFilter(req.body);
  const allowUpdateds = [
    "title",
    "listPrice",
    "salePrice",
    "quantity",
    "description",
    "feartured",
    "status",
    "author",
    "publisher",
    "publicDate",
    "language",
    "pages",
    "category",
    "thumbnail",
    "id",
  ];
  if (!isValidUpdate(updates, allowUpdateds))
    return res.status(400).send({ error: "Invalid updates" });

  try {
    //Find and Check product exist:
    const product = await Product.findById(req.params.id);
    if (!product) return res.sendStatus(404);

    //Update product
    updates.forEach((update) => (product[update] = req.body[update]));

    //Update product brief inforamtion
    if (Object.keys(req.body).includes("briefInformation")) {
      const briefs = Object.keys(req.body["briefInformation"]);
      briefs.forEach(
        (brief) =>
          (product["briefInformation"][brief] =
            req.body["briefInformation"][brief])
      );
    }

    await product.save({ validateModifiedOnly: true });
    res.send(product);
  } catch (e) {
    console.log(e);
    if (e.name === "CastError" && e.kind === "ObjectId")
      return res.status(400).send({ error: "Invalid ID" });
    res.status(400).send({ error: e.message });
  }
});

//POST /products
router.post("/", auth, authorize("marketing"), async (req, res) => {
  const product = new Product({ ...req.body });
  console.log("-----------------------");
  console.log(product);
  try {
    const productSaved = await product.save();
    res.status(201).send(productSaved);
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
