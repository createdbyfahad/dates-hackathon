/**
 * GET /
 * Home page.
 */
exports.getMain = (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard'
  });
};
