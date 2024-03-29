// server.js

const express = require("express");
const app = express();
const port = 5000;

const crypto = require("crypto");
app.use(express.json());

const {
  is_valid,
  verify_prescription,
  use_prescription,
} = require("./scripts/call");

function generateRandomSHA256Hash(randomData) {
  const sha256Hash = crypto
    .createHash("sha256")
    .update(randomData)
    .digest("hex");

  return sha256Hash;
}

// Deploy contract route
app.get("/deploy-contract", async (req, res) => {
  try {
    console.log(req.query);
    const hash = generateRandomSHA256Hash(req.query.data);
    res.send(
      await create_prescription(
        req.query.pid,
        hash
      )
    );
  } catch (error) {
    console.error(error);
    res.status(400).send("Error deploying contract");
  }
});

app.get("/validity", async (req, res) => {
  const queryData = req.query;
  if (!queryData.address) {
    res.send("Missing request parameters").status(400);
    return;
  }
  try {
    const resp = await is_valid(queryData.address);
    res.send(resp).status(200);
  } catch (error) {
    res.send("Bad request").status(400);
  }
});

app.get("/verify", async (req, res) => {
  const queryData = req.query;
  if (!queryData.data || !queryData.address) {
    res.send("Missing request parameters").status(400);
    return;
  }
  try {
    const resp1 = await verify_prescription(queryData.address, generateRandomSHA256Hash(queryData.data));
    const resp2 = await is_valid(queryData.address);

    res.send(resp1 && resp2).status(200);
  } catch (error) {
    res.send("Bad request").status(400);
  }
});

app.get("/invalidate", async (req, res) => {
  const queryData = req.query;
  if (!queryData.data || !queryData.address) {
    res.send("Missing request parameters").status(400);
    return;
  }
  try {
    const resp = await use_prescription(queryData.address, queryData.data);
    if (resp) {
      res.send("Successfully consumed prescription").status(200);
    } else {
      res.send("Bad request").status(400);
    }
  } catch (error) {
    res.send("Bad request").status(400);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function create_prescription(pid, hash) {
  const Prescription = await ethers.getContractFactory("Prescription");
  const tx = await Prescription.deploy(pid, hash);
  await tx.deployed();
  return tx.address;
}
