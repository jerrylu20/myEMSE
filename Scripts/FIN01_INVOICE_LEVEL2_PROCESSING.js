/*------------------------------------------------------------------------------------------------------/
| Program: FIN01_INVOICE_LEVEL2_PROCESSING.js  Client : Oakland   
|1. create Priority Lien Record 
|2. 
| To install Script:
| 1) Add script to Event > Script area of Accela Administrator
| 3) Search for Standard Choice CAPSET_SCRIPT_LIST and add it if it does not exists
| 4) Add new Standard Choice value to CAPSET_SCRIPT_LIST. Value = <Name of script> Description = <Displayed name on SET execute Button>
| Note: Script can be added multiple times with different script names

| 5/20/14 - DQ - Added Recal and Update for associated invoices, added invoid stamping for due dates/batch date
| 5/23/14 - DQ - Added check to make sure there was an invoice going to level 2 before adding fees
| 7/30/14 - DQ - Added check to make sure assessed fees before process starts were ignored 
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
	loadAppSpecific(AInfo);
	aa.print("SetMemberArray[" + i + "] is CAP ID:" + altID);
	
	// MUST CHECK FOR LVL 1 to 2 INVOICES FIRST before adding fees
	invResult = aa.finance.getInvoiceByCapID(capId,null);
	if (invResult.getSuccess())
		invList = invResult.getOutput();
	
	var printInvoice = false;
	var existingInvoicesArray = new Array();
	
	for (thisInv in invList)  // for each Invoice
	{		
		var thisInvoice = invList[thisInv];
		invoiceLvl = thisInvoice.getInvLevel();
		invoiceNbr = thisInvoice.getInvNbr();
		invoiceBalDue = thisInvoice.getInvoiceModel().getBalanceDue();
		
		//Add this to array so we can find the new invoice
		existingInvoicesArray.push(invoiceNbr);
		
		var datePlus30 = jsDateToMMDDYYYY(convertDate(dateAdd(null,30)))
		var today = jsDateToMMDDYYYY(new Date());
		
		var invoiceDate = new Date(thisInvoice.invDate.getMonth() + "/" + thisInvoice.invDate.getDayOfMonth() + "/" + thisInvoice.invDate.getYear());
		invoiceAge = daysBetween(invoiceDate,new Date());
		
		if (invoiceLvl == "1" && invoiceBalDue > 0 && invoiceAge >= 30){
			printInvoice = true;
		}
	}
	//IF No invoice needs to be printed then do not assess fees
	if(!printInvoice){
		continue;
	}
	
	// Invoice Assessed Fees prior to adding lvl2 items
	var noInvArr = new Array()
	getFeeResult = new Array();
	getFeeResult = aa.fee.getFeeItems(capId);
	if (getFeeResult.getSuccess()){
    	var feeList = getFeeResult.getOutput();
    	for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")){
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				noInvArr.push(feeSeq);
			}
	}
	
	//ADD THE NEW FEES FOR DOC_PREP AND REC+TECH
	addFee("PL_PREP_INV","PRIO_LIEN","FINAL",1,"N",capId);
	addFee("BLD_RECMGMT","PRIO_LIEN","FINAL",1,"N",capId);
	addFee("BLD_TECH","PRIO_LIEN","FINAL",1,"N",capId);
    
	//ADD THE RECALC FOR 2ND AND SUBSEQENT INVOICES
	var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	
	if (valobj.length) {
		estValue = valobj[0].getEstimatedValue();
		calcValue = valobj[0].getCalculatedValue();
		feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
	}
	var feeValue = estValue;
	if(feeFactor != "CONT"){ 
		feeValue = calcValue;
	}
	//perform the recalculation
	aa.finance.reCalculateFees(capId, feeFactor, feeValue);
	
	// Invoice Assessed Fees
	getFeeResult = new Array();
	getFeeResult = aa.fee.getFeeItems(capId);
	if (getFeeResult.getSuccess()){
    	var feeList = getFeeResult.getOutput();
    	for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")){
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				if(exists(feeSeq,noInvArr)){ //skip non-invoice fees
					continue;
				}
				var fperiod = feeList[feeNum].getPaymentPeriod();
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
			}
		invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
		if (invoiceResult.getSuccess())
			logMessage("Invoicing assessed fee items is successful.");
		else
			logMessage("**ERROR: Invoicing the fee items assessed to app # " + altID + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
	}

	// update invoice level
	// must refetch invoices to get new numbers
	invResult = aa.finance.getInvoiceByCapID(capId,null);
	if (invResult.getSuccess())
		invList = invResult.getOutput();
	
	for (thisInv in invList)  // for each Invoice
	{		
		var thisInvoice = invList[thisInv];
		
		invoiceLvl = thisInvoice.getInvLevel();
		invoiceNbr = thisInvoice.getInvNbr();
		invoiceBalDue = thisInvoice.getInvoiceModel().getBalanceDue();
		var datePlus30 = jsDateToMMDDYYYY(convertDate(dateAdd(null,30)))
		var today = jsDateToMMDDYYYY(new Date());
		
		var invoiceDate = new Date(thisInvoice.invDate.getMonth() + "/" + thisInvoice.invDate.getDayOfMonth() + "/" + thisInvoice.invDate.getYear());
		invoiceAge = daysBetween(invoiceDate,new Date());
		
		//check if this is the new invoice or not
		var forceNewInvoice = true;
		for(inv in existingInvoicesArray){
			if(existingInvoicesArray[inv]==invoiceNbr){
				forceNewInvoice = false;
				break;
			}
		}
		
		//CHECK FOR 30 DAYS OR OLDER OR IF THE NEW INVOICE
		if ( (invoiceLvl == "1" && invoiceBalDue > 0 && invoiceAge >= 30) || forceNewInvoice)  
		{
			//Update invoice and set common due date plus today as batch date
			updateInvoiceLevel(capId,thisInvoice,2,datePlus30,today,null);
			setRelatedInvoicesLevel(capId,invoiceNbr,"2",datePlus30,today,null); //update related credit invoices
			logDebug("Invoice # " + invoiceNbr);
		}
		//IF INVOICE LVL 2 AND BALANCES < 0 WITH NO BATCH DATE ADD BATCH DATE OF TODAY TO KEEP SYNC
		else if(invoiceLvl == "2" && invoiceBalDue < 0 && thisInvoice.getInvoiceModel().getInvBatchDate() == null ){
			setRelatedInvoicesLevel(capId,invoiceNbr,"2",null,today,null);       //add today as batch date
			logDebug("Credit Invoice # " + invoiceNbr);
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


function daysBetween(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)
    
    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}