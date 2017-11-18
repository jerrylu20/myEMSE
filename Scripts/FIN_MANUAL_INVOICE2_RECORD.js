/*------------------------------------------------------------------------------------------------------/
| Program: FIN_Manual_Invoice2_Record.js  Client : Oakland   
|1. create Priority Lien Record 
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
	
	// Add to Fee
		
	addFee("PL_PREP_INV","PRIO_LIEN","FINAL",1,"N",capId);
	addFee("BLD_RECMGMT","PRIO_LIEN","FINAL",1,"N",capId);
	addFee("BLD_TECH","PRIO_LIEN","FINAL",1,"N",capId);

	// Invoice Assessed Fees
		getFeeResult = new Array();
		getFeeResult = aa.fee.getFeeItems(capId);
    		if (getFeeResult.getSuccess())
        	{
        	var feeList = getFeeResult.getOutput();
        	for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW"))
				{
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				var fperiod = feeList[feeNum].getPaymentPeriod();
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
				}
		invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
 		if (invoiceResult.getSuccess())
  		logMessage("Invoicing assessed fee items is successful.");
 		else
  		logMessage("**ERROR: Invoicing the fee items assessed to app # " + altId + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
 		
		}

	// update invoice level
	invResult = aa.finance.getInvoiceByCapID(capId,null);
	if (invResult.getSuccess())
		invList = invResult.getOutput();
	for (thisInv in invList)  // for each Invoice
		{		
		var thisInvoice = invList[thisInv];
		
		invoiceLvl = thisInvoice.getInvLevel();
		invoiceNbr = thisInvoice.getInvNbr();
		invoiceBalDue = thisInvoice.getInvoiceModel().getBalanceDue();
		if (invoiceLvl == "1" && invoiceBalDue > 0)
			{
			updateInvoiceLevel(capId,thisInvoice,2);
			logDebug("Invoice # " + invoiceNbr);
			}
		}	

}
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

if (emailAddress.length ) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);	

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/