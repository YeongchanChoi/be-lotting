const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const tbMainModel = require("../models/main");
const tbScheduleModel = require("../models/schedule");
const router = express.Router();

const upload = multer({ dest: "uploads/" });


const convertExcelDate = (excelDate) => {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  const convertedDate = date.toISOString().split("T")[0];
  return convertedDate;
};

const getValue = (value) => (value !== undefined && value !== "" ? value : null);

const getDateValue = (value) => {
  if (!isNaN(value)) {
    return convertExcelDate(value);
  } else {
    return getValue(value);
  }
};

const setIsClear = (dateValue) => (dateValue && dateValue.includes("-") ? true : false);


const bankWhereMapping = {
  m: "MUGUNGHWA",
  k: "KYOBO",
  d: "DASIN",
  s: "SINYOUNG",
  h: "HANKOOK"
};

const processExcelFile = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 }).slice(3);

  const dataObjects = jsonData.map((row) => {
    const id = getValue(row[0]);
    if (id === null) {
      return null;
    }

    let obj = {
      id: id,
      userinfo: {
        name: getValue(row[11]),
        firstid: getValue(String(row[12]).substring(0, 6)),
        secondid: getValue(String(row[12]).substring(6)),
        phone: "010" + getValue(row[13]),
        getpost: getValue(String(row[15]) + " " + String(row[16]) + " " + String(row[17])),
        email: getValue(row[14]),
        bank: getValue(row[18]),
        bankid: getValue(row[19]),
        bankwho: getValue(row[20]),
        bankwhere: bankWhereMapping[getValue(row[21])] || getValue(row[21]), // Mapping the bankwhere value
        come: getValue(row[115]),
      },
      data: {
        type: getValue(row[1]),
        group: getValue(row[2]),
        turn: getValue(row[3]),
        submitturn: getValue(row[5]),
        submitdate: getDateValue(row[6]),
        submitprice: getValue(row[7]),
        earnestdate: getDateValue(row[22]),
        earnest: getValue(row[23]),
      },
      loan: {
        loandate: getDateValue(row[95]),
        price1: getValue(row[96]),
        price2: getValue(row[97]),
        selfdate: getDateValue(row[98]),
        selfprice: getValue(row[99]),
        sumprice: getValue(row[100]),
      },
      ext: {
        manage: getValue(row[111]),
        managemain: getValue(row[112]),
        manageteam: getValue(row[113]),
        managename: getValue(row[114]),
        ext: getValue(row[8]),
      },
      order: [
        {
          findate: getDateValue(row[24]),
          duedate: null,
          pay: getValue(row[25]),
          work: getValue(row[26]),
          move: getValue(row[27]),
          sumprice: getValue(row[28]),
          isclear: setIsClear(getDateValue(row[24])),
          payprice: 0,
        },
      ],
    };

    let order_2_3 = [];
    for (let i = 29; i < 50; i += 7) {
      order_2_3.push({
        duedate: getDateValue(row[i]),
        findate: getDateValue(row[i + 1]),
        pay: getValue(row[i + 2]),
        discount: getValue(row[i + 3]),
        work: getValue(row[i + 4]),
        move: getValue(row[i + 5]),
        sumprice: getValue(row[i + 6]),
        isclear: setIsClear(getDateValue(row[i + 1])),
        payprice: 0,
      });
    }
    for (let i = 50; i < 71; i += 8) {
      order_2_3.push({
        duedate: getDateValue(row[i]),
        findate: getDateValue(row[i + 1]),
        pay: getValue(row[i + 2]),
        discount: getValue(row[i + 3]),
        del: getValue(row[i + 4]),
        work: getValue(row[i + 5]),
        move: getValue(row[i + 6]),
        sumprice: getValue(row[i + 7]),
        isclear: setIsClear(getDateValue(row[i + 1])),
        payprice: 0,
      });
    }
    order_2_3.push({
      duedate: getDateValue(row[74]),
      findate: getDateValue(row[75]),
      pay: getValue(row[76]),
      discount: getValue(row[77]),
      work: getValue(row[78]),
      move: getValue(row[79]),
      sumprice: getValue(row[80]),
      isclear: setIsClear(getDateValue(row[75])),
      payprice: 0,
    });
    order_2_3.push({
      duedate: getDateValue(row[81]),
      findate: getDateValue(row[82]),
      pay: getValue(row[83]),
      discount: getValue(row[84]),
      work: getValue(row[85]),
      move: getValue(row[86]),
      sumprice: getValue(row[87]),
      isclear: setIsClear(getDateValue(row[82])),
      payprice: 0,
    });
    order_2_3.push({
      duedate: getDateValue(row[88]),
      findate: getDateValue(row[89]),
      pay: getValue(row[90]),
      discount: getValue(row[91]),
      work: getValue(row[92]),
      move: getValue(row[93]),
      sumprice: getValue(row[94]),
      isclear: setIsClear(getDateValue(row[89])),
      payprice: 0,
    });

    obj.order = obj.order.concat(order_2_3);

    return obj;
  });

  async function mapDataObjects(dataObjects) {
    const mappedObjects = {};

    for (const obj of dataObjects) {
      if (!obj) continue;

      const address = `${obj.userinfo.getpost}`;


      try {

        const orderdata = obj.order.map((order, index) => ({
          isclear: order.isclear || false,
          chasu: order.chasu || index + 1,
          pay: order.pay || 0,
          duedate: order.duedate || null,
          findate: order.findate || null,
          work: order.work || 0,
          discount: order.discount || 0,
          del: order.del || 0,
          move: order.move || null,
          sumprice: order.sumprice || 0,
          payprice: order.isclear ? order.sumprice : 0,
        }));

        const loandata = {
          loandate: obj.loan.loandate || null,
          price1: obj.loan.price1 || 0,
          price2: obj.loan.price2 || 0,
          selfdate: obj.loan.selfdate || null,
          selfprice: obj.loan.selfprice || 0,
          sumprice: obj.loan.sumprice || 0,
          balance: obj.loan.balance || 0,
        };

        const canceldata = {
          canceldate: obj.cancel?.canceldate || null,
          paybackdate: obj.cancel?.paybackdate || null,
          paybackprice: obj.cancel?.paybackprice || 0,
        };

        const requestData = {
          id: obj.id,
          userinfo: {
            name: obj.userinfo.name,
            phone: obj.userinfo.phone,
            firstid: obj.userinfo.firstid,
            secondid: obj.userinfo.secondid,
            email: obj.userinfo.email,
            come: obj.userinfo.come,
            bank: obj.userinfo.bank,
            bankid: obj.userinfo.bankid,
            bankwho: obj.userinfo.bankwho,
            bankwhere: obj.userinfo.bankwhere,
            getpost: address,
            post: "",
          },
          data: {
            submitturn: obj.data.submitturn,
            type: obj.data.type,
            group: obj.data.group,
            turn: obj.data.turn,
            submitdate: obj.data.submitdate,
            trustsubmitdate: null,
            submitprice: obj.data.submitprice,
            earnestdate: obj.data.earnestdate,
            earnest: obj.data.earnest,
          },
          registerprice: obj.data.submitprice,
          registerdate: obj.data.submitdate,
          ext: {
            manage: obj.ext.manage,
            managemain: obj.ext.managemain,
            manageteam: obj.ext.manageteam,
            managename: obj.ext.managename,
            ext: obj.ext.ext,
          },
          order: orderdata,
          loan: loandata,
          cancel: canceldata,
          fileinfo: {
            A: false,
            B: false,
            C: false,
            D: false,
            E: false,
            F: false,
            G: false,
            H: false,
            I: false,
          },
        };

        mappedObjects[obj.id] = requestData;
      } catch (error) {
        console.error(`Error mapping data for ID: ${obj.id}`, error);
        continue;
      }
    }
    return mappedObjects;
  }

  const mappedDataObjects = await mapDataObjects(dataObjects);
  return mappedDataObjects;
};

router.post("/api/uploadExcel", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const mappedDataObjects = await processExcelFile(filePath);

    for (const id in mappedDataObjects) {
      const requestData = mappedDataObjects[id];
      const newMain = new tbMainModel(requestData);
      await newMain.save();
    }

    fs.unlinkSync(filePath);

    res.json({ message: "File processed and data saved successfully." });
  } catch (error) {
    console.error("Error processing Excel file: ", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/exceltest", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../excel-testing/list.xlsx");
    const mappedDataObjects = await processExcelFile(filePath);


    for (const id in mappedDataObjects) {
      const requestData = mappedDataObjects[id];
      const newMain = new tbMainModel(requestData);
      await newMain.save();
    }

    res.json({ message: "Test file processed and data saved successfully." });
  } catch (error) {
    console.error("Error processing test Excel file: ", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;