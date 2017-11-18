/*------------------------------------------------------------------------------------------------------/
| Program : ACA_Contact_Before_ApplicLPVerification.js
| Event   : ACA_Contact_Before_ApplicLPVerification
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : Oakland
| Action# : N/A
|
| Notes   :  Verifies that an LP is required when the user is an LP 
|				 or applicant otherwise
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

comment("capId: " + capId.getCustomID());

// page flow custom code begin

try{
	var publicUserModelResult = aa.publicUser.getPublicUserByPUser(currentUserID);
	var pUserSeqNumber = publicUserModelResult.getOutput().getUserSeqNum();
	var associatedLPResult = aa.licenseScript.getRefLicProfByOnlineUser(pUserSeqNumber);
	var applicExists = false;
	var lpExists = false;
	var arrContacts = new Array(); 
/*	arrContacts = getContactArray1();  
	for (i in arrContacts) {
		comment("contType: " + arrContacts[i]["contactType"])
		if (arrContacts[i]["contactType"]=="Applicant" ) {
			applicExists=true; 
		}
	}*/
	comment("cap.getContactsGroup().size(): " + cap.getContactsGroup().size())
	if (cap.getContactsGroup().size() > 0) {
		var capContactAddArray = cap.getContactsGroup().toArray();
		for (ccaa in capContactAddArray){
			if (capContactAddArray[ccaa].getPeople().getContactType()=="Applicant"){
				comment(capContactAddArray[ccaa].getPeople());
				applicExists=true;
			}
		}
	}

	var lpList = cap.getLicenseProfessionalList(); 
	comment( " cap.getLicenseProfessionalList(): " + cap.getLicenseProfessionalList())
	if(lpList != null && lpList.size() > 0)	{
//		comment("capLicenseArr: "+capLicenseArr);
		lpExists = true;
	} 
	
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
			comment("Address must be related to you before you can request a permit.")
		} 
	}

	if (associatedLPResult.getSuccess() || associatedLPResult.getOutput() || associatedLPResult.getOutput().length>0) {
		comment("We are an LP");
		if(!lpExists && !addrMatches){
			cancel=true;
			showMessage=true;
			showDebug=true;
			comment("A licensed professional is required for this permit.")
		} 
	} else {
		if(!applicExists){
			cancel=true;
			showMessage=true;
			showDebug=true;
			comment("An applicant is required for this permit.")
		}
	}
}
catch (err) {
aa.print(err, "Yikes");
}

/*-----------------------------------------------------------------------------------------------------------*/
function getContactArray1() {
// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
// optional capid
// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
// on ASA it should still be pulled normal way even though still partial cap
var thisCap = capId;
if (arguments.length == 1)
thisCap = arguments[0];
var cArray = new Array();
capContactArray = cap.getContactsGroup().toArray();

if (capContactArray) {
for (yy in capContactArray) {
	var aArray = new Array();
	aArray["lastName"] = capContactArray[yy].getPeople().lastName;
	aArray["firstName"] = capContactArray[yy].getPeople().firstName;
	aArray["middleName"] = capContactArray[yy].getPeople().middleName;
	aArray["businessName"] = capContactArray[yy].getPeople().businessName;
	aArray["contactSeqNumber"] = capContactArray[yy].getPeople().contactSeqNumber;
	aArray["contactType"] = capContactArray[yy].getPeople().contactType;
	aArray["relation"] = capContactArray[yy].getPeople().relation;
	aArray["phone1"] = capContactArray[yy].getPeople().phone1;
	aArray["phone2"] = capContactArray[yy].getPeople().phone2;
	aArray["email"] = capContactArray[yy].getPeople().email;
	aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
	aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
	aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
	aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
	aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
	aArray["fax"] = capContactArray[yy].getPeople().fax;
	aArray["notes"] = capContactArray[yy].getPeople().notes;
	aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
	aArray["fullName"] = capContactArray[yy].getPeople().fullName;
	aArray["peopleModel"] = capContactArray[yy].getPeople();
	var pa = new Array();
	if (arguments.length == 0 && !cap.isCompleteCap()) {
		var paR = capContactArray[yy].getPeople().getAttributes();
		if (paR)
			pa = paR.toArray();
	} else
		var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
	for (xx1 in pa)
		aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;
	cArray.push(aArray); 
}
}
return cArray;
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