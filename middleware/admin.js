module.exports = function(req, res, next) {
    console.log("REQ USER =>" ,req.user);
      if (req.user.userRole !== 'admin') {
        return res.status(403).send('Access denied');
      }
      next(); 
    };
    