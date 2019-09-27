const Palm = require('../models/Palm.js');


/**
 * GET /
 * Home page.
 */
exports.getMain = async (req, res) => {

  const palms = await Plam.find({}).exec();

  res.render('dashboard', {
    title: 'Dashboard',
    palms: palms
  });
};
