YUI.add('query-executor', function(Y) {
    YUI.namespace('com.imaginea.mongoV');
    var MV = YUI.com.imaginea.mongoV;
    var successHandler, currentSelection, isShowPendingAccessRequests=false;

    MV.loadQueryBox = function(keysUrl, dataUrl, selectedCollection, sHandler, pendingAccessRequestUrl) {

        successHandler = sHandler;
        currentSelection = selectedCollection;

        /**
         * It sends request to get the keys from first 10 records only. Updates all key with another request.
         */
        Y.io(keysUrl, {
            method: "GET",
            data: 'allKeys=false',
            on: {
                success: function(ioId, responseObject) {
                	isShowPendingAccessRequests = false;
                    populateQueryBox(ioId, responseObject);
                    executeQuery(null);
                    // Now sending request to fetch all keys
                    populateAllKeys();
                },
                failure: function(ioId, responseObject) {
                    MV.hideLoadingPanel();
                    MV.showAlertMessage("Unexpected Error: Could not load the query Box", MV.warnIcon);
                    Y.log("Could not send the request to get the keys in the collection. Response Status: [0]".format(responseObject.statusText), "error");
                }
            }
        });

        /**
         *The function is an event handler for the execute query button. It gets the query parameters
         *and sends a request to get the documents
         * @param {Object} event The event object
         */
        function executeQuery(event) {
            var queryParams = getQueryParameters();
            if (queryParams !== undefined) {
                MV.showLoadingPanel("Loading Documents...");
                Y.io(dataUrl, {
                    method: "GET",
                    data: queryParams,
                    on: {
                        success: function(request, response) {
                        	isShowPendingAccessRequests = false;
                            var parsedResponse = Y.JSON.parse(response.responseText).response;
                            var result = parsedResponse.result, error = parsedResponse.error;
                            if (result && !error) {
                                updateAnchors(result.count, result.editable);
                                successHandler(result);
                            } else {
                                MV.hideLoadingPanel();
                                MV.showAlertMessage("Error executing query: [0]".format(error.message), MV.warnIcon);
                            }
                        },
                        failure: function(request, response) {
                            MV.hideLoadingPanel();
                            MV.showAlertMessage("Error executing query: [0]".format(response.responseText), MV.warnIcon);
                        }
                    }
                });
            }
        }

        /**
         * The function is an event handler for the show all pending requests button.
         */
        function showAllPendingRequests(event) {
        	var queryParams = getQueryParameters();
        	if (queryParams !== undefined) {
	            MV.showLoadingPanel("Loading all pending requests...");
	            Y.io(pendingAccessRequestUrl, {
	                method: "GET",
	                data: queryParams,
	                on: {
	                   success: function(request, response) {
	                	   isShowPendingAccessRequests = true;
	                        var parsedResponse = Y.JSON.parse(response.responseText).response;
	                        var result = parsedResponse.result, error = parsedResponse.error;
	                        if (result && !error) {
	                            updateAnchors(result.count, result.editable);
	                            successHandler(result);
	                        } else {
	                            MV.hideLoadingPanel();
	                            MV.showAlertMessage("Error executing query: [0]".format(error.message), MV.warnIcon);
	                        }
	                        },
	                        failure: function(request, response) {
	                            MV.hideLoadingPanel();
	                            MV.showAlertMessage("Error executing query: [0]".format(response.responseText), MV.warnIcon);
	                        }
	                    }
	                });
        	}
        }
        
        function uploadMediaFile(eventObject) {
        	var mediaType = Y.one('#mediaType').get("value");
            var mediaTitle = Y.one('#mediaTitle').get("value");
            var mediaEmbed = Y.one('#mediaEmbed').get("value");
            var mediaPicture = Y.one('#mediaPicture').get("value");
            var mediaFile = Y.one('#mediaFile').get("value");
            var musicFile = Y.one('#musicFile').get("value");
            var mediaWidth = Y.one('#mediaWidth').get("value");
            var mediaHeight = Y.one('#mediaHeight').get("value");
            var isValid = validateMediaUploadParams(mediaType, mediaTitle, mediaEmbed, mediaPicture, mediaFile, musicFile, mediaWidth, mediaHeight);
            if(isValid) {
            	try {
            		//alert("You are about to save media file with title " + mediaTitle + "\n" +
            		//		"Click on media_files collection to view newly added media file.");
	            	YAHOO.util.Connect.setForm('mediaFileuploadForm', true);
	            	YAHOO.util.Connect.asyncRequest('POST', MV.URLMap.mediaFileUpload(), {
	                    success: function(o) {
	                    	alert("Success");
	                        var parsedResponse = Y.JSON.parse(responseObject.responseText);
	                        var response = parsedResponse.response.result;
	                        if (response !== undefined) {
	                            MV.showAlertMessage("Media File Uploaded.", MV.infoIcon);
	      	                  Y.one('#execQueryButton').simulate('click');
	      	                  Y.log("Media file uploaded".format(response), "info");
	      	              } else {
	      	                  var error = parsedResponse.response.error;
	      	                  MV.showAlertMessage("Could not update Document ! [0]", MV.warnIcon, error.code);
	      	                  Y.log("Could not update Document ! [0]".format(MV.errorCodeMap[error.code]), "error");
	      	              }
	      	            },
	      	            failure: function(o) {
	      	            	alert("Failure");
	      	                MV.showAlertMessage("Unexpected Error: Could not update the document. Check if app server is running", MV.warnIcon);
	      	                Y.log("Could not send the request to update the document. Response Status: [0]".format(responseObject.responseText), "error");
	      	            }
	      	        });
            	
            	} catch (e) {
            	    var message = e.message.substr(e.message.indexOf(":") + 1);
            	    MV.showAlertMessage("Invalid Document format: " + message, MV.warnIcon);
            	    Y.one('#mediaTitle').focus();
            	}
            }
        }

        function validateMediaUploadParams(mediaType, mediaTitle, mediaEmbed, mediaPicture, mediaFile, musicFile, mediaWidth, mediaHeight) {
        	if(mediaType === '') {
        		alert("Select a media type");
        		return false;
        	}
        	if(mediaTitle === '') {
        		alert("Enter media title");
        		return false;
        	}
        	if(mediaEmbed === '') {
        		alert("Enter media embed");
        		return false;
        	}
        	if(mediaPicture === '') {
        		alert("Select a media picture");
        		return false;
        	}
        	if(mediaFile === '') {
        		alert("Select a media file");
        		return false;
        	}
        	if(mediaType === 'music' || mediaType === 'sounds' ) {
        		if(musicFile === '') {
            		alert("Select a music/sound file");
            		return false;
            	}
        	}
        	if(mediaWidth === '') {
        		alert("Enter width");
        		return false;
        	}
        	if(mediaHeight === '') {
        		alert("Enter height");
        		return false;
        	}
        	return true;
        }
        
        function populateAllKeys() {
            Y.io(keysUrl, {
                method: "GET",
                data: 'allKeys=true',
                on: {
                    success: function(ioId, responseObject) {
                        var parsedResponse = Y.JSON.parse(responseObject.responseText);
                        var keys = parsedResponse.response.result.keys;
                        if (keys !== undefined) {
                            var innerHTML = formatKeys(keys);
                            Y.one('#fields').set('innerHTML', innerHTML);
                        }
                    },
                    failure: function(ioId, responseObject) {
                        MV.hideLoadingPanel();
                        MV.showAlertMessage("Unexpected Error: Could not load the query Box", MV.warnIcon);
                        Y.log("Could not send the request to get the keys in the collection. Response Status: [0]".format(responseObject.statusText), "error");
                    }
                }
            });
        }

        /**
         *The function is success handler for the request of getting all the keys in a collections.
         *It parses the response, gets the keys and makes the query box. It also sends the request to load the
         *documents after the query box has been populated,
         * @param {Number} e Id
         * @param {Object} The response Object
         */
        function populateQueryBox(ioId, responseObject) {
            var parsedResponse, keys, count, queryForm, error;
            Y.log("Preparing to show QueryBox", "info");
            try {
                parsedResponse = Y.JSON.parse(responseObject.responseText);
                keys = parsedResponse.response.result.keys;
                count = parsedResponse.response.result.count;
                if (keys !== undefined || count !== undefined) {
                    document.getElementById('queryExecutor').style.display = 'block';
                    queryForm = Y.one('#queryForm');
                    queryForm.addClass('form-cont');
                    MV.header.set("innerHTML", "");
                    MV.mainBody.empty(true);
                    queryForm.set("innerHTML", getForm(keys, count));
                    MV.mainBody.set("innerHTML", paginatorTemplate.format(count < 25 ? count : 25, count));
                    initListeners();
                    Y.log("QueryBox loaded", "info");
                } else {
                    error = parsedResponse.response.error;
                    Y.log("Could not get keys. Message: [0]".format(error.message), "error");
                    MV.showAlertMessage("Could not load the query Box! [0]".format(MV.errorCodeMap(error.code)), MV.warnIcon);
                }
            } catch (e) {
                Y.log("Could not parse the JSON response to get the keys", "error");
                Y.log("Response received: [0]".format(responseObject.responseText), "error");
                MV.showAlertMessage("Cannot parse Response to get keys!", MV.warnIcon);
            }
        }

        var getForm = function(keys, count) {
            var checkList = "", selectTemplate = "";
            if (keys !== undefined) {
                selectTemplate = [
                    "<a id='selectAll' class='navigationRight' href='javascript:void(0)'>Select All</a>",
                    "<label> / </label>",
                    "<a id='unselectAll' href='javascript:void(0)'>Unselect All</a>"
                ].join('\n');
                checkList = "<div id='checkListDiv'><div class='queryBoxlabels'><label for='fields' >Attributes</label>" + selectTemplate + "</div><div><ul id='fields' class='checklist'>";
                checkList += formatKeys(keys);
                checkList += "</ul>";
                checkList += "</div>";
                checkList += "</div>";
            }
            if(currentSelection === 'access_requests') {
            	return upperPartTemplate.format(currentSelection) + checkList + lowerPartTemplate + showPendingAccessRequests;
            } else if(currentSelection === 'media_files') {
            	return upperPartTemplate.format(currentSelection) + checkList + lowerPartTemplate + mediaFileUploadForm;
            } else {
            	return upperPartTemplate.format(currentSelection) + checkList + lowerPartTemplate;
            }
            
        };

        function formatKeys(keys) {
            var checkList = "";
            for (var index = 0; index < keys.length; index++) {
                checkList += checkListTemplate.format(keys[index], keys[index], keys[index], keys[index]);
            }
            return checkList;
        }

        var upperPartTemplate = [
            "<div id='queryBoxDiv'>",
            "<div class='queryBoxlabels'>",
            "<label>Define Query</label>",
            "</div>",
            "<div>",
            "<textarea id='queryBox' name='queryBox' class='queryBox'>",
            "db.[0].find({\r\r})",
            "</textarea>",
            "</div>",
            "</div>"

        ].join('\n');

        var checkListTemplate = "<li><label for='[0]'><input id='[1]' name='[2]' type='checkbox' checked=true />[3]</label></li>";

        var lowerPartTemplate = [
            "<div id='parametersDiv'>",
            "<label for='skip'> Skip(No. of records) </label><br/><input id='skip' type='text' name='skip' value='0'/><br/>",
            "<label for='limit'> Max page size: </label><br/><span><select id='limit' name='limit'><option value='10'>10</option><option value='25'>25</option><option value='50'>50</option></select></span><br/>  ",
            "<label for='sort'> Sort by fields </label><br/><input id='sort' type='text' name='sort' value='_id:1'/><br/><br/>",
            "<button id='execQueryButton' class='bttn'>Execute Query</button>",
            "</div>"
        ].join('\n');
        
        var showPendingAccessRequests = ["<div id='parametersDiv'>","<button id='showAllPendingRequests' class='bttn'>Show All Pending Requests</button>","</div>"].join('\n');
        var mediaFileUploadForm = ["<div id='parametersDiv'>",
                                   "<form id=\"mediaFileuploadForm\" action=\"" + MV.URLMap.mediaFileUpload() + "\" method=\"POST\" enctype=\"multipart/form-data\">" +
                                   "<table width=\"20%\">" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>Media Type</label>" +
                                       "</td>" +
                                       "<td>" +
                                         "<select id=\"mediaType\" name=\"mediaType\">" +
                                           "<option value=\"\">Select a media type</option>" +
                                           "<option value=\"animations\">Animation</option>" +
                                           "<option value=\"effects\">Effect</option>" +
                                           "<option value=\"emoticons\">Emoticon</option>" +
                                           "<option value=\"filters\">Filter</option>" +
                                           "<option value=\"icons\">Icon</option>" +
                                           "<option value=\"images\">Image</option>" +
                                           "<option value=\"music\">Music</option>" +
                                           "<option value=\"sounds\">Sounds</option>" +
                                         "</select>" +
                                       "</td>" +
                                     "</tr>" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>Media Title</label>" +
                                       "</td>" +
                                       "<td>" +
                                         "<input type=\"text\" id=\"mediaTitle\" name=\"mediaTitle\" value=\"\">" +
                                       "</td>" +
                                     "</tr>" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>Embed</label>" +
                                       "</td>" +
                                       "<td>" +
                                         "<input type=\"text\" id=\"mediaEmbed\" name=\"mediaEmbed\" value=\"\">" +
                                       "</td>" +
                                     "</tr>" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>Media Picture <font color=\"blue\">(Media Thumbnail)</font></label>" +
                                       "</td>" +
                                       "<td>" +
                                         "<input type=\"file\" id=\"mediaPicture\" name=\"mediaPicture\" size=\"40\">" +
                                       "</td>" +
                                     "</tr>" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>Media File <font color=\"blue\">(XML/SVG)</font></label>" +
                                       "</td>" +
                                       "<td>" +
                                         "<input type=\"file\" id=\"mediaFile\" name=\"mediaFile\" size=\"40\">" +
                                       "</td>" +
                                     "</tr>" +
                                     "<tr>" +
                                     "<td>" +
                                       "<label>Music / Sound File <font color=\"blue\">(Not required for other media types)</font></label>" +
                                     "</td>" +
                                     "<td>" +
                                       "<input type=\"file\" id=\"musicFile\" name=\"musicFile\" size=\"40\">" +
                                     "</td>" +
                                   "</tr>" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>Width</label>" +
                                       "</td>" +
                                       "<td>" +
                                         "<input type=\"text\" id=\"mediaWidth\" name=\"mediaWidth\" value=\"\">" +
                                       "</td>" +
                                     "</tr>" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>Media Height</label>" +
                                       "</td>" +
                                       "<td>" +
                                         "<input type=\"text\" id=\"mediaHeight\" name=\"mediaHeight\" value=\"\">" +
                                       "</td>" +
                                     "</tr>" +
                                     "<tr>" +
                                       "<td>" +
                                         "<label>&nbsp;</label>" +
                                       "</td>" +
                                     "<td>" +
                                     "<input type=\"submit\" id=\"uploadMediaFileButton\" value=\"Upload Media File\" class='bttn'>" +
                                     "</td>" +
                                   "</tr>" +
                                   "</table></form>" +
                                   "<p><font color=\"red\">Note**: Click on media_files collection to reload the data after upload.</font></p>","</div>"].join('\n');

        var paginatorTemplate = [
            "<div id='paginator'>",
            "<a id='first' href='javascript:void(0)'>&laquo; First</a>",
            "<a id='prev'  href='javascript:void(0)'>&lsaquo; Previous</a>",
            "<label>Showing</label>", "<label id='startLabel'> 1 </label>", "<label> - </label>",
            "<label id='endLabel'> [0] </label>", "<label> of </label>", "<label id='countLabel'> [1] </label>",
            "<a id='next' href='javascript:void(0)'>Next &rsaquo;</a>",
            "<a id='last' href='javascript:void(0)'>Last &raquo;</a>",
            "</div>"
        ].join('\n');

        function initListeners() {
            Y.on("click", executeQuery, "#execQueryButton");
            Y.on("click", showAllPendingRequests, "#showAllPendingRequests");
            Y.on("click", uploadMediaFile, "#uploadMediaFileButton");
            Y.on("click", handleSelect, "#selectAll");
            Y.on("click", handleSelect, "#unselectAll");
            Y.on("click", handlePagination, "#first");
            Y.on("click", handlePagination, "#prev");
            Y.on("click", handlePagination, "#next");
            Y.on("click", handlePagination, "#last");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                	if(isShowPendingAccessRequests) {
                		Y.one('#showAllPendingRequests').simulate('click');
                	} else {
                		Y.one('#execQueryButton').simulate('click');
                	}
                    
                }
            }, "#queryBox");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation on skip field
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                	if(isShowPendingAccessRequests) {
                		Y.one('#showAllPendingRequests').simulate('click');
                	} else {
                		Y.one('#execQueryButton').simulate('click');
                	}
                }
            }, "#skip");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation on limit field
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                	if(isShowPendingAccessRequests) {
                		Y.one('#showAllPendingRequests').simulate('click');
                	} else {
                		Y.one('#execQueryButton').simulate('click');
                	}
                }
            }, "#limit");
        }

        function handleSelect(event) {
            var id = event.currentTarget.get("id");
            var elements = Y.Selector.query('ul[id=fields] input');
            if (id === "selectAll") {
                Y.Array.each(elements, function(element) {
                    element.checked = true;
                });
            } else {
                Y.Array.each(elements, function(element) {
                    element.checked = false;
                });
            }
        }

        function handlePagination(event) {
            var href = event.currentTarget.get("href");
            if (href == null || href == undefined || href == "")
                return;
            var id = event.currentTarget.get("id");
            var skip = Y.one('#skip'), limit = Y.one('#limit'), count = Y.one('#countLabel');
            var skipValue = parseInt(skip.get('value')), limitValue = parseInt(limit.get('value')), countValue = parseInt(count.get('text'));
            if (id === "first") {
                skip.set('value', 0);
            } else if (id === "prev") {
                skip.set('value', (skipValue - limitValue) < 0 ? 0 : (skipValue - limitValue));
            } else if (id === "next") {
                skip.set('value', skipValue + limitValue);
            } else if (id === "last") {
                skip.set('value', countValue - limitValue);
            }
            if(isShowPendingAccessRequests) {
        		Y.one('#showAllPendingRequests').simulate('click');
        	} else {
        		Y.one('#execQueryButton').simulate('click');
        	}
            updateAnchors(countValue, true);
        }

        function updateAnchors(count, showPaginated) {
            var first = Y.one('#first'), prev = Y.one('#prev'), next = Y.one('#next'), last = Y.one('#last');
            var start = Y.one('#startLabel'), end = Y.one('#endLabel'), countLabel = Y.one('#countLabel');
            var skip = parseInt(Y.one('#skip').get('value')), limit = parseInt(Y.one('#limit').get('value'));
            if (skip == 0 || !showPaginated)
                disableAnchor(first);
            else
                enableAnchor(first);
            if (skip + limit <= limit || !showPaginated)
                disableAnchor(prev);
            else
                enableAnchor(prev);
            if (skip >= count - limit || !showPaginated)
                disableAnchor(next);
            else
                enableAnchor(next);
            if (skip + limit >= count || !showPaginated)
                disableAnchor(last);
            else
                enableAnchor(last);
            var size = showPaginated ? skip + limit : count;
            start.set('text', count != 0 ? skip + 1 : 0);
            end.set('text', count <= size ? count : skip + limit);
            countLabel.set('text', count);
        }

        function enableAnchor(obj) {
            obj.setAttribute('href', 'javascript:void(0)');
            obj.setStyle('color', '#39C');
        }

        function disableAnchor(obj) {
            obj.removeAttribute('href');
            obj.setStyle('color', 'grey');
        }

        /**
         * This function gets the query parameters from the query box. It takes the
         * query string, the limit value, skip value and the fields selected and return a
         * query parameter string which will be added to the request URL
         * @returns {String} Query prameter string
         *
         */
        function getQueryParameters() {
            var parsedQuery, query = Y.one('#queryBox').get("value").trim(),
                limit = Y.one('#limit').get("value"),
                skip = Y.one('#skip').get("value").trim(),
                fields = Y.all('#fields input'),
                sortBy = "{" + Y.one('#sort').get("value") + "}",
                index = 0, checkedFields = [], item;

            if (query === "") {
                query = "{}";
            }

            //replace the single quotes (') in the query string by double quotes (")
            query = query.replace(/'/g, '"');
            query = query.replace(/\r/g, '');
            query = query.replace(/\n/g, '');

            try {
                for (index = 0; index < fields.size(); index++) {
                    item = fields.item(index);
                    if (item.get("checked")) {
                        checkedFields.push(item.get("name"));
                    }
                }
                return ("&query=[0]&limit=[1]&skip=[2]&fields=[3]&sortBy=[4]".format(query, limit, skip, checkedFields, sortBy));
            } catch (error) {
                Y.log("Could not parse query. Reason: [0]".format(error), "error");
                MV.showAlertMessage("Failed:Could not parse query. [0]".format(error), MV.warnIcon);
            }
        }
    };

    MV.hideQueryForm = function() {
        var queryForm = Y.one('#queryForm');
        queryForm.removeClass('form-cont');
        queryForm.set("innerHTML", "");
        document.getElementById('queryExecutor').style.display = 'none';
    };

}, '3.3.0', {
    requires: ["json-parse", "node-event-simulate"]
});

