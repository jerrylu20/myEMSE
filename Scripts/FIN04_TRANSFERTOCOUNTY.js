/*------------------------------------------------------------------------------------------------------/
| Program: FIN04_TransfertoCounty.js  Client : Oakland   
|1. create Priority Lien Record 
|2. 
| To install Script:
| 1) Add script to Event > Script area of Accela Administrator
| 3) Search for Standard Choice CAPSET_SCRIPT_LIST and add it if it does not exists
| 4) Add new Standard Choice value to CAPSET_SCRIPT_LIST. Value = <Name of script> Description = <Displayed name on SET execute Button>
| Note: Script can be added multiple times with different script names
|
| 5/20/14 - DQ - Fixed rounding on ASI fields populated, updated invoice to populate udf1 with lien id
| 6/16/14 - DQ - Fixed missing check for Transfer, fixed rounding issue, fixed duplication of i as loop cursor causing abend 
| 6/17/14 - DQ - Implemented new checks on Transfer Date must be null/blank and balance > 0
| 8/14/14 - DQ - Implemented new logic to handle negative fees on unpaid invoice
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

var lienSetName = "TRANSFERRED LIENS " + startDate.getFullYear();
var mySet = new capSet(lienSetName,lienSetName);
mySet.status = "Not Processed";
mySet.update();

for (var i = 0; i < SetMemberArray.length; i++)
{
	var id= SetMemberArray[i];
	var capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();
	var altID = capId.getCustomID();					// alternate cap id string
    var todayJS = new Date();
    
	loadAppSpecific(AInfo);
	logDebug("SetMemberArray[" + i + "] is CAP ID:" + altID);
	
	//6.16.14 DQ fix
	if(AInfo["Transfer"]!="Yes"){
		logDebug("Skipping: Not set to Transfer");
		continue;
	}
	if(AInfo["Transfer Date"] != null && AInfo["Transfer Date"] != ""){
		logDebug("Skipping: Already Transferred");
		continue;
	}
	var capDetailObjResult = aa.cap.getCapDetail(capId);		
	if (capDetailObjResult.getSuccess())
	{		
		var capDetail = capDetailObjResult.getOutput();
		var balanceDue = capDetail.getBalance();
		if (balanceDue <= 0){
			logDebug("Skipping: Balance Due = 0");
			continue;
		}
	}
	
	// Set Transfer Date 
	var todayASI = jsDateToASIDate(todayJS);
	editAppSpecific("Transfer Date",todayASI);
	
	//calculate Interest and Assess Surcharges
	var recordationDate = getAppSpecific("Recordation Date");
	var recordationDateJS = new Date(recordationDate);
	var lienIntDays = Math.round(dateDiff(recordationDateJS,todayJS));
	//logDebug( altID + ": Lien Interest Days = " + lienIntDays);
	var principalAmt = getAppSpecific("Principal");
	var lienIntAmt = toFixedFloat((parseFloat(principalAmt * .10)/365) * parseInt(lienIntDays));
	//logDebug( altID + ": Lien Interest Amount = " + lienIntAmt);
	editAppSpecific("Interest",lienIntAmt);
	addFee("PL_INT","PRIO_LIEN","FINAL",lienIntAmt,"N",capId);
	addFee("PL_SCCNTY","PRIO_LIEN","FINAL",1,"N",capId);
	addFee("PL_SCCITY","PRIO_LIEN","FINAL",1,"N",capId);
	logDebug( altID + ": Lien Interest and Surcharges assessed successfully.");
	var surchargeAmt = toFixedFloat(feeAmount("PL_SCCNTY")) + toFixedFloat(feeAmount("PL_SCCITY"));
	
	//Update ASI Information
	editAppSpecific("Surcharge",toFixedFloat(surchargeAmt));
	editAppSpecific("Total Lien",toFixedFloat(toFixedFloat(principalAmt) + toFixedFloat(lienIntAmt) + toFixedFloat(surchargeAmt)));

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
		//if (invoiceResult.getSuccess())
			//logMessage("Invoicing assessed fee items is successful.");
			//else
			//logMessage("**ERROR: Invoicing the fee items assessed to app # " + altId + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
		
	}

	// update invoice level on interest and surcharge
	invResult = aa.finance.getInvoiceByCapID(capId,null);
	if (invResult.getSuccess())
		invList = invResult.getOutput();
	for (thisInv in invList)  // for each Invoice
	{		
		var thisInvoice = invList[thisInv];
		
		invoiceLvl = thisInvoice.getInvLevel();
		invoiceNbr = thisInvoice.getInvNbr();
		var datePlus30 = jsDateToMMDDYYYY(convertDate(dateAdd(null,30)))
		var today = jsDateToMMDDYYYY(new Date());
		
		if (invoiceLvl == "1")
		{
			updateInvoiceLevel(capId,thisInvoice,2,datePlus30,today,altID);
		}
	}	
	
	//Get invoices ASI TAble
	var INVOICES = loadASITable("INVOICES");
	
	// Pay Invoices for Lien
	var lienInvoiceObj = aa.finance.getInvoiceByCapID(capId,null);
	if(lienInvoiceObj.getSuccess()){
		var lienInv = lienInvoiceObj.getOutput();
		for(x in lienInv){
			if (payInvoiceByMethod(lienInv[x].getInvNbr(),"Transfer to County")){
				//logDebug(lienInv[x].getInvNbr() + " : Payment Successful");
			}
			else{
				//logDebug(lienInv[x].getInvNbr() + " : Payment Failed");
			}
		}
	}
	
	// Pay Invoices for each record in ASIT
	// Implement negative invoices into payment to not over sent to county
	// Get all fee item balances that are outstanding to be paid and process single payment
	var feeInvArr = new Array();
	var creditInvArr = new Array();
	
	for(x in INVOICES){
		var tmpInv = INVOICES[x]["Invoice Number"];
		var invArr = new Array();
		//Check for new proper invoice # first
		if(!isNaN(tmpInv)){
			//aa.print("Get by AA ID");
			invArr = aa.invoice.getFeeItemInvoiceByInvoiceNbr(tmpInv).getOutput();
		}
		//if no fees found then get by the custom ID
		if(invArr.length == 0){
			//aa.print("Get by Custom");
			invArr = aa.invoice.getFeeItemInvoiceByCustomizedNbr(tmpInv).getOutput();
		}
		var tcap = null;
		for(ii in invArr){
			var tInv = invArr[ii];
			if(tInv.getFeeitemStatus() != "INVOICED")  //Ignore Credit/Voided items as they cancel out
				continue;

			if(tcap == null){//get the record ID the first loop add the inv and credit arrays
				var tcap = aa.cap.getCapID(tInv.getCapID().getID1(),tInv.getCapID().getID2(),tInv.getCapID().getID3()).getOutput();
				var tAltId = tcap.getCustomID()+"";
				if(feeInvArr[tAltId] == null){
					feeInvArr[tAltId] = new Array();
					creditInvArr[tAltId] = new Array();
				}
			}
			var tFeeSeq = tInv.getFeeSeqNbr();
			var tInvNumber = tInv.getInvoiceNbr();
			var tApplyDt = tInv.getApplyDate();
			var tFeeCod = tInv.getFeeCode();
			var tFeeDue = tInv.getFee();
			if(tFeeDue != 0){
				var tfeePaidAmt = aa.finance.getTotalPaidFeeItem(tcap, tFeeSeq).getOutput();
				tFeeDue = tFeeDue - tfeePaidAmt;
				tFeeDue = toFixedFloat(tFeeDue);
				if(tFeeDue == 0) //if this was paid then break out
					continue;
				feeInvArr[tAltId].push(new feeInvObj(tcap, tFeeSeq, tFeeDue, tInvNumber, tFeeCod, tApplyDt));
			}
		}//end Invoice Fee Item Array
	} //End Invoices processing Array
	
	if (payByCapFeeInvObj(feeInvArr,"Transfer to County")){
			logDebug("Paid Lien Successfuly");
		}
		else{
			logDebug("Paid Lien Failed");
		}
	mySet.add(capId,"Processed");
}

aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

if (emailAddress.length ) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);	

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function payByCapFeeInvObj(feesObj,methodType) //optional: itemCap
  {
  	for(altId in feesObj){
  		//get the Record to Pay
  		var payCap = aa.cap.getCapID(altId).getOutput();
		var payAlocArr = new Array();
		var amtToPay = 0;
		
		for(x in feesObj[altId]){
			if(feesObj[altId][x].feeDue != 0){
				payAlocArr.push(feesObj[altId][x]);
				amtToPay += feesObj[altId][x].feeDue;
			}
		}
		amtToPay = toFixedFloat(amtToPay); //make sure numberis good
		
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
			//Now make full payment
			
			if(amtToPay != 0 && pSeq != null){
				
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
					logDebug("Applied $" + amtToPay + " to fee:" );
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
		} //fees on record are done
  	}//end cap loop

	return true;
  }
	
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
		feeStatus = invArr[feeItem].getFeeitemStatus();
		
		//Make sure the fee item is invoiced
		if( feeStatus != "INVOICED" ){
			continue;
		}
		
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
		//TODO: FIX ARRAY PROCESSING
		
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
  
 function feeInvObj(itemCap, feeSeqNbr, feeAmtDue, invNumber, feeDesc, applyDt){
 	this.itemCap = itemCap;
  	this.feeSeq = feeSeqNbr;
  	this.feeDue = feeAmtDue;
  	this.inv = invNumber;
  	this.feeDesc = feeDesc;
  	this.applyDt = applyDt;
  	
  	return this;
  }
  
  //DQ 12/16 UPDATED TO ROUND UP FOR FEEDS
function toFixedFloat(pVal){
	var pPer = 2
	var rTyp = "N"; //rount type N=normal U=Up
	if(typeof(pVal)!='number'){ 
		if(typeof(pVal * 1)=='number') 
			pVal = parseFloat(pVal); 
		else return pVal;
	}
	if(arguments.length > 1){ pPer = arguments[1]; }
	return Math.round(pVal * Math.pow(10,pPer)) / Math.pow(10,pPer);
	//return parseFloat(pVal.toFixed(pPer));
}