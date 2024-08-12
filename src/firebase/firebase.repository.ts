import { Inject, Injectable } from '@nestjs/common';
import { app, storage } from 'firebase-admin';

@Injectable()
export class FirebaseRepository {
    private readonly storage: storage.Storage;

    constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
        this.storage = this.firebaseApp.storage();
    }

    async uploadFile(filePath: string, file: Buffer) {
        const bucket = this.storage.bucket();
        const fileRef = bucket.file(filePath);
        return await fileRef.save(file);
    }


}
