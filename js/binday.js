var MAX_BITS_FOR_CHAR_CODE = 16;
var MSB_CHAR_CODE = 1 << (MAX_BITS_FOR_CHAR_CODE - 1);
var MIN_BITS_TO_CONSIDER_FOR_DECODE = 4;
var BIN_DELIM = " ";
var EMPTY_MESSAGE_PROMPT = "Enter some text above to convert to or from binary!";

var g_binaryString = "";
var g_outMessage = EMPTY_MESSAGE_PROMPT;

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
			
			if(processedGroup && c == BIN_DELIM) {
				c = "";
			}
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
	
	while(binary.length > 0 && (binary.charAt(0) == "0")) {
		binary = binary.substr(1);
	}
	
	return binary;
}

function stringToBinaryString(message) {
	var binary = "";
	
	for(var i = 0; i < message.length; i++) {
		if(binary.length > 0) {
			binary += " ";
		}
		binary += valueToBinaryString(message.charCodeAt(i));
	}
	
	return binary;
}

function messageIsProbablyBinary(message) {
	var bitRun = 0;
	var maxBitRun = 0;
	
	for(var i = 0; i < message.length; i++) {
		var c = message.charAt(i);
		if(c == "0" || c == "1") {
			bitRun += 1;
		} else {
			if(bitRun > maxBitRun) {
				maxBitRun = bitRun;
			}
			bitRun = 0;
		}
	}
	if(maxBitRun >= MIN_BITS_TO_CONSIDER_FOR_DECODE || bitRun > MIN_BITS_TO_CONSIDER_FOR_DECODE) {
		return true;
	} else {
		return false;
	}
}

function messageChanged() {
	var message = $("#message-text").val();
	var outMessage = "";
	if(messageIsProbablyBinary(message)) {
		$("#content-label").html("Translation");
		outMessage = stringFromBinaryString(message);
	} else {
		$("#content-label").html("Binary");
		g_binaryString = stringToBinaryString(message);
		if(g_binaryString.length > 0) {
			outMessage = g_binaryString + "#binday";
		} else {
			outMessage = EMPTY_MESSAGE_PROMPT
		}
	}
	updateInLink();
	setOutputText(outMessage);
}

function updateInLink() {
	var message = $("#message-text").val();
	$("#in-link").attr("href", getMessageHREF(message));
}

function updateOutLink() {
	$("#out-link").attr("href", getMessageHREF(g_outMessage));
}

function setOutputText(message) {
	g_outMessage = message;
	$("#content-out").html(g_outMessage);
	updateCharactersLeft(g_outMessage.length);
	updateTweetButton();
	updateOutLink();
}

function updateTweetButton() {
	if(canTweet()) {
		$("#tweet-button").button("option", "disabled", false);
	} else {
		$("#tweet-button").button("option", "disabled", true);
	}
}

function canTweet() {
	var length = g_outMessage.length;
	var message = $("#message-text").val();
	
	if(length > 140 || length <= 0) {
		return false;
	}
	if(messageIsProbablyBinary(message)) {
		return false;
	}
	
	return true;
}

function updateCharactersLeft(length) {
	$("#characters-left").html(140 - length);
	// Adjust label colour
	$("#characters-left").removeClass("chars-ok chars-careful chars-you-were-only-supposed-to-blow-the-bloody-doors-off");
	if(length >= 130) {
		$("#characters-left").addClass("chars-you-were-only-supposed-to-blow-the-bloody-doors-off");
	} else if(length >= 120) {
		$("#characters-left").addClass("chars-careful");
	} else {
		$("#characters-left").addClass("chars-ok");
	}
}

function tweetIt() {
	if(canTweet()) {
		var url = "http://twitter.com/?status=" + encodeURI(g_binaryString) + "%23binday";
		window.location = url;
	}
}

function processUrlVars(vars) {
	if(vars !== null) {
		if(vars.message) {
			$("#message-text").val(vars.message);
			messageChanged();
		}
	}
}

function getMessageHREF(message) {
	return "?message=" + encodeURI(message);
}

$(document).ready(function() {
	$("#content-out").html(g_outMessage);
	
	$("#message-text").keypress(messageChanged);
	$("#message-text").keydown(messageChanged);
	$("#message-text").keyup(messageChanged);

	$("#tweet-button").button({disabled:true});
	$("#tweet-button").click(tweetIt);
	
	$("#message-text").focus();

	processUrlVars(getUrlVars());
});
