import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const isExistUserEmail = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        const isExistUserLogin = await this.userRepository.findOne({
            where: { login: createUserDto.login },
        });

        if (isExistUserEmail) {
            throw new BadRequestException("This email already exist!");
        }

        if (isExistUserLogin) {
            throw new BadRequestException("This login already exist!");
        }

        const user = await this.userRepository.save({
            ...createUserDto,
            password: await argon2.hash(createUserDto.password),
        });

        return { userID: user.id };
    }

    async findOne(login: string) {
        const user = await this.userRepository.findOne({
            where: { login },
            relations: {},
        });

        if (!user) throw new NotFoundException("The user is not found!");

        return user;
    }

    async findOneById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {},
            select: {
                id: true,
                login: true,
                email: true,
                firstName: true,
                secondName: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) throw new NotFoundException("The user is not found!");

        return user;
    }
}
