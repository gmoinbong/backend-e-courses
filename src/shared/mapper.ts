import { UserDto } from "src/users/dto/user.dto";
import { UserEntity } from "src/users/entity/user.entity";

export const toUserDto = (data: UserEntity): UserDto => {
    const { username, email, id } = data;

    let userDto: UserDto = {
        id,
        username,
        email,
    }
    return userDto;
}