import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from './firebase.repository';
import { v4 as uuidv4 } from 'uuid';
import { FIREBASE_IMAGE_URL } from 'src/common/constances';

export enum UploadFolder {
    POST = 'post',
}

@Injectable()
export class FirebaseService {
    constructor(private readonly firebaseRepository: FirebaseRepository) {}

    async uploadFile(file: Express.Multer.File, folder: UploadFolder) {
        // get file extension
        const fileExtension = file.originalname.split('.').pop();
        if (!fileExtension) {
            throw new Error('Invalid file extension');
        }

        const uniqueFileName = uuidv4();

        const filePath = `${folder}/${uniqueFileName}.${fileExtension}`;
        await this.firebaseRepository.uploadFile(filePath, file.buffer);

        const imageUrl = `${FIREBASE_IMAGE_URL}/${folder}%2F${uniqueFileName}.${fileExtension}?alt=media`;
        return imageUrl;
    }
}
