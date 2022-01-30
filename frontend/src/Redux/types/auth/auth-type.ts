import { UserModel } from '../../../Models/User-Model';
export interface Auth {
    token: string | object | null;
    isAuthenticated: boolean | null;
    loading: boolean;
    user: UserModel
    refreshPage:boolean
}
