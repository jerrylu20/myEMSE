/*------------------------------------------------------------------------------------------------------/
| Program: FIN_PayRecordInvoices.js  Client : Oakland   
|1. Pays the Invoices in the ASIT Invoices in the lien record.
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
	var INVOICES = loadASITable("INVOICES");
	aa.print("SetMemberArray[" + i + "] is CAP ID:" + altID);
	
	// Pay Invoices for each record in ASIT
	for(x in INVOICES){  
		if (payInvoiceByMethod(INVOICES[x]["Invoice Number"],"Transfer to County")){
			logDebug(Invoice + " : Payment Successful");
		}
		else{
			logDebug(Invoice + " : Payment Failed");
		}
	}
//}
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

if (emailAddress.length ) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);	

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========BATCH SPECIFIC FUNCTIONS================>
/-----------------------------------------------------------------------------------------------------*/
	
function payInvoiceByMethod(invoiceNbr,methodType) //optional: itemCap
  {
	//Find the fees payable on the invoice provided	
  	//invoiceNbr=300
	var invArr = aa.invoice.getFeeItemInvoiceByInvoiceNbr(invoiceNbr).getOutput()
	var payAlocArr = new Array();
	var amtToPay = 0;
	var payCap = null;
	for (feeItem in invArr)
    {	
	    //GET THE FEEITEM    	
    	payCap = invArr[feeItem].getCapID() //get cap to pay
		feeAmtDue = invArr[feeItem].getFee();
		feeSeqNbr = invArr[feeItem].getFeeSeqNbr(); 
		
		if(feeAmtDue <= 0) continue;
	  
		//FIND OUTSTANDING BALANCE
		feePaidAmt = aa.finance.getTotalPaidFeeItem(payCap, feeSeqNbr).getOutput();
		feeAmtDue = feeAmtDue - feePaidAmt;
		//logDebug("Amount of fee due: " + feeAmtDue);
		
		//ADD TO TOTAL TO PAY
		amtToPay += feeAmtDue;
		amtToPay = Math.round(amtToPay * Math.pow(10,2)) / Math.pow(10,2)
		//logDebug("Total Amount Due: " + amtToPay);
		
		//ADD TO PAYMENT ALLOCATION ARRAY
		var tmpPayObj = new feePayObj(feeSeqNbr, feeAmtDue, invoiceNbr);
		payAlocArr.push(tmpPayObj);
	}
	
	if(amtToPay > 0){
	
		//SETUP THE PAYMENT OBJECT
		p = aa.finance.createPaymentScriptModel();
		p.setAuditDate(aa.date.getCurrentDate());
		p.setAuditStatus("A");
		p.setCapID(payCap);							//CAP TO PAY
		p.setCashierID(p.getAuditID());
		p.setPaymentSeqNbr(p.getPaymentSeqNbr());
		p.setPaymentAmount(amtToPay);				//AMOUNT TO PAY
		p.setAmountNotAllocated(amtToPay);			//ALSO AMOUNT TO PAY SINCE NOT ALLOCATED YET
		p.setPaymentChange(0);
		p.setPaymentComment("Payment Made Via Script");
		p.setPaymentDate(aa.date.getCurrentDate());
		p.setPaymentMethod(methodType);
		p.setPaymentStatus("Paid");
	 
		//MAKE THE PAYMENT
		presult = aa.finance.makePayment(p);
		var pSeq = null;
		var pR = null;
		
		if (presult.getSuccess()) 
		{
			//get additional payment information
			pSeq = presult.getOutput(); //set payment sequence number
			logDebug("Payment successful");
			pReturn = aa.finance.getPaymentByPK(payCap,pSeq,currentUserID);
			if (pReturn.getSuccess()) 
				{
					pR = pReturn.getOutput();
					logDebug("PaymentSeq: " + pR.getPaymentSeqNbr());
				}
			else
				{
					logDebug("Error retrieving payment, must apply payment manually: " + pReturn.getErrorMessage());
					return false;
				}
		}
		else 
		{
			logDebug("error making payment: " + presult.getErrorMessage());
			return false;
		}
		
		//apply payment
		//need to figure out how to get payment script model of resulting payment, and paymentFeeStatus and paymentIvnStatus
		
		if(amtToPay > 0 && pSeq != null){
			
			var feeSeqNbrArray = new Array();
			var invNbrArray = new Array();		
			var feeAllocArray = new Array();	
			for(rec in payAlocArr){
				feeSeqNbrArray.push(payAlocArr[rec].feeSeq)
				invNbrArray.push(payAlocArr[rec].inv);
				feeAllocArray.push(payAlocArr[rec].feeDue);
			}
		
			applyResult = aa.finance.applyPayment(payCap,pR.getPaymentSeqNbr(),0,feeSeqNbrArray,invNbrArray,feeAllocArray,aa.date.getCurrentDate(),"Paid","Paid",pR.getCashierID(),null);
			if(applyResult.getSuccess())
				logDebug("Applied $" + amtToPay + " to fee:" + payAlocArr[rec].feeSeq );
			else
				logDebug("Error applying fee: " + applyResult.getErrorMessage())
		}
	
		//generate receipt
		receiptResult = aa.finance.generateReceipt(payCap,aa.date.getCurrentDate(),pR.getPaymentSeqNbr(),pR.getCashierID(),null);
	
		if (receiptResult.getSuccess())
		{
			receipt = receiptResult.getOutput();
			logDebug("Receipt successfully created");// + receipt.getReceiptNbr());
		}
		else 
		{
			logDebug("error generating receipt: " + receiptResult.getErrorMessage());
			return false;
		}
	}
	//everything committed successfully
	return true;
  }
  
  function feePayObj(feeSeqNbr, feeAmtDue, invNumber){
  	this.feeSeq = feeSeqNbr;
  	this.feeDue = feeAmtDue;
  	this.inv = invNumber;
  	
  	return this;
  }