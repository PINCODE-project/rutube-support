import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum MessageStatusEnum {
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    REGENERATE = "REGENERATE",
}

@Entity()
export class Chat {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    question: string;

    @ApiProperty()
    @Column()
    answer: string;

    @ApiProperty()
    @Column()
    firstClass: string;

    @ApiProperty()
    @Column()
    secondClass: string;

    @ApiProperty()
    @Column({ nullable: true, default: null })
    form: string;

    @ApiProperty()
    @Column({ default: null })
    rating: number;

    @ApiProperty({ description: "Статус запроса" })
    @Column({
        default: MessageStatusEnum.IN_PROGRESS,
        type: "enum",
        enum: MessageStatusEnum,
    })
    status: MessageStatusEnum;

    @ApiProperty()
    @Column()
    userId: string;

    @ApiProperty()
    @Column()
    fullName: string;

    @ApiProperty()
    @Column()
    userName: string;

    @ApiProperty()
    @Column({ nullable: true, default: null })
    messageId: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;
}
