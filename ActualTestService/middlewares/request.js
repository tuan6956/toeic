const handleSuccess = (res, status, data) => {
    return res.status(status).send(data);
}

const handleError = (res, status, messageError = 'Error') => {
    return res.status(status).send({
        messageError
    });
}

module.exports = {
    handleSuccess,
    handleError
}
