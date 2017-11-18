/*------------------------------------------------------------------------------------------------------/
| Program: FIN_RunLienInvoiceReport.js  Client : Oakland   
|1. Runs the OaklandInvoice report
|2. 
| To install Script:
| 1) Add script to Event > Script area of Accela Administrator
| 3) Search for Standard Choice CAPSET_SCRIPT_LIST and add it if it does not exists
| 4) Add new Standard Choice value to CAPSET_SCRIPT_LIST. Value = <Name of script> Description = <Displayed name on SET execute Button>
| Note: Script can be added multiple times with different script names
-------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM"));


function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = true;						// Set to true to see results in popup window
var showDebug = true;							// Set to true to see debug messages in popup window
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var sysDate = aa.date.getCurrentDate();
var message =	"";									// Message String
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("BatchJobName");
var debug = "";								// Debug String
var br = "<BR>";							// Break Tag
//var capId = getCapId();						// CapId object
var emailAddress = ("DRex@oaklandnet.com");	// email to send report
var emailText = "";
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var currentUserID ="Admin";   		// Current User
var AInfo = new Array();
var feeSeqList = new Array();
var paymentPeriodList = new Array();

/*----------------------------------------------------------------------------------------------------/
|
| END USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var debug = "";
var SetMemberArray= aa.env.getValue("SetMemberArray");
var setCode = aa.env.getValue("SetID");
logDebug("The Process Has Begun for batch " + setCode + ".");

for (var i = 0; i < SetMemberArray.length; i++)
{
	var id= SetMemberArray[i];
	var capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();
	var altID = capId.getCustomID();					// alternate cap id string
    	var todayJS = new Date();
	loadAppSpecific(AInfo);
	aa.print("SetMemberArray[" + i + "] is CAP ID:" + altID);
	
	// Run Report
	runReportAttach("82OaklandInvoice Record","RecordID",altID);
	runReportAttach("72 Prioirty Lien","Record_Id",altID);
	
}
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

if (emailAddress.length ) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);	

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/