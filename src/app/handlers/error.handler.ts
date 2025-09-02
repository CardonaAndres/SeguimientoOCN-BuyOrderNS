import { HttpException } from "@nestjs/common"

export type error = {
    message? : string,
    status? : number
}

export const errorHandler = (err : error) : never =>{
    throw new HttpException(
        err.message || 'Internal Server Error', 
        err.status || 500
    );
}