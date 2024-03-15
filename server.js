// server.js

const express = require("express");
const app = express();
const port = 5000;

app.use(express.json());

const {
  is_valid,
  verify_prescription,
  use_prescription,
} = require("./scripts/call");

// Deploy contract route
app.get("/deploy-contract", async (req, res) => {
  try {
    res.send(await create_prescription("123", "lol"));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deploying contract");
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
  if (!queryData.hash || !queryData.address) {
    res.send("Missing request parameters").status(400);
    return;
  }
  try {
    const resp1 = await verify_prescription(queryData.address, queryData.hash);
    const resp2 = await is_valid(queryData.address);

    res.send(resp1 && resp2).status(200);
  } catch (error) {
    res.send("Bad request").status(400);
  }
});

app.get("/invalidate", async (req, res) => {
  const queryData = req.query;
  if (!queryData.hash || !queryData.address) {
    res.send("Missing request parameters").status(400);
    return;
  }
  try {
    const resp = await use_prescription(queryData.address, queryData.hash);
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
