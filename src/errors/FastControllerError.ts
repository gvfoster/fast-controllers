

class FastControllerError extends Error {
    
    override name = 'FastControllerError'
    public statusCode = 500

    constructor(message:string, statusCode?:number) {

        super(message)

        this.statusCode = statusCode || this.statusCode
    }
}

export default FastControllerError