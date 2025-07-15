import { SelectUserModel } from "../../db/schema/user";
import { ServiceResult } from "./serviceResult";

export type SessionUser = Omit<SelectUserModel, "password">;
export type UserRegisterResult = ServiceResult<SessionUser>;
export type UserLoginResult = ServiceResult<SessionUser>;
export type UserListResult = ServiceResult<SessionUser[]>;
export type UserDeleteResult = ServiceResult<SessionUser>;
