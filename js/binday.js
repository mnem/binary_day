var g_binaryString = "";
var MAX_BITS_FOR_CHAR_CODE = 16;
var MSB_CHAR_CODE = 1 << (MAX_BITS_FOR_CHAR_CODE - 1);
var MIN_BITS_TO_CONSIDER_FOR_DECODE = 4;
var BIN_DELIM = " ";

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
	message = $("#message-text").val();
	if(messageIsProbablyBinary(message)) {
		$("#binary-label").html("Translation");
		$("#binary-text").val(stringFromBinaryString(message));
	} else {
		$("#binary-label").html("Binary");
		g_binaryString = stringToBinaryString(message);
		if(g_binaryString.length > 0) {
			$("#binary-text").val(g_binaryString + "#binday");
		} else {
			$("#binary-text").val(g_binaryString);
		}
	}
	$("#in-link").attr("href", getMessageHREF(message));
	$("#binary-text").change();
}

function canTweet() {
	var length = $("#binary-text").val().length;
	var message = $("#message-text").val();
	
	if(length > 140 || length <= 0) {
		return false;
	}
	if(messageIsProbablyBinary(message)) {
		return false;
	}
	
	return true;
}

function binaryChanged() {
	var length = $("#binary-text").val().length;
	
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
	
	if(canTweet()) {
		$("#tweet-button").button("option", "disabled", false);
	} else {
		$("#tweet-button").button("option", "disabled", true);
	}
	
	$("#out-link").attr("href", getMessageHREF($("#binary-text").val()));
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
	$("#message-text").keypress(messageChanged);
	$("#message-text").keydown(messageChanged);
	$("#message-text").keyup(messageChanged);

	$("#binary-text").change(binaryChanged);

	$("#tweet-button").button({disabled:true});
	$("#tweet-button").click(tweetIt);
	
	$("#message-text").focus();

	processUrlVars(getUrlVars());
});
