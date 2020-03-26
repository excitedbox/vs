import User from "../server/user/User";
import TypeApplicationInfo from "./TypeApplicationInfo";

export default class TypeSession {
    public key: string;
    public readonly user: User;
    public readonly application: TypeApplicationInfo;
}