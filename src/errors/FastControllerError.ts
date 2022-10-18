

class FastControllerError extends Error {
    
    override name = 'FastControllerError'
    
    constructor(message:string) {
        super(message)
    }
}

export default FastControllerError