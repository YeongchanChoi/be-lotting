const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const router = express.Router();
const tbMainModel = require("../models/main");
const tbScheduleModel = require("../models/schedule");
const upload = require("../models/file");
const path = require("path");

router.get("/api/userinfo", async (req, res) => {
  try {
    const result = await tbMainModel.find({}, { _id: 0, userinfo: 1 });
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/searchname/:name?", async (req, res) => {
  try {
    const name = req.params.name || "";
    const query = name
      ? { "userinfo.name": { $regex: name, $options: "i" } }
      : {};
    const result = await tbMainModel
      .find(
        query,
        "id userinfo.name userinfo.sort data.type data.group data.turn data.submitturn data.submitdate"
      )
      .sort({ id: 1 }); // id 필드를 기준으로 오름차순 정렬
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/searchnumber/:number?", async (req, res) => {
  try {
    const number = req.params.number || "";
    const query = number ? { id: number } : {};
    const result = await tbMainModel
      .find(
        query,
        "id userinfo.name userinfo.sort data.type data.group data.turn data.submitturn data.submitdate"
      )
      .sort({ id: 1 }); // id 필드를 기준으로 오름차순 정렬
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/userinfo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await tbMainModel.find({ id: id });
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/chasuinit/:type/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const type = req.params.type;
    const array = await tbMainModel.find(
      { id: id },
      {
        "order.isclear": 1,
        "order.duedate": 1,
        "order.findate": 1,
        "order.payprice": 1,
        "order.sumprice": 1,
        "order.chasu": 1,
        loan: 1,
      }
    );

    const { order, loan } = array[0];

    if (type === "fin") {
      const filteredChasufin = order.filter((v) => v.isclear);
      res.json(filteredChasufin);
    } else if (type === "pre") {
      const filteredChasupre = order.filter((v) => !v.isclear);
      res.json(filteredChasupre);
    } else if (type === "loan") {
      res.json(loan);
    }
  } catch (error) {
    console.log("Error fetching data: ", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/chasu/:id/:cha", async (req, res) => {
  try {
    const id = req.params.id;
    const cha = req.params.cha;
    const array = await tbMainModel.find({ id: id }, "order");

    const { order } = array[0];
    const filteredChasufin = order.filter((v) => v.chasu == cha);

    res.json(filteredChasufin);
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/api/createuser", async (req, res) => {
  try {
    console.log(req.body);
    const maxId = await getMaxIdFromDatabase();
    const generatedId = maxId + 1;
    const defaultorder = await getOrderDataFromDatebase(
      req.body.data.submitturn,
      req.body.data.type + req.body.data.group
    );

    const paydateExtract = defaultorder[0].chasu.map((item) => item.paydate);
    const orderdata = defaultorder[0].pricearray.map((price, index) => ({
      isclear: false,
      chasu: index + 1,
      pay: price,
      duedate: paydateExtract[index] || null,
      findate: null,
      work: 0,
      discount: 0,
      del: 0,
      move: null,
      sumprice: price,
      payprice: 0,
    }));

    const loandata = {
      loandate: null,
      price1: 0,
      price2: 0,
      selfdate: null,
      selfprice: 0,
      sumprice: 0,
      balance: 0,
    };

    const requestData = {
      id: generatedId,
      order: orderdata,
      resgisterprice: defaultorder[0].areasum,
      registerdate: new Date(),
      loan: loandata,
      ...req.body,
    };

    const newMain = new tbMainModel(requestData);
    await newMain.save();

    res.json("success");
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/api/deleteuser", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await tbMainModel.findOneAndDelete({ id }); // ObjectId 대신 id 필드로 검색
    if (!result) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("삭제 성공");
  } catch (error) {
    console.error("삭제 중 에러 발생:", error);
    res.status(500).send("삭제 중 에러 발생");
  }
});

router.get("/api/generateId", async (req, res) => {
  try {
    const maxId = await getMaxIdFromDatabase();
    const generatedId = maxId + 1;
    res.json({ nextid: generatedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/upload", upload.array("file"), (req, res) => {
  res.send("File uploaded 완료!");
});

const uploadDir = "./uploads";

router.post("/api/download", (req, res) => {
  const { id, filename } = req.body;
  if (!id || !filename) {
    return res.status(400).json({ message: "ID와 파일명이 필요합니다." });
  }

  const folderPath = path.join(uploadDir, String(id));
  const filePrefix = `${id}_${filename}`;
  let foundFile = null;

  try {
    const files = fs.readdirSync(folderPath);
    foundFile = files.find((file) => file.startsWith(filePrefix));
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "파일을 찾을 수 없습니다." });
  }

  if (!foundFile) {
    return res.status(404).json({ message: "파일을 찾을 수 없습니다." });
  }

  const filePath = path.join(folderPath, foundFile);
  res.header("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.download(filePath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "파일을 다운로드하는 동안 오류가 발생했습니다." });
    }
  });
});

router.put("/api/chasuupdate/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const chasu = req.body.chasu;

    const updates = { ...req.body };
    await tbMainModel.updateOne(
      { id: id, "order.chasu": chasu },
      { $set: { "order.$": updates } }
    );

    res.status(200).send("Data updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating data");
  }
});

router.put("/api/loanupdate/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    await tbMainModel.updateOne({ id: id }, { $set: { loan: updates } });

    res.status(200).send("Data updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating data");
  }
});

router.get("/tt", async (req, res) => {
  getOrderDataFromDatebase("2차", "qw");
});

router.put("/api/userinfo/:userid", async (req, res) => {
  try {
    const userid = req.params.userid;
    const { userinfo, data, ext, fileinfo, mgm, delayedloan, cancel } =
      req.body;
    const updates = {};
    if (userinfo) {
      updates["userinfo"] = userinfo;
    }
    if (data) {
      updates["data"] = data;
    }
    if (ext) {
      updates["ext"] = ext;
    }
    if (mgm) {
      updates["mgm"] = mgm;
    }
    if (delayedloan) {
      updates["delayedloan"] = delayedloan;
    }
    if (cancel) {
      updates["cancel"] = cancel;
    }
    if (fileinfo) {
      updates["fileinfo"] = fileinfo;
    }

    await tbMainModel.updateOne({ id: userid }, { $set: updates });
    res.status(200).send("User info updated successfully");
  } catch (error) {
    console.error("Error updating user info: ", error);
    res.status(500).send("Error updating user info");
  }
});

async function getMaxIdFromDatabase() {
  const result = await tbMainModel.findOne().sort({ id: -1 }).exec();
  console.log(result);
  if (result) {
    return result.id;
  } else {
    return 0;
  }
}

async function getOrderDataFromDatebase(submitturn, typeid) {
  const result = await tbScheduleModel.find(
    { submitturn: submitturn, comment: "(총회시의결)" },
    { detail: 1, schedule: 1 }
  );
  const chasu = result[0].schedule;
  const filteredResult = result[0].detail.filter(
    (item) => item.typeid === typeid
  );

  if (filteredResult) {
    filteredResult[0].chasu = chasu;
    return filteredResult;
  } else {
    return null;
  }
}

module.exports = router;
