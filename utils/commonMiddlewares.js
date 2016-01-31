function sendResult (req, res, next) {
    res.send(req.result);
}

module.exports.sendResult = sendResult;