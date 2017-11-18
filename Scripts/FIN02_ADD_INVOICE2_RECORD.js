/*------------------------------------------------------------------------------------------------------/
| Program: FIN02_Add_Invoice2_Record.js  Client : Oakland   
|
| To install Script:
| 1) Add script to Event > Script area of Accela Administrator
| 3) Search for Standard Choice CAPSET_SCRIPT_LIST and add it if it does not exists
| 4) Add new Standard Choice value to CAPSET_SCRIPT_LIST. Value = <Name of script> Description = <Displayed name on SET execute Button>
| Note: Script can be added multiple times with different script names

| 5/22/14 - DQ - Generates the Oakland Invoices for each Record
| 6/16/14 - DQ - Corrected message to show when invoice was/wasn't generated
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
var currentUserID ="ADMIN";   		// Current User
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
	
	var today = jsDateToMMDDYYYY(new Date());
	var printInvoice = false;
	
	
	invResult = aa.finance.getInvoiceByCapID(capId,null);
	if (invResult.getSuccess())
		invList = invResult.getOutput();
	for (thisInv in invList)  // for each Invoice
	{		
		var thisInvoice = invList[thisInv];
		invoicePrintDt = thisInvoice.getInvoiceModel().getInvBatchDate();
		if(invoicePrintDt == null)
			continue;
		invoiceScriptDt = jsDateToMMDDYYYY(convertDate(aa.date.parseDate(invoicePrintDt)));
		if(invoiceScriptDt == today){			
			printInvoice = true;
			break;
		}
	}
	//print the invoice if needed
	if(printInvoice){
		//82OaklandInvoice Record
		var hm = aa.util.newHashMap();
		hm.put("invoiceDate",jsDateToMMDDYYYY(new Date()));
		hm.put("RecordID",altID+"");
		generateReport(capId,"82OaklandInvoice Record","Building",hm);
		logDebug("Invoice Added to: " + altID);
	}
	else{
		logDebug("No Level 2 Invoices for Todays Date found for : " + altID);
	}
	
}
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

if (emailAddress.length ) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);	

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
	

function generateReport(itemCap,reportName,module,parameters) {

  //returns the report file which can be attached to an email.
  var user = currentUserID;   // Setting the User Name
  var report = aa.reportManager.getReportInfoModelByName(reportName);
  report = report.getOutput();
  report.setModule(module);
  report.setCapId(itemCap.getID1() + "-" + itemCap.getID2()+ "-" + itemCap.getID3());
  report.setReportParameters(parameters);
  report.getEDMSEntityIdModel().setAltId(itemCap.getCustomID());
 
  var permit = aa.reportManager.hasPermission(reportName,user);

  if (permit.getOutput().booleanValue()) {
    var reportResult = aa.reportManager.getReportResult(report);
    if(reportResult) {
      reportOutput = reportResult.getOutput();
      var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
      reportFile=reportFile.getOutput();
      return reportFile;
    }  else {
      logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
      return false;
    }
  } else {
    logDebug("You have no permission.");
    return false;
  }
}
