/*------------------------------------------------------------------------------------------------------/
| Accela Automation
| Accela, Inc.
| Copyright (C): 2012
|
| Script Name: runReportEmailAsync
|
| Test Parameters - Modify as needed
/------------------------------------------------------------------------------------------------------*/
/*
vEParams = aa.util.newHashtable(); 
vEParams.put("$$altid$$","Testing");  //<--------------------Define
vEParams.put("$$FacilityName$$","Testing"); //<--------------------Define

vRParams = aa.util.newHashtable();
vRParams.put("ID",inspId); //<--------------------Define

var vAsyncScript = "runReportEmailAsync"; 
var envParameters = aa.util.newHashMap();
envParameters.put("vCapId",capId);
envParameters.put("vEventName",vEventName); //<--------------------Define
envParameters.put("vCurrentUserID",currentUserID);
envParameters.put("vParentCapId",parentCapId);
envParameters.put("vEParams",vEParams);
envParameters.put("vRParams",vRParams);

envParameters.put("vEmailTemplate","SomeEmailTemplate"); //<--------------------Define
envParameters.put("vContactTypes","Applicant"); //<--------------------Define
envParameters.put("vReportName","Somereport"); //<--------------------Define
envParameters.put("vReportModule","SomeModule"); //<--------------------Define

aa.runAsyncScript(vAsyncScript, envParameters);
*/
/*------------------------------------------------------------------------------------------------------/
| Set Required Environment Variables Value
/------------------------------------------------------------------------------------------------------*/
var vEventName = aa.env.getValue("vEventName");
var vCurrentUserID = aa.env.getValue("vCurrentUserID");
var vCapId = aa.env.getValue("vCapId");
var vParentCapId = aa.env.getValue("vParentCapId");

aa.env.setValue("ScriptCode","runReportEmailAsync");
aa.env.setValue("EventName",vEventName);
aa.env.setValue("CurrentUserID",vCurrentUserID); 
aa.env.setValue("CapId",vCapId);
aa.env.setValue("ParentCapID",vParentCapId);
/*------------------------------------------------------------------------------------------------------/
| Log Globals and Add Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 2.0;
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));

eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));

eval(getScriptText("INCLUDES_CUSTOM"));
/*------------------------------------------------------------------------------------------------------/
| Execute Script Controls
/------------------------------------------------------------------------------------------------------*/
var vEParams = aa.env.getValue("vEParams");
var vEmailTemplate = aa.env.getValue("vEmailTemplate");
var vContactTypes = aa.env.getValue("vContactTypes");

var vRParams = aa.env.getValue("vRParams");
var vReportName = aa.env.getValue("vReportName");
var vReportModule = aa.env.getValue("vReportModule");
var vReportFile;

vReportFile = generateReport_Oakland(capId, vReportName, vReportModule, vRParams, 'Y');

if (vReportFile != null) {
	emailContacts_Oakland(vContactTypes, null, vEmailTemplate, vEParams, vReportFile);
} else {
	emailContacts_Oakland(vContactTypes, null, vEmailTemplate, vEParams, null);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
}
else {
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage) {
		aa.env.setValue("ScriptReturnMessage", message);
	}
	if (showDebug) {
		aa.env.setValue("ScriptReturnMessage", debug);
	}
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
	return emseScript.getScriptText() + "";	
}