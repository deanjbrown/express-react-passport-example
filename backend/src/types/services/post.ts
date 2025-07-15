import { PostCreateSchema, SelectPostModel } from "../../db/schema/post";
import { ServiceResult } from "./serviceResult";

export type PostListResult = ServiceResult<SelectPostModel[]>;
export type PostDetailResult = ServiceResult<SelectPostModel>;
export type PostCreateResult = ServiceResult<PostCreateSchema>;
export type PostDeleteResult = ServiceResult<SelectPostModel>;
