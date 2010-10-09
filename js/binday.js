var MAX_BITS_FOR_CHAR_CODE=8;
var MSB_CHAR_CODE=1 << (MAX_BITS_FOR_CHAR_CODE - 1);
var MIN_BITS_TO_CONSIDER_FOR_DECODE=8;
var EMPTY_MESSAGE_PROMPT="Enter some text above to convert to or from binary!";
var ADVERT=" 10day.co.uk";
var TWITTER_STATUS_URL="http://twitter.com/?status=";

function getUrlVars() {
	var vars = [], hash;
	var query = decodeURI(window.location.href.slice(window.location.href.indexOf('?') + 1));
	var hashes = query.split('&');
 
	for(var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
 
	return vars;
}

function binaryGroupToString(group) {
	var value = 0;
	
	for(var i = 0; i < group.length; i++) {
		if(group.charAt(i) == "1") {
			value = value | (1 << ((group.length-1) - i));
		}
	}
	
	return value;
}

function stringFromBinaryString(binary) {
	var message = "";
	var group = "";
	var c;
	
	for(var i = 0; i < binary.length; i++) {
		c = binary.charAt(i);
		if(c == "0" || c == "1") {
			group += c;
			if(group.length >= MAX_BITS_FOR_CHAR_CODE) {
				message += String.fromCharCode(binaryGroupToString(group));
				processedGroup = true;
				group = "";
			}
		} else {
			var processedGroup = false;
			
			if(group.length >= MIN_BITS_TO_CONSIDER_FOR_DECODE) {
				message += String.fromCharCode(binaryGroupToString(group));
				processedGroup = true;
			} else {
				message += group;
			}
			group = "";
			message += c;
		}
	}
	
	if(group.length >= MIN_BITS_TO_CONSIDER_FOR_DECODE) {
		message += String.fromCharCode(binaryGroupToString(group));
	} else {
		message += group;
	}

	return message;
}

function valueToBinaryString(value) {
	var binary = "";
	
	for(var i = 0; i < MAX_BITS_FOR_CHAR_CODE; i++) {
		if((value & (MSB_CHAR_CODE >>> i)) !== 0) {
			binary += "1";
		} else {
			binary += "0";
		}
	}
	
	return binary;
}

function stringToBinaryString(message) {
	var binary = "";
	
	for(var i = 0; i < message.length; i++) {
		binary += valueToBinaryString(message.charCodeAt(i));
	}
	
	return binary;
}

function messageIsProbablyBinary(message) {
	var bitRun = 0;
	
	for(var i = 0; i < message.length; i++) {
		var c = message.charAt(i);
		if(c == "0" || c == "1") {
			bitRun += 1;
		} else {
			if(bitRun >= MIN_BITS_TO_CONSIDER_FOR_DECODE) {
				return true;
			}
			bitRun = 0;
		}
	}
	if(bitRun >= MIN_BITS_TO_CONSIDER_FOR_DECODE) {
		return true;
	} else {
		return false;
	}
}

function showAssist() {
	$("#content-label").html("What To Do");
	$("#content-out").html(EMPTY_MESSAGE_PROMPT);
	$("#content-out:hidden").show();
	$("#tweet-list:visible").hide();
}

function setTranslation(message) {
	$("#content-label").html("Translation");
	$("#content-out").html(message);
	$("#content-out:hidden").show();
	$("#tweet-list:visible").hide();
}

function setBinaryTweets(binaryString) {
	$("#content-label").html("Binary");
	var tweets = packageString(binaryString);
	if(tweets.length > 0) {
		var tweetList = "";
		for(var i = 0; i < tweets.length; i++) {
			tweetList += getTweetPanelHTML(tweets[i], i);
		}
		$("#tweet-list").html(tweetList);
		$("#content-out:visible").hide();
		$("#tweet-list:hidden").show();
	} else {
		showAssist();
	}
}

function messageChanged() {
	var message = $("#message-text").val();
	var outMessage = "";
	if(messageIsProbablyBinary(message)) {
		setTranslation(stringFromBinaryString(message));
	} else {
		setBinaryTweets(stringToBinaryString(message));
	}
	updateInLink();
}

function updateInLink() {
	var message = $("#message-text").val();
	$("#in-link").attr("href", getMessageHREF(message));
}

function packageString(bitString) {
	var maxBits = Math.floor((140 - ADVERT.length) / 8) * 8;
	var packages = [];
	while(bitString.length > maxBits) {
		var segment = bitString.substr(0, maxBits);
		bitString = bitString.slice(maxBits);
		packages.push(segment + ADVERT);
	}
	
	if(bitString.length > 0) {
		packages.push(bitString + ADVERT);
	}
	
	return packages;
}

function processUrlVars(vars) {
	if(vars !== null) {
		if(vars.message) {
			$("#message-text").val(vars.message);
			messageChanged();
		}
	}
}

function getTweetPanelHTML(message, muid) {
	return '<div id="tweet-message" class="ui-corner-all">' + 
	           message +
	       '</div>' + 
	       '<div id="buttons">'+
	           '<a id="tweet-button" class="ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all" ' +
				  'target="bintweet_' + muid + '" ' + 
	              'href="' + TWITTER_STATUS_URL + encodeURI(message) +'">Tweet</a>'+
	       '</div>';
 }

function getMessageHREF(message) {
	return "?message=" + encodeURI(message);
}

$(document).ready(function() {
	showAssist();
	$("#message-text").keypress(messageChanged);
	$("#message-text").keydown(messageChanged);
	$("#message-text").keyup(messageChanged);
	$("#message-text").focus();
	processUrlVars(getUrlVars());
});
