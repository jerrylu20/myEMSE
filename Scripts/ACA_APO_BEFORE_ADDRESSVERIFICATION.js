/*------------------------------------------------------------------------------------------------------/
| Program : ACA_APO_Before_AddressVerification.js
| Event   : ACA_APO_Before_AddressVerification
| Modified file at 1:55PM PST
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : Oakland
| Action# : N/A
|
| Notes   :  Verifies that the address is related to the public user
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
//var preExecute = "PreExecuteForBeforeEvents"
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
//add new param
var useTaskSpecificGroupName1 = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var maxEntries = 99;							// Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

//eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));

eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

var currentUserID = aa.env.getValue("CurrentUserID");

//if (preExecute.length) doStandardChoiceActions(preExecute,true,0); 	// run Pre-execution code

var cap = aa.env.getValue("CapModel");
var parentId = cap.getParentCapID();

var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode() 

// page flow custom code begin

/* sample code
try {
	var c = getContactObj(parentId, "Applicant");
	if (!c)
		c = getContactObj(parentId, "License Holder");

	if (c) {
		c.people.setContactSeqNumber(null); // reset in order to avoid capContactNotFoundException on submittal
		cap.setApplicantModel(c.capContact);
		aa.env.setValue("CapModel", cap);
	}
} catch (err) {
	handleError(err, "Page Flow Script");
}

*/

try{
	var addressModel = cap.getAddressModel();
	var addressValidated = false;
   // logDebug("addressModel= " + addressModel);
    //logDebug("addressModel.getDisplayAddress() = " + addressModel.getDisplayAddress());
    //logDebug("addressModel.addressLine1 = " + addressModel.addressLine1);
    //logDebug("addressModel.getHouseNumberStart() = " + addressModel.getHouseNumberStart());
    //logDebug("addressModel.getStreetName() = " + addressModel.getStreetName());
    //logDebug("addressModel.getCity() = " + addressModel.getCity());
    //logDebug("addressModel.getState() = " + addressModel.getState());
    //logDebug("addressModel.getZip() = " + addressModel.getZip());
	//email("lwacht@accela.com", "noreply@accela.com", "success: " + capId, "blah blah"); 
	//logDebug("capId: " + capId);
	var publicUserModelResult = aa.publicUser.getPublicUserByPUser(currentUserID);
	var pUserSeqNumber = publicUserModelResult.getOutput().getUserSeqNum();
	var associatedLPResult = aa.licenseScript.getRefLicProfByOnlineUser(pUserSeqNumber);
	if (!associatedLPResult.getSuccess() || !associatedLPResult.getOutput() || associatedLPResult.getOutput().length<1) {
		var contAddr = aa.proxyInvoker.newInstance("com.accela.pa.people.address.ContractorAddressBusiness").getOutput();
		var refConArrayList = contAddr.getContractorAddressListByUserSeqNBR(aa.getServiceProviderCode(), pUserSeqNumber);
		var addrMatches = false;
		if (refConArrayList) {
			var refConList = refConArrayList.toArray();
			for (var x in refConList) {
				refConSt = refConList[x];
				refAddMdl = refConSt.getRefAddressModel();
				//logDebug("houseNumberStart : " + refAddMdl["houseNumberStart"]);
				//logDebug("streetName  : " + refAddMdl["streetName"]);
				//logDebug("city  : " + refAddMdl["city"]);
				//logDebug("state  : " + refAddMdl["state"]);
				//logDebug("zip  : " + refAddMdl["zip"]);
				if (addressModel.getHouseNumberStart()==refAddMdl["houseNumberStart"] &&
					addressModel.getStreetName()==refAddMdl["streetName"] &&
					addressModel.getCity()== refAddMdl["city"] &&
					addressModel.getState()==refAddMdl["state"] &&
					addressModel.getZip()== refAddMdl["zip"]) {
						addrMatches = true;
						logDebug("Found a match");
				}
			}
		}
		if(!addrMatches){
			cancel=true;
			showMessage=true;
			showDebug=true;
			comment("For Licensed Professionals: You must have an approved license associated to your account before you can proceed.");
			comment("For Homeowners: Your address must be associated to your account before you can request a permit.");
			comment("Please contact the city for more information and to update your account information.");

		} 
	}
}
catch (err) {
	aa.print(err, "Yikes");
}

// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}
