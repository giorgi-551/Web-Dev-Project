export const errorHandler = (error, req, res, next) => {
    console.error(error.stack);

}

const message = error.message || "Irakla's fault  & Internal Error";
const statuscode = error.statuscode || 500; 


res.status(statuscode).json(
    {
        error: {
            message,
            statuscode,
            timestamp: new Date().toISOString(),
        },

    }
);

export class AppError extends Error {
    constructor(message, statuscode) {
        super(message);
        this.statuscode = statuscode;
    }
}



