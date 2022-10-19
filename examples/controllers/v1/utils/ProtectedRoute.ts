import JwtAuthController from "../../.auth/JwtAuthController"

export default class ProtectedRoute extends JwtAuthController {

    public override get() {
        return 'wont see this unless you provide a valid token'
    }
}