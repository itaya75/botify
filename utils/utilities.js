module.exports = {
    setErrorResponseAndConsole: function (consoleError, res, status, message, stat) {
        console.log(consoleError);
        return this.setErrorResponse(res, status, message, stat);
    },
    setErrorResponse: function (res, status, message, stat) {
        var response = {};
        response.status = status;
        response.message = message;
        return res.status(stat).json(response);
    },
    setResponse: function (res, status, message, stat, response) {
        response.status = status;
        response.message = message;
        return res.status(stat).json(response);
    }
};