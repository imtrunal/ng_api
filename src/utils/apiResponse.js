const successResponse = (req, res, code = 200, message, data = null) => {
    res.status(code).send({
        code,
        success: true,
        message,
        data,
    });
}

const errorResponse = (req, res, code = 500, errorMessage = "Somthing went wrong") => {
    res.status(code).send({
        code,
        success: false,
        errorMessage
    });
}

module.exports = {
    successResponse,
    errorResponse
}