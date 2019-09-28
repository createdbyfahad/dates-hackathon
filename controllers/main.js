const {validationResult } = require('express-validator');
const moment = require('moment');
const faker = require('faker');

const Palm = require('../models/Palm.js');
const constants = require('../constants');
/**
 * GET /
 * Home page.
 */
exports.getMain = async (req, res) => {
  const palms = await Palm.find({}).exec();
  var harvests = [];
  var progressYr = {};
  var minRow = 0;
  var maxRow = 0;

  var minColumn = 0;
  var maxColumn = 0;
  palms.forEach(palm => {
    palm.harvest.forEach(harvest => {
      let d = moment(harvest.date);
      let ob = {
        x: d.format('YYYY-MM'),
        y: harvest.weight
      }
      let h = harvests.findIndex(ha => {
        if (ob.x == ha.x){
          return true
        }
        return false
      })
      if(h >= 0){
        harvests[h].y += ob.y
      }else{
        harvests.push(ob)
      }
    })
    let k = palm.location.row.toString() + palm.location.column.toString();
    if(palm.location.row < minRow)
      minRow = palm.location.row;
    if(palm.location.row > maxRow)
      maxRow = palm.location.row;
    if(palm.location.column < minColumn)
      minColumn = palm.location.column;
    if(palm.location.column > maxColumn)
      maxColumn = palm.location.column;

    console.log({minRow,
      minColumn,
      maxRow,
      maxColumn})
    progressYr[k] = [palm.compareYearHarvestTotal, palm.type];
  });
  console.log(progressYr)
  res.render('dashboard', {
    title: 'Dashboard',
    palms: palms,
    harvests: JSON.stringify(harvests.sort((a, b) => (a.x > b.x) ? 1 : -1)),
    progressYr: JSON.stringify(progressYr),
    minRow,
    minColumn,
    maxRow,
    maxColumn
  });
};

/**
 * GET /
 * Inventory page.
 */
exports.getFarm = async (req, res) => {

  const palms = await Palm.find({}).exec();

  res.render('farm/main', {
    title: 'Farm',
    palms: palms
  });
};


exports.addTree = async (req, res) => {
  res.render('farm/add', {
    title: 'Add Tree',
    palmTypes: constants.palmTypes
  });
};


exports.postTree = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.render('farm/add', {
      title: 'Add Tree',
      palmTypes: constants.palmTypes,
      errors: errors.array()
    });
  }
  const body = req.body;
  // add the palm
  const palm = new Palm({
    farmerID: req.user.id,
    type: body.type,
    age: body.age,
    location: {row: body.locationRow, column: body.locationColumn},
    plantationDate: body.plantation
  });
  palm.save((err) => {
    console.log("err", err)
    if(err)
      return res.render('farm/add', {
        title: 'Add Tree',
        palmTypes: constants.palmTypes,
        errors: [{param: "Error", msg: "failed to add the tree"}]
      });
    return res.redirect('/dashboard/farm/' + palm.id)
  })
};


exports.getTree = async (req, res) => {
  const id = req.params.id;
  const palm = await Palm.findOne({id: id}).exec();
  if(palm==null) return res.redirect('/dashboard/farm/');
  const qrCode = await palm.qrCode;
  console.log("qrcode", qrCode)
  res.render('farm/view', {
    title: 'Farm',
    palm: palm,
    qrCode: qrCode
  });
};



exports.addHealth = async (req, res) => {
  res.render('farm/addHealth', {
    title: 'Add Health',
    palmHealth: constants.palmHealth
  });
};


exports.postHealth = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('farm/addHealth', {
      title: 'Add Health',
      palmHealth: constants.palmHealth,
      errors: errors.array()
    });
  }
  const body = req.body;
  const palmId = req.params.id;
  const palm = await Palm.findOne({id: palmId}).exec();
  if(palm==null) return res.redirect('/dashboard/farm/');
  palm.health.push({
    type: body.type,
    startDate: body.startDate,
    endDate: null,
    comment: body.comment
  });
  palm.save((err) => {
    console.log("err", err)
    if(err)
      return res.render('farm/addHealth', {
        title: 'Add Health',
        palmHealth: constants.palmHealth,
        errors: [{param: "Error", msg: "failed to add the health"}]
      });
    return res.redirect('/dashboard/farm/' + palm.id)
  })
};


exports.processHealth = async (req, res) => {
  const palmId = req.params.id;
  const healthId = req.params.healthId;
  console.log('healthId', healthId)
  // const palm = await Palm.findOne({id: palmId}).exec();
  // if(palm==null) return res.redirect('/dashboard/farm/');
  Palm.update(
      { 'id': palmId, 'health._id': healthId },
      { $set: { 'health.$.endDate': new Date() }},
      (err, result) => {
        console.log('err', err)
        return res.redirect('/dashboard/farm/' + palmId)
      }
  );
};

exports.postHarvest = async (req, res) => {
  const body = req.body;
  const palmId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/dashboard/farm/' + palmId)
  }
  const palm = await Palm.findOne({id: palmId}).exec();
  if(palm==null) return res.redirect('/dashboard/farm/');
  palm.harvest.push({
    weight: body.weight,
    date: new Date(),
    comment: body.comment
  });
  palm.save((err) => {
    console.log("err", err);
    return res.redirect('/dashboard/farm/' + palm.id)
  })
};


exports.fakerSeed = async (req, res) => {
  // res.send("test")
  console.log(faker)
  res.send(faker.date.between('2015-01-01', '2015-12-31'))
  const pt = constants.palmTypes;
  const ph = constants.palmHealth;
  let pd = faker.date.between('2010-01-01', '2019-08-31');
  for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
      let harvests = [];
      for(let ii=0; ii < 30; ii++){
        harvests.push({
          date: faker.date.between(pd, '2019-09-28'),
          weight: (Math.random() * 10) + 1,
          comment: faker.lorem.sentence()
        })
      }
      let health = [];
      for(let ii=0; ii < 5; ii++){
        let startDate = faker.date.between(pd, '2019-09-20')
        health.push({
          type: ph[Math.floor(Math.random()*ph.length)],
          startDate: startDate,
          endDate: (Math.random() > 0.5)? faker.date.between(startDate, '2019-09-28'): null,
          comment: faker.lorem.sentence()
        })
      }
      const palm = new Palm({
        farmerID: req.user.id,
        type: pt[Math.floor(Math.random()*pt.length)],
        age: Math.floor(Math.random() * 30) + 1,
        location: {row: i, column: j},
        plantationDate: pd,
        harvest: harvests,
        health
      });
      palm.save((err) => {
        console.log("err", err)
      })

    }
  }
  return res.send("success")
}