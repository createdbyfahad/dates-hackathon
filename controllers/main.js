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
