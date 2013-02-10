package com.imaginea.mongodb.services.impl;

import java.io.InputStream;

import com.imaginea.mongodb.domain.MediaType;
import com.imaginea.mongodb.exceptions.ApplicationException;
import com.imaginea.mongodb.exceptions.DocumentException;
import com.imaginea.mongodb.exceptions.ErrorCodes;
import com.imaginea.mongodb.services.AuthService;
import com.imaginea.mongodb.services.DatabaseService;
import com.imaginea.mongodb.services.MediaService;
import com.imaginea.mongodb.utils.JSON;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.Mongo;
import com.mongodb.MongoException;
import com.mongodb.gridfs.GridFS;
import com.mongodb.gridfs.GridFSInputFile;
import com.sun.jersey.multipart.FormDataBodyPart;

public class MediaServiceImpl implements MediaService {
	
	private Mongo mongoInstance;
    private DatabaseService databaseService;

    private static final AuthService AUTH_SERVICE = AuthServiceImpl.getInstance();
	
	public MediaServiceImpl(String connectionId) throws ApplicationException {
        mongoInstance = AUTH_SERVICE.getMongoInstance(connectionId);
        databaseService = new DatabaseServiceImpl(connectionId);
    }

	@Override
	public String insertMedia(String dbName,
			                  String collectionName,
			                  String bucketName, 
			                  String mediaType, 
			                  String mediaTitle, 
			                  FormDataBodyPart mediaPictureFormData, 
			                  InputStream mediaPictureInputStream, 
			                  FormDataBodyPart mediaFileFormData, 
			                  InputStream mediaFileInputStream, 
			                  String mediaWidth,
			                  String mediaHeight) throws DocumentException {
		
		
        String result = null;
        try {
        	GridFS gridFS = new GridFS(mongoInstance.getDB(dbName), bucketName);
    		
            GridFSInputFile fsPictureFile = gridFS.createFile(mediaPictureInputStream, 
            		mediaPictureFormData.getFormDataContentDisposition().getFileName());
            fsPictureFile.setContentType(mediaPictureFormData.getMediaType().toString());
            fsPictureFile.save();
            String pictureId = JSON.serialize(fsPictureFile.getId());
            
            GridFSInputFile fsMediaFile = gridFS.createFile(mediaFileInputStream, 
            		mediaFileFormData.getFormDataContentDisposition().getFileName());
            fsMediaFile.setContentType(mediaFileFormData.getMediaType().toString());
            fsMediaFile.save();
            String mediaFileId = JSON.serialize(fsMediaFile.getId());
            
            DBCollection mediaFileCollection = mongoInstance.getDB(dbName).getCollection(collectionName);
            
            MediaType mediaTypeEnum = MediaType.fromCode(mediaType);
            
            BasicDBObject mediaFileDocument = new BasicDBObject();
            mediaFileDocument.put("mediaType", mediaType);
            mediaFileDocument.put("mediaTitle", mediaTitle);
            mediaFileDocument.put("pictureId", pictureId);
            mediaFileDocument.put("mediaFileId", mediaFileId);
            mediaFileDocument.put("embed", mediaTypeEnum.getEmbed());
            mediaFileDocument.put("width", mediaWidth);
            mediaFileDocument.put("height", mediaHeight);
            
            mediaFileCollection.insert(mediaFileDocument);
            
            result = "Inserted Document with data : [" + mediaFileDocument + "]";
        } catch (MongoException e) {
            throw new DocumentException(ErrorCodes.DOCUMENT_CREATION_EXCEPTION, e.getMessage());
        }
		return result;
	}

}
