const mongoose = require("mongoose");

const chasuSchema = new mongoose.Schema({
  chasu: String,
  paydate: String,
  ratio: Number,
});

const detailSchema = new mongoose.Schema({
  typeid: String,
  floor: String,
  type: Number,
  area: Number,
  group: String,
  count: Number,
  areaprice: Number,
  areasum: Number,
  pricearray: [
    Number,
    Number,
    Number,
    Number,
    Number,
    Number,
    Number,
    Number,
    Number,
  ],
  sumprice: Number,
  payratio: Number,
  leftprice: Number,
});

const tbScheduleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  submitturn: String,
  createdate: Date,
  creator: String,
  coment: String,
  schedule: [
    chasuSchema,
    chasuSchema,
    chasuSchema,
    chasuSchema,
    chasuSchema,
    chasuSchema,
    chasuSchema,
    chasuSchema,
    chasuSchema,
    chasuSchema,
  ],
  detail: [
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
    detailSchema,
  ],
});

const tbScheduleModel = mongoose.model("schedules", tbScheduleSchema);
module.exports = tbScheduleModel;
