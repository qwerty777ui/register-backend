import {Column, Index} from "typeorm";
import Model from "./model.entity";

export enum GENDER {
    MALE = "m",
    FEMALE = "f",
}

export abstract class Human extends Model {
    @Column({type: 'varchar', length: 255})
    @Index({unique: true})
    identifier: string;

    @Column({type: 'varchar', length: 255})
    last_name: string;

    @Column({type: 'varchar', length: 255})
    first_name: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    middle_name?: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    @Index({unique: true})
    pinfl?: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    email?: string;

    @Column({type: 'varchar', length: 255})
    @Index({unique: true})
    passport_number: string;

    @Column({type: 'date', nullable: true})
    birth_date?: Date;

    @Column({type: 'enum', enum: GENDER, nullable: true})
    gender?: GENDER;
}
