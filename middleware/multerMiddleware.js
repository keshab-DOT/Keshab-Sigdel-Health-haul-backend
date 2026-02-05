import multer from "multer";

const storage= multer.diskStorage({
    destination : function(req, file, cb){
        const allowedFileType=['image/jpg', 'image/png', 'image/jpeg'];
        if(!allowedFileType.includes(file.mimetype)){
            cb (new Error("The file is not supported"))
        }
        cb(null, "./storage")
    },
    filename : function(req, file, cb){
        cb(null, Date.now()+ "-" + file.originalname)
    }
})

export {multer, storage}