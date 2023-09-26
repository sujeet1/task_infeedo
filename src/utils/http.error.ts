class HttpException extends Error {
    public status: number;
    public message: string;

    constructor(status: number = 500, message: string = 'Something went wrong!!') {
        super(message);
        this.status = status;
        this.message = message;
    }
}

export default HttpException;