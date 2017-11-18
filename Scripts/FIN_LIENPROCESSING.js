/*------------------------------------------------------------------------------------------------------/
| Program: FIN_LienProcessing.js  Client : Oakland   
|1. create Priority Lien Record 
|2. 
| To install Script:
| 1) Add script to Event > Script area of Accela Administrator
| 3) Search for Standard Choice CAPSET_SCRIPT_LIST and add it if it does not exists
| 4) Add new Standard Choice value to CAPSET_SCRIPT_LIST. Value = <Name of script> Description = <Displayed name on SET execute Button>
| Note: Script can be added multiple times with different script names
| 1/17 - Updated to be 1 lien per parcel in the set
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
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("BatchJobName");
var debug = "";								// Debug String
var br = "<BR>";							// Break Tag
//var capId = getCapId();						// CapId object
var emailAddress = ("DRex@oaklandnet.com");	// email to send report
var emailText = "";
var AInfo = new Array();
var feeSeqList = new Array();
var paymentPeriodList = new Array();
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var message =	"";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var currentUserID ="Admin"   		// Current User
/*----------------------------------------------------------------------------------------------------/
|
| END USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var debug = "";
var SetMemberArray= aa.env.getValue("SetMemberArray");
var setCode = aa.env.getValue("SetID");
var setPrefix = "LienRec";
var mySet = null;
logDebug("The Process Has Begun for batch " + setCode + ".");

// Create Set
if (setPrefix != "")
{
	var yy = startDate.getFullYear().toString().substr(2,2);
	var mm = (startDate.getMonth()+1).toString();
	if (mm.length<2)
		mm = "0"+mm;
	var dd = startDate.getDate().toString();
	if (dd.length<2)
		dd = "0"+dd;
	var hh = startDate.getHours().toString();
	if (hh.length<2)
		hh = "0"+hh;
	var mi = startDate.getMinutes().toString();
	if (mi.length<2)
		mi = "0"+mi;

	var setName = String.toUpperCase(setPrefix.substr(0,7) + yy + mm + dd + hh + mi);

	mySet = new capSet(setName,setName);

	mySet.type = "FINLienRecs";
	mySet.status = "Not Processed";
	mySet.update();
}

var procArr = new Array();  //processing array
		
for (var i = 0; i < SetMemberArray.length; i++)
{
	var createNew = false;
	var newRecAltID = "";
	var newRecID = null;
	
	var id= SetMemberArray[i];
	var capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();
	var altID = capId.getCustomID();					// alternate cap id string
	var totalInvoiceBal = 0;
    aa.print("SetMemberArray[" + i + "] is CAP ID:" + altID);
    
    var pars = aa.parcel.getParcelByCapId(capId,null).getOutput();
	var parArr = pars.toArray();
	var primaryPar = "";
	for(par in parArr){
	    primaryPar = parArr[par].getParcelNumber();
		if(parArr[par].getPrimaryParcelFlag() == "Y")
			break;
	}
	
	createNew = (procArr[primaryPar] == null) //If already processed this parcel we are adding not creating
	
	// create Priority Lien
	if(createNew){
		newRecID = createChild("Building","Lien","Priority Lien","NA","Created from" + altID);
		copyOwner(capId,newRecID);
		editAppSpecific("Interest","0",newRecID);
		editAppSpecific("Surcharge","0",newRecID);
		editAppSpecific("Transfer","Yes",newRecID);
		updateAppStatus("Lien Created","Created from Set Script",newRecID);
		editAppSpecific("Recordation Date",jsDateToASIDate(startDate),newRecID);
		newRecAltID = newRecID.getCustomID();
		logDebug( newRecID.getCustomID() + ": was created successfully.");
		
		procArr[primaryPar] = new leinObj();
		procArr[primaryPar].leinAltId = newRecAltID;
	}
	else{ //populate existing info
		newRecAltID = procArr[primaryPar].leinAltId;
		newRecID = aa.cap.getCapID(newRecAltID).getOutput();
		var result = aa.cap.createAppHierarchy(capId, newRecID);
		logDebug( newRecAltID + ": existing lein on parcel found.");
	}
	
	
		
	// update Priority Lien Record with Invoice information
	invResult = aa.finance.getInvoiceByCapID(capId,null);
	if (invResult.getSuccess())
		invList = invResult.getOutput();
	for (thisInv in invList)  // for each Invoice
		{		
		var thisInvoice = invList[thisInv];
		
		invoiceLvl = thisInvoice.getInvLevel();
		invoiceNbr = thisInvoice.getInvNbr();
		invoiceDate = dateFormatted(thisInvoice.invDate.getMonth(),thisInvoice.invDate.getDayOfMonth(),thisInvoice.invDate.getYear(),"");
		invoiceDueDate = dateAdd(invoiceDate,30);
		invoiceBalDue = thisInvoice.getInvoiceModel().getBalanceDue();
		if (invoiceLvl == "2")
			{
			newRow = new Array(); 
			newRow["Invoice Number"] = new asiTableValObj("Invoice Number",String(invoiceNbr),"N");
			newRow["Invoice Date"] = new asiTableValObj("Invoice Date",String(invoiceDate),"N");
			newRow["Due Date"] = new asiTableValObj("Due Date",String(invoiceDueDate),"N");
			newRow["Total Due"] = new asiTableValObj("Total Due",String(invoiceBalDue),"N");
			addToASITable("INVOICES",newRow,newRecID);
			//updateInvoiceLevel(capId,thisInvoice,3);
			totalInvoiceBal += invoiceBalDue;
			}
		}	

	if(createNew){  //only add the fees to the lein once
		// add lien fees
		addFee("PL_PREPARE","PRIO_LIEN","FINAL",1,"N",newRecID);
		addFee("PL_TERMINA","PRIO_LIEN","FINAL",1,"N",newRecID);
		addFee("PL_RECORD","PRIO_LIEN","FINAL",1,"N",newRecID);
		addFee("PL_NOTARIZED","PRIO_LIEN","FINAL",1,"N",newRecID);
		addFee("PL_PREP_INV","PRIO_LIEN","FINAL",1,"N",newRecID);
		addFee("PL_REC","PRIO_LIEN","FINAL",1,"N",newRecID);
		addFee("PL_TECH","PRIO_LIEN","FINAL",1,"N",newRecID);
	
		// Invoice Assessed Fees
			getFeeResult = new Array();
			getFeeResult = aa.fee.getFeeItems(newRecID);
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
			invoiceResult = aa.finance.createInvoice(newRecID, feeSeqList, paymentPeriodList);
	 		if (invoiceResult.getSuccess())
	  		logMessage("Invoicing assessed fee items is successful.");
	 		else
	  		logMessage("**ERROR: Invoicing the fee items assessed to app # " + newRecAltID + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
	 		
			}
	
		// Update Lien Record ASI Info
		var lienRecFeeAmt = feeAmountAll(newRecID,"INVOICED");
		var totalPrincipal = parseFloat(lienRecFeeAmt) + parseFloat(totalInvoiceBal);
		editAppSpecific("Principal",totalPrincipal.toFixed(2),newRecID);
		editAppSpecific("Total Lien",totalPrincipal.toFixed(2),newRecID);
		
		procArr[primaryPar].totalLien = totalPrincipal.toFixed(2);
		logDebug( newRecID.getCustomID() + ": Lien Fee Amount = " + lienRecFeeAmt + ". Total Principal = " + totalPrincipal);
	
		// update Priority Lien Record Invoice Level
		invLienResult = aa.finance.getInvoiceByCapID(newRecID,null);
		if (invLienResult.getSuccess())
			invLienList = invLienResult.getOutput();
		for (thisLienInv in invLienList)  // for each Invoice
			{		
			var thisLienInvoice = invLienList[thisLienInv];
			
			invoiceLienLvl = thisLienInvoice.getInvLevel();
			invoiceLienNbr = thisLienInvoice.getInvNbr();
			invoiceLienDate = dateFormatted(thisLienInvoice.invDate.getMonth(),thisLienInvoice.invDate.getDayOfMonth(),thisLienInvoice.invDate.getYear(),"");
			invoiceLienBalDue = thisLienInvoice.getInvoiceModel().getBalanceDue();
			if (invoiceLienLvl == "1")
				{
				updateInvoiceLevel(newRecID,thisLienInvoice,2);
				}
			}	
	} //end create new
	else{ //preexisting lein add the new invoices to the ASI balances
		procArr[primaryPar].totalLien = (parseFloat(totalInvoiceBal) + parseFloat(procArr[primaryPar].totalLien)).toFixed(2);
		editAppSpecific("Principal",procArr[primaryPar].totalLien,newRecID);
		editAppSpecific("Total Lien",procArr[primaryPar].totalLien,newRecID);
	}
	
	// Add to Set
	if(createNew){ //only add when new lein
		mySet.add(newRecID,"Not Processed");
	}

}
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

if (emailAddress.length ) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);	

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
	
function leinObj(){
	this.leinAltId = "";
	this.totalLien = 0;
	
	return this;
}