import { SelectUserModel } from "../../db/schema/user";
import { ServiceResult } from "./serviceResult";

export type SessionUser = Omit<SelectUserModel, "password">;

// TODO => I don't think there's any point really using these. 
// We should refactor any code using these. We can inline type these so that services are typed as ServiceResult<whatever type we need to return>
export type UserRegisterResult = ServiceResult<SessionUser>;
export type UserLoginResult = ServiceResult<SessionUser>;
export type UserListResult = ServiceResult<SessionUser[]>;
export type UserDeleteResult = ServiceResult<SessionUser>;
export type VerifyUserResult = ServiceResult<string>;
export type PasswordResetResult = ServiceResult<string>;