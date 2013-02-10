/**
 * 
 */
package com.imaginea.mongodb.domain;

/**
 * Represents different media types.
 * 
 * @author ramshad
 *
 */
public enum MediaType {
	
	ANIMATION("ANIMATION", "image"),
	EFFECT("EFFECT", "content"),
	EMOTICON("EMOTICON", "image"),
	FILTER("FILTER", "content"),
	ICON("ICON", "image"),
	IMAGE("IMAGE", "image"),
	MUSIC("MUSIC", "foreign"),
	SOUNDS("SOUNDS", "foreign");
	
	private String code;
	private String embed;
	
	private MediaType(String code, String embed) {
		this.code = code;
		this.embed = code;
	}
	
	public String getCode() {
		return this.code;
	}
	
	public String getEmbed() {
		return this.embed;
	}
	
	public static MediaType fromCode(String code) {
		MediaType mediaType = null;
		for(MediaType type: MediaType.values()) {
			if(type.getCode().equals(code)) {
				mediaType = type;
				break;
			}
		}
		return mediaType;
	}

}
