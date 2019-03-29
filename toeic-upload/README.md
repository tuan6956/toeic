# toeic-upload
Upload image in toeic app

## Deploy server
```
http://103.114.107.16:8001/api/uploadPhoto
http://103.114.107.16:8001/api/uploadPhotos
http://103.114.107.16:8001/api/uploadAudio
http://103.114.107.16:8001/api/uploadAudios
```
## To test
Run test.html and upload image

## Parameter
Content-type: multipart/form-data

Key:file

## Example return value:
### Success
```json
{
  "status": 1,
  "message": {
    "fieldname": "file",
    "originalname": "uprace.png",
    "encoding": "7bit",
    "mimetype": "image/png",
    "destination": "./public/image/uploads/",
    "filename": "file-1553830500019.png",
    "path": "public/image/uploads/file-1553830500019.png",
    "size": 1183805
  }
}
```
### Error
```json
{
  "status": -1,
  "message": "error"
}
```
