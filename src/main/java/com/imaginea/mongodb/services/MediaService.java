package com.imaginea.mongodb.services;

import java.io.InputStream;

import com.imaginea.mongodb.exceptions.DocumentException;
import com.sun.jersey.multipart.FormDataBodyPart;

public interface MediaService {

	String insertMedia(String dbName, 
			           String collectionName,
			           String bucketName, 
			           String mediaType, 
			           String mediaTitle,
			           String mediaEmbed,
			           FormDataBodyPart mediaPictureFormData, 
			           InputStream mediaPictureInputStream, 
			           FormDataBodyPart mediaFileFormData, 
			           InputStream mediaFileInputStream, 
			           String mediaWidth,
			           String mediaHeight) throws DocumentException; 
}
