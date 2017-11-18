/*------------------------------------------------------------------------------------------------------/
| Program : V360ParcelAddAfterV2.0.js
| Event   : V360ParcelAddAfter
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/

var controlString = "ParcelAddAfter";	 				// Standard choice for control
var preExecute = "PreExecuteForAfterEvents"				// Standard choice to execute first (for globals, etc)
var documentOnly = false;						// Document Only -- displays hierarchy of std choice steps


/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
	}
	
function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";	
}

/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables -- moved up here since we have to get the capid from the parcel model
/------------------------------------------------------------------------------------------------------*/

var parcelModelArray = aa.env.getValue("ParcelModelArray");
logDebug("parcelModelArray = " + parcelModelArray.getClass());

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
var parcelModel = null;
for(var thisParcelNum in parcelModelArray) //Loop for each parcel in the array
{
    parcelModel = parcelModelArray[thisParcelNum];
    logDebug("parcelModel = " + parcelModel.getClass());
    //capId= parcelModel.getCapID();

    var capId = getCapId();							// CapId object
    var cap = aa.cap.getCap(capId).getOutput();				// Cap object
    var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
    var currentUserID = aa.env.getValue("CurrentUserID");   		// Current User
    var capIDString = capId.getCustomID();					// alternate cap id string
    var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
    var appTypeResult = cap.getCapType();
    var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
    var appTypeArray = appTypeString.split("/");				// Array of application type string
    var currentUserGroup = null;
    if(appTypeArray[0].substr(0,1) !="_") //Model Home Check
    {
	    var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
	    if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
    }

    var capName = cap.getSpecialText();
    var capStatus = cap.getCapStatus();
    var fileDateObj = cap.getFileDate();					// File Date scriptdatetime
    var fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
    var fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"");
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"YYYY-MM-DD");
    var parcelArea = 0;

    var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
    var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation
    if (valobj.length) {
	    estValue = valobj[0].getEstimatedValue();
	    calcValue = valobj[0].getCalculatedValue();
	    feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
	    }

    var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
    var capDetail = "";
    var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
    if (capDetailObjResult.getSuccess())
	    {
	    capDetail = capDetailObjResult.getOutput();
	    var houseCount = capDetail.getHouseCount();
	    var feesInvoicedTotal = capDetail.getTotalFee();
	    var balanceDue = capDetail.getBalance();
	    }
    else
	    {
	    logDebug("**ERROR getting cap detail : " + capDetailObjResult.getErrorMessage());
	    }

    var AInfo = new Array();						// Create array for tokenized variables
    loadAppSpecific(AInfo); 						// Add AppSpecific Info
    loadTaskSpecific(AInfo);						// Add task specific info
    loadParcelAttributes(AInfo);						// Add parcel attributes
    loadASITables();

    logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
    logDebug("capId = " + capId.getClass());
    logDebug("cap = " + cap.getClass());
    logDebug("currentUserID = " + currentUserID);
    logDebug("currentUserGroup = " + currentUserGroup);
    logDebug("systemUserObj = " + systemUserObj.getClass());
    logDebug("appTypeString = " + appTypeString);
    logDebug("capName = " + capName);
    logDebug("capStatus = " + capStatus);
    logDebug("fileDate = " + fileDate);
    logDebug("fileDateYYYYMMDD = " + fileDateYYYYMMDD);
    logDebug("sysDate = " + sysDate.getClass());
    logDebug("parcelArea = " + parcelArea);
    logDebug("estValue = " + estValue);
    logDebug("calcValue = " + calcValue);
    logDebug("feeFactor = " + feeFactor);
    logDebug("houseCount = " + houseCount);
    logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
    logDebug("balanceDue = " + balanceDue);


    if (preExecute.length) doStandardChoiceActions(preExecute,true,0); 	// run Pre-execution code

    logGlobals(AInfo);

    /*------------------------------------------------------------------------------------------------------/
    | <===========Main=Loop================>
    |
    /-----------------------------------------------------------------------------------------------------*/
    doStandardChoiceActions(controlString,true,0);

    //
    // Check for invoicing of fees
    //
    if (feeSeqList.length)
	    {
	    invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
	    if (invoiceResult.getSuccess())
		    logMessage("Invoicing assessed fee items is successful.");
	    else
		    logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
	    }
} //End Loop for each parcel
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
	}
else
	{
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
	if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
	}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/