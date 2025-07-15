import { SessionUser } from "../services/user";

// Augment the default user used by express
declare global {
  namespace Express {
    interface User extends SessionUser {}

    interface Request {
      validated: {
        id? : number;
        //data?: TODO => We could also augment data here
      };
    }
  }
}
