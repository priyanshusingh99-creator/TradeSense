require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const PORT = process.env.PORT || 3002;
const mongoUrl = process.env.MONGO_URL;
const app = express();

let isDatabaseConnected = false;
const fallbackOrders = [];

const fallbackHoldings = [
  {
    name: "BHARTIARTL",
    qty: 2,
    avg: 538.05,
    price: 541.15,
    net: "+0.58%",
    day: "+2.99%",
  },
  {
    name: "HDFCBANK",
    qty: 2,
    avg: 1383.4,
    price: 1522.35,
    net: "+10.04%",
    day: "+0.11%",
  },
  {
    name: "HINDUNILVR",
    qty: 1,
    avg: 2335.85,
    price: 2417.4,
    net: "+3.49%",
    day: "+0.21%",
  },
  {
    name: "INFY",
    qty: 1,
    avg: 1350.5,
    price: 1555.45,
    net: "+15.18%",
    day: "-1.60%",
    isLoss: true,
  },
  {
    name: "ITC",
    qty: 5,
    avg: 202.0,
    price: 207.9,
    net: "+2.92%",
    day: "+0.80%",
  },
  {
    name: "KPITTECH",
    qty: 5,
    avg: 250.3,
    price: 266.45,
    net: "+6.45%",
    day: "+3.54%",
  },
  {
    name: "M&M",
    qty: 2,
    avg: 809.9,
    price: 779.8,
    net: "-3.72%",
    day: "-0.01%",
    isLoss: true,
  },
  {
    name: "RELIANCE",
    qty: 1,
    avg: 2193.7,
    price: 2112.4,
    net: "-3.71%",
    day: "+1.44%",
  },
  {
    name: "SBIN",
    qty: 4,
    avg: 324.35,
    price: 430.2,
    net: "+32.63%",
    day: "-0.34%",
    isLoss: true,
  },
  {
    name: "SGBMAY29",
    qty: 2,
    avg: 4727.0,
    price: 4719.0,
    net: "-0.17%",
    day: "+0.15%",
  },
  {
    name: "TATAPOWER",
    qty: 5,
    avg: 104.2,
    price: 124.15,
    net: "+19.15%",
    day: "-0.24%",
    isLoss: true,
  },
  {
    name: "TCS",
    qty: 1,
    avg: 3041.7,
    price: 3194.8,
    net: "+5.03%",
    day: "-0.25%",
    isLoss: true,
  },
  {
    name: "WIPRO",
    qty: 4,
    avg: 489.3,
    price: 577.75,
    net: "+18.08%",
    day: "+0.32%",
  },
];

const fallbackPositions = [
  {
    product: "CNC",
    name: "EVEREADY",
    qty: 2,
    avg: 316.27,
    price: 312.35,
    net: "+0.58%",
    day: "-1.24%",
    isLoss: true,
  },
  {
    product: "CNC",
    name: "JUBLFOOD",
    qty: 1,
    avg: 3124.75,
    price: 3082.65,
    net: "+10.04%",
    day: "-1.35%",
    isLoss: true,
  },
];

app.use(cors());
app.use(bodyParser.json());

const isValidMongoUrl = (url) => {
  return /^mongodb(\+srv)?:\/\//.test(url || "");
};

const getHoldings = async () => {
  if (!isDatabaseConnected) return fallbackHoldings;
  return HoldingsModel.find({});
};

const getPositions = async () => {
  if (!isDatabaseConnected) return fallbackPositions;
  return PositionsModel.find({});
};

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    database: isDatabaseConnected ? "mongodb" : "sample-data",
  });
});

app.get("/allHoldings", async (req, res) => {
  try {
    const allHoldings = await getHoldings();
    res.json(allHoldings);
  } catch (error) {
    console.error("Failed to load holdings:", error.message);
    res.json(fallbackHoldings);
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    const allPositions = await getPositions();
    res.json(allPositions);
  } catch (error) {
    console.error("Failed to load positions:", error.message);
    res.json(fallbackPositions);
  }
});

app.post("/newOrder", async (req, res) => {
  const order = {
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  };

  try {
    if (isDatabaseConnected) {
      await new OrdersModel(order).save();
    } else {
      fallbackOrders.push({ ...order, createdAt: new Date().toISOString() });
    }

    res.send("Order saved!");
  } catch (error) {
    console.error("Failed to save order:", error.message);
    res.status(500).send("Failed to save order");
  }
});

const connectDatabase = async () => {
  if (!isValidMongoUrl(mongoUrl)) {
    console.log("MongoDB URL is missing or invalid. Using sample data.");
    return;
  }

  try {
    await mongoose.connect(mongoUrl);
    isDatabaseConnected = true;
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.log("Using sample data instead.");
  }
};

app.listen(PORT, async () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  await connectDatabase();
});
