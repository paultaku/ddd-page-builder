// Authenticate via a mock login (github / google / email). Returns the User;
// session persistence is the caller's concern (client-side localStorage).
import type { AuthApiRepository } from "../repositories/AuthApiRepository";
import type { LoginInput, UserModel } from "../adapters/auth.adapter";

export type LoginCommand = LoginInput;

export class LoginUseCase {
  constructor(private readonly repository: AuthApiRepository) {}

  execute(command: LoginCommand): Promise<UserModel> {
    return this.repository.login(command);
  }
}
