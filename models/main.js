const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  isclear: Boolean,
  chasu: Number,
  findate: String,
  paydate: String,
  duedate: String,
  pay: Number,
  work: Number,
  discount: Number,
  del: Number,
  move: String,
  sumprice: Number,
  payprice: Number,
});

const userSchema = new mongoose.Schema({
  name: String,
  firstid: String,
  secondid: String,
  phone: String,
  post: String,
  getpost: String,
  email: String,
  bank: String,
  bankid: String,
  bankwho: String,
  bankwhere: String,
  come: String,
  sort: String,
});

const dataSchema = new mongoose.Schema({
  type: String,
  group: String,
  turn: Number,
  submitturn: String,
  submitdate: Date,
  trustsubmitdate: Date,
  submitprice: Number,
  earnestdate: Date,
  earnest: Number,
});

const delayedloanSchema = new mongoose.Schema({
  loandate: String,
  loan: Number,
});

const fileInfoSchema = new mongoose.Schema({
  upload: Boolean,
  A: Boolean,
  B: Boolean,
  C: Boolean,
  D: Boolean,
  E: Boolean,
  F: Boolean,
  G: Boolean,
  H: Boolean,
  I: Boolean,
  exception: Boolean,
  investment: Boolean,
  jscontract: Boolean,
});

const MGMSchema = new mongoose.Schema({
  companyname: String,
  name: String,
  organization: String,
  accountnumber: String,
});

const extSchema = new mongoose.Schema({
  manage: String,
  managemain: String,
  manageteam: String,
  managename: String,
  ext: String,
});

const cancelSchema = new mongoose.Schema({
  bank: String,
  bankid: String,
  bankwho: String,
  canceldate: Date,
  paybackdate: Date,
  paybackprice: Number,
});

const loanSchema = new mongoose.Schema({
  bank: String,
  bankid: String,
  bankwho: String,
  canceldate: Date,
  paybackdate: Date,
  paybackprice: Number,
});

const tbMainSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  order: [orderSchema],
  submitdate: Date,
  registerdate: Date,
  registerprice: Number,
  userinfo: userSchema,
  data: dataSchema,
  loan: loanSchema,
  mgm: MGMSchema,
  fileinfo: fileInfoSchema,
  ext: extSchema,
  cancel: cancelSchema,
  delayedloan: delayedloanSchema,
});

const tbMainModel = mongoose.model("mains", tbMainSchema);
module.exports = tbMainModel;
