

class FastControllerError extends Error {
    
    override name = 'FastControllerError'
    
    constructor(message:string) {

        super(message)

        console.log(`FastControllerError.name: ${this.name}`)
    }
}

export default FastControllerError