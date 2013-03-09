/**
 * 
 */
package com.imaginea.mongodb.controllers;

import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.imaginea.mongodb.controllers.BaseController.ResponseCallback;
import com.imaginea.mongodb.controllers.BaseController.ResponseTemplate;
import com.imaginea.mongodb.services.MediaService;
import com.imaginea.mongodb.services.impl.MediaServiceImpl;
import com.sun.jersey.multipart.FormDataBodyPart;
import com.sun.jersey.multipart.FormDataParam;

/**
 * Handles request for uploading media files. 
 * 
 * @author ramshad
 *
 */
@Path("/{dbName}/{collectionName}/mediafile")
public class MediaFileController {
	
	private final static Logger logger = Logger.getLogger(MediaFileController.class);
	
	@POST
    @Path("/upload")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
    //@Produces(MediaType.APPLICATION_JSON)
    public void uploadFile(@PathParam("dbName") final String dbName, 
    		                           @PathParam("collectionName") final String collectionName, 
    		                           @DefaultValue("POST") @QueryParam("action") final String action,
    		                           @FormDataParam("mediaType") final String mediaType,
    		                           @FormDataParam("mediaTitle") final String mediaTitle,
    		                           @FormDataParam("mediaEmbed") final String mediaEmbed,
                                       @FormDataParam("mediaPicture") final FormDataBodyPart mediaPictureFormData,
                                       @FormDataParam("mediaPicture") final InputStream mediaPictureInputStream,
                                       @FormDataParam("mediaFile") final FormDataBodyPart mediaFileFormData,
                                       @FormDataParam("mediaFile") final InputStream mediaFileInputStream,
                                       @FormDataParam("mediaWidth") final String mediaWidth,
                                       @FormDataParam("mediaHeight") final String mediaHeight,
                                       @QueryParam("connectionId") final String connectionId,
                                       @Context final HttpServletRequest request) {

        String response = new ResponseTemplate().execute(logger, connectionId, request, new ResponseCallback() {
            public Object execute() throws Exception {

            	MediaService mediaService = new MediaServiceImpl(connectionId);
                String resultStr = mediaService.insertMedia(dbName, collectionName, "mediaBucket", 
                		mediaType, mediaTitle, mediaEmbed, mediaPictureFormData,
                		mediaPictureInputStream, mediaFileFormData, mediaFileInputStream, mediaWidth, mediaHeight);
                
                JSONObject result = new JSONObject();
                logger.info("Stored media file : " + resultStr);
                result.put("result", resultStr);
                
                return result;
            }
        });
        //return "Media file uploaded: Click \"</pre><a href=\"" + request.getContextPath() + 
        //		"/home.html?connectionId=" + connectionId + "\">here</a><pre>\" to go back to mongodb admin.";
    }

}
