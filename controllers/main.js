const Palm = require('../models/Palm.js');
const constants = require('../constants');
const {validationResult } = require('express-validator');
/**
 * GET /
 * Home page.
 */
exports.getMain = async (req, res) => {

  res.render('dashboard', {
    title: 'Dashboard'
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
  if(palm==null) return res.redirect('/dashboard/farm/')
  res.render('farm/view', {
    title: 'Farm',
    palm: palm
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
  const palm = await Palm.findOne({id: palmId}).exec();
  if(palm==null) return res.redirect('/dashboard/farm/');
  palm.harvest.push({
    weight: body.weight,
    date: new Date(),
    comment: body.comment
  });
  palm.save((err) => {
    console.log("err", err)
    return res.redirect('/dashboard/farm/' + palm.id)
  })
};
