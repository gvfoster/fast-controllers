

class FastControllerException extends Error {
    
    override name = 'FastControllerException'
    public statusCode = 500

    constructor(message:string, statusCode?:number) {

        super(message)

        this.statusCode = statusCode || this.statusCode
    }
}

export { FastControllerException }
export default FastControllerException