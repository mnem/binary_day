var MAX_BITS_FOR_CHAR_CODE = 16;
var MSB_CHAR_CODE = 1 << (MAX_BITS_FOR_CHAR_CODE - 1);
var MIN_BITS_TO_CONSIDER_FOR_DECODE = 4;
var BIN_DELIM = " ";
var ADVERT=" goo.gl/PF8V";

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
			binary += BIN_DELIM;
		}
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

function showHelp() {
	$("#content-label").html("What To Do");
	$("#content-out").html("Enter some text above to convert to or from binary!");
	disableTweeting();
}

function showTranslation(translation) {
	$("#content-label").html("Translation");
	$("#content-out").html(translation);
	disableTweeting();
}

function showBinary(binaryString) {
	$("#content-label").html("Binary");
	if(binaryString.length > 0) {
		$("#content-out").html(binaryString + ADVERT);
		enableTweeting();
	} else {
		showHelp();
		disableTweeting();
	}
}

function getInputString() {
	return $("#message-text").val();
}

function getOutputString() {
	return $("#content-out").html();
}

function messageChanged() {
	var message = getInputString();
	if(messageIsProbablyBinary(message)) {
		showTranslation(stringFromBinaryString(message));
	} else {
		showBinary(stringToBinaryString(message));
	}
	$("#in-link").attr("href", getMessageHREF(getInputString()));
	$("#out-link").attr("href", getMessageHREF(getOutputString()));
	updateCharactersLeft();
}

function disableTweeting() {
	$("#tweet-button").button("option", "disabled", true);
}

function enableTweeting() {
	$("#tweet-button").button("option", "disabled", false);
}

function updateCharactersLeft() {
	var length = getOutputString().length;
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
	var url = "http://twitter.com/?status=" + encodeURI(getOutputString());
	window.location = url;
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
	$("#tweet-button").button({disabled:true});
	$("#tweet-button").click(tweetIt);
	$("#message-text").focus();
	showHelp();
	processUrlVars(getUrlVars());
});
