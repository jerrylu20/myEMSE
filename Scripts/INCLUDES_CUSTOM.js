/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|	    available to all master scripts
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|	    available to all master scripts
|
| Notes   :
|
| History :
|	Date	|		Author		|	Description of change
|-----------+-------------------+-------------------------------------------------------------------------
| 04/10/2012  Philip Nadavallil    Added String manipulation functions from jPaq. jPaq deals with prototyping 
|                                  which the Rhino engine doesn't seem to understand. So until we upgrade to 
|                                  a version of Rhino that understands prototype, use the straight functions.
| 06/20/2012  Paul H. Rose         Added two GIS functions getGISInfo2 and getGISInfoArray2 with optional parameters
|                                  numDistance and distanceType when getting attributes from GIS.
| 09/13/2012  Paul H. Rose         Added one more GIS function getGISInfo2ASB to be used in ApplicationSubmitBefore
|                                  event.
/--------------------------------------------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------------------------------
 * jPaq String manipulation functions/prototypes
 * -----------------------------------------------------------------------------------------------------
 */
 
/*------- trim --------------------------------------------------------------------- */
String.prototype.trim = String.prototype.trim || function() {
	// <summary>
	//   Gets this string without whitespace characters at the beginning and
	//   end.
	// </summary>
	// <returns type="String">
	//   Returns this string without whitespace characters at the beginning and
	//   end.
	// </returns>
	return this.trimLeft().trimRight();
}

/*
 * Usage: trim(" abc   ")
 * Output: "abc" 
 */
function trim(str){
	return trimRight(trimLeft(str));
}

/*------- trimLeft ------------------------------------------------------------------- */
String.prototype.trimLeft = String.prototype.trimLeft || function() {
	// <summary>Gets this string without whitespace characters at the beginning.</summary>
	// <returns type="String">
	//   Returns this string without whitespace characters at the beginning.
	// </returns>
	return this.replace(/^[\s\u00A0]+/, "");
}

/*
 * Usage: trimLeft("   abc ")
 * Output: "abc "
 */
function trimLeft(str){
	return str.replace(/^[\s\u00A0]+/, "");
}


/*------- trimRight ------------------------------------------------------------------ */
String.prototype.trimRight = String.prototype.trimRight || function() {
	// <summary>Gets this string without whitespace characters at the end.</summary>
	// <returns type="String">
	//   Returns this string without whitespace characters at the end.
	// </returns>
	return this.replace(/[\s\u00A0]+$/, "");
}

/*
 * Usage: trimRight(" abc ")
 * Output: " abc"
 */
function trimRight(str){
	return str.replace(/[\s\u00A0]+$/, "");
}

/*------- padLeft ------------------------------------------------------------------- */
String.prototype.padLeft = function(numOfChars, padding) {
	// <summary>
	//   Adds the character(s) in padding to the left iteratively until the
	//   string is as long as numOfChars.
	// </summary>
	// <param name="numOfChars" type="Number">
	//   The maximum number of characters that can appear in the string after
	//   the padding is added.  If this string is already longer than
	//   numOfChars, just the string will be returned.
	// </param>
	// <param name="padding" type="String" optional="true">
	//   Optional.  By default, this value is the space character.  The
	//   character or sequence of characters that will be continually appended
	//   to the beginning of the string until the string is of length
	//   numOfChars.
	// </param>
	// <returns type="String">
	//   Returns this string with padding added iteratively to the beginning of
	//   the string until the string has numOfChars characters in it.
	// </returns>
	if(!padding || padding.constructor !== String)
			padding = " ";
	var m = Math.max(Math.ceil((numOfChars - this.length) / padding.length), 0);
	return new Array(m + 1).join(padding).slice(this.length - numOfChars) + this;
}

/*
 * Usage: padLeft("abc", 5, "0")
 * Output: "00abc"
 */
function padLeft(str, numOfChars, padding){
	if(!padding || padding.constructor !== String)
			padding = " ";
	var m = Math.max(Math.ceil((numOfChars - str.length) / padding.length), 0);
	return new Array(m + 1).join(padding).slice(str.length - numOfChars) + str;
}

/*------- padRight ------------------------------------------------------------------- */
String.prototype.padRight = function(numOfChars, padding) {
	// <summary>
	//   Adds the character(s) in padding to the end iteratively until the
	//   string is as long as numOfChars.
	// </summary>
	// <param name="numOfChars" type="Number">
	//   The maximum number of characters that can appear in the string after
	//   the padding is added.  If this string is already longer than
	//   numOfChars, just the string will be returned.
	// </param>
	// <param name="padding" type="String" optional="true">
	//   Optional.  By default, this value is the space character.  The
	//   character or sequence of characters that will be continually appended
	//   to the end of the string until the string is of length numOfChars.
	// </param>
	// <returns type="String">
	//   Returns this string with padding added iteratively to the end of
	//   the string until the string has numOfChars characters in it.
	// </returns>
	if(!padding || padding.constructor !== String)
			padding = " ";
	var m = Math.max(Math.ceil((numOfChars - this.length) / padding.length), 0);
	return this + (new Array(m + 1).join(padding).slice(0, numOfChars - this.length));
}

/*
 * Usage: padRight("abc", 5, "3")
 * Output: "abc33"
 */
function padRight(str, numOfChars, padding){
	if(!padding || padding.constructor !== String)
			padding = " ";
	var m = Math.max(Math.ceil((numOfChars - str.length) / padding.length), 0);
	return str + (new Array(m + 1).join(padding).slice(0, numOfChars - str.length));
}
/*------- getGISInfo2 ------------------------------------------------------------------- */
function getGISInfo2(svc,layer,attributename) // optional: numDistance, distanceType
	{
	// use buffer info to get info on the current object by using distance 0 feet by default
	// 05/16/2012 - Paul H. Rose modified to add optional parameters	
	// usage: 
	//
	// x = getGISInfo2("flagstaff","Parcels","LOT_AREA");
	// x = getGISInfo2("flagstaff","Parcels","LOT_AREA", -1, "feet");
	
	var numDistance = 0
	if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
	var distanceType = "feet";
	if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list

	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
				}
			
			}
		}
	return retString
	}

/*------- getGISInfoArray2 ------------------------------------------------------------------- */
function getGISInfoArray2(svc,layer,attributename) // optional: numDistance, distanceType
	{
	// use buffer info to get info on the current object by using distance 0
	// 05/16/2012 - Paul H. Rose modified to add optional parameters	
	// usage: 
	//
	// x = getGISInfoArray2("flagstaff","Parcels","LOT_AREA");
	// x = getGISInfoArray2("flagstaff","Parcels","LOT_AREA", -1, "feet");
	//
	
	var numDistance = 0
	if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
	var distanceType = "feet";
	if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list
	var retArray = new Array();
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues();
				retArray.push(v[0]);
				}
			
			}
		}
	return retArray;
	}
function getGISInfo2ASB(svc,layer,attributename) // optional: numDistance, distanceType
{
	// use buffer info to get info on the current object by using distance 0
	// usage: 
	//
	// x = getGISInfo("flagstaff","Parcels","LOT_AREA");
	// x = getGISInfo2("flagstaff","Parcels","LOT_AREA", -1, "feet");
	//
	// to be used with ApplicationSubmitBefore only
	
	var numDistance = 0
	if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
	var distanceType = "feet";
	if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list
	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
	{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
	}
	else
	{ logDebug("**ERROR: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Parcel.  We'll only send the last value
	{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**ERROR: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
		{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
			{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
			}
		}
	}
	
	return retString
}
function getRecordStatus()
	{
	var itemCap = capId;
	if (arguments.length > 0)
		itemCap = arguments[0]; // use cap ID specified in args

	capResult = aa.cap.getCap(itemCap)

	if (!capResult.getSuccess())
		{logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()) ; return false }

	capModel = capResult.getOutput().getCapModel()
	var sReturn = capModel.getCapStatus();

	if(sReturn != null)
		return sReturn;
	else
		return "";
	}


function updateInvoiceLevel(c,iObj,newLevel,invDueDate,invBatchDate,udf1)
	{
	var i = iObj.getInvoiceModel();
	if(invDueDate == null){
		invDueDate = i.getInvDueDate();
	}
	if(invBatchDate == null){
		invBatchDate = i.getInvBatchDate();
	}
	if(udf1 == null){
		udf1 = i.getUdf1();
	}
	editResult = aa.finance.editInvoice(c,
					i.getInvNbr(),
					newLevel,
					i.getInvStatus(),
					i.getInvStatusDate() ? aa.date.parseDate(i.getInvStatusDate()) : null,
					i.getBalanceDue(),
					i.getInvAmount(),
					i.getInvDate() ? aa.date.parseDate(i.getInvDate()) : null,
					invDueDate ? aa.date.parseDate(invDueDate) : null,
					i.getInvComment(),
					i.getInvBatchNbr(),
					invBatchDate ? aa.date.parseDate(invBatchDate) : null,
					udf1,
					i.getUdf2(),
					i.getUdf3(),
					i.getUdf4(),
					i.getPrintInvNbr(),
					i.getAuditDate() ? aa.date.parseDate(i.getAuditDate()) : null,
					i.getAuditStatus())

	if (editResult.getSuccess())
		logDebug("Updated invoice to level " +  newLevel + " successfully.");
	else
		logMessage("ERROR","ERROR: updating invoice level " + newLevel + " The reason is "  + editResult.getErrorType() + ":" + editResult.getErrorMessage());
	}
	
	
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
function keyExists(hash, fieldName) {
	var retValue = false;
	for (xx in hash) {
		if (xx.equals(fieldName)) 
			return true;
	}
	return false;
}
function getAssignedUser() // option CapId
{
	var itemCap = capId
	if (arguments.length > 0)
		itemCap = arguments[0]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	var sReturn = cd.getAsgnStaff();

	if(sReturn != null)
		return sReturn;
	else
		return "";
}
function feeAmountAll(checkCapId) {
/*---------------------------------------------------------------------------------------------------------/
| Function Intent: 
| This function will return the total fee amount for all the fees on the record provided. If optional
| status are provided then it will only return the fee amounts having at status in the lists.
|
| Returns:
| Outcome  Description   Return  Type
| Success: Total fee amount  feeTotal Numeric
| Failure: Error    False  False
|
| Call Example:
| feeAmountAll(capId,"NEW"); 
|
| 05/15/2012 - Ewylam
| Version 1 Created
|
| Required paramaters in order:
| checkCapId - capId model of the record
|
/----------------------------------------------------------------------------------------------------------*/ 
 
 // optional statuses to check for (SR5082)
        var checkStatus = false;
 var statusArray = new Array();

 //get optional arguments 
 if (arguments.length > 1)
  {
  checkStatus = true;
  for (var i=1; i<arguments.length; i++)
   statusArray.push(arguments[i]);
  }
        
 var feeTotal = 0;
 var feeResult=aa.fee.getFeeItems(checkCapId);
 if (feeResult.getSuccess())
  { var feeObjArr = feeResult.getOutput(); }
 else
  { logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false; }

 for (ff in feeObjArr) {
  if ( !checkStatus || exists(feeObjArr[ff].getFeeitemStatus(),statusArray) )
   { feeTotal+=feeObjArr[ff].getFee(); }
   }
 return feeTotal;
}
function invoiceFeeAll(fperiod)
    {
    //invoices all assessed fees having fcode and fperiod
    // SR5085 LL
    var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in argsvar 			
    feeFound=false;
    getFeeResult = aa.fee.getFeeItems(itemCap);
    if (getFeeResult.getSuccess())
        {
        var feeList = getFeeResult.getOutput();
        for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW"))
				{
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
                feeFound=true;
                logDebug("Assessed fee "+feeSeq+" found and tagged for invoicing");
                }
        }
    else
		{ logDebug( "**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())}
    return feeFound;
    }
function runReportAttach(aaReportName,aaReportParamName,aaReportParamValue)
{
	var reportName = aaReportName;
	
	report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput(); 
	cap = aa.cap.getCap(capId).getOutput();
 	appTypeResult = cap.getCapType();
 	appTypeString = appTypeResult.toString(); 
 	appTypeArray = appTypeString.split("/");
	
	report.setModule(appTypeArray[0]); 
	report.setCapId(capId); 
	report.getReportInfoModel().getEDMSEntityIdModel().setAltId(altID);

	var parameters = aa.util.newHashMap();	
	//Make sure the parameters includes some key parameters. 
	parameters.put(aaReportParamName, aaReportParamValue);
	
	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
	{ 
		var reportResult = aa.reportManager.getReportResult(report); 
		
		if(reportResult) 
		{ 
			reportResult = reportResult.getOutput(); 
			var reportFile = aa.reportManager.storeReportToDisk(reportResult); 

			reportFile = reportFile.getOutput();
		}
		logDebug("Report has been run for " + altID);

	}
	else
		logDebug("No permission to report: "+ reportName + " for Admin" + systemUserObj);
}
function paymentByMethod(invoiceNbr,methodType) //optional: itemCap
  {
	// function  performs the following:
	// retrieve invoices on record and matches to invoiceNbr parameter
	// initiates payment on invoices by methodType parameter
	// if payment successful applies payment in full to fee associated with fseqNbr
	// generates receipt for payment for fee associated with fseqNbr
	// if any of the above fails returns false, otherwise will return true.
	// fee must be invoiced for function to work

        invoiceNbr = invoiceNbr;
	methodType = methodType
	itemCap = capId;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
	
	//get fee details
	//retrieve a list of invoices by capID
	iListResult = aa.finance.getInvoiceByCapID(itemCap,null);
	if (iListResult.getSuccess())
	  {
		iList = iListResult.getOutput();
		invNbr = "";
		feeAmount = "";
		iFound = false;
		
		//find invoice by matching invoice with one passed in
		for (iNum in iList)
		  {
			fList = aa.invoice.getFeeItemInvoiceByInvoiceNbr(iList[iNum].getInvNbr()).getOutput()
			for (fNum in fList)
        	  if (iList[iNum].getInvNbr() == invoiceNbr)
			    {	
				  invNbr = iList[iNum].getInvNbr();
				  feeAmount = fList[fNum].getFee();
				  feeSeqNbr = fList[fNum].getFeeSeqNbr(); 
				  iFound = true;
				  logMessage("Invoice Number Found: " + invNbr);
				  logMessage("Fee Amount: " + feeAmount);
				  break;
				}
		  }
		  if (!iFound)
			{
			  logMessage("Invoice not found");
			  return false;
			}
	  }
	else
	  {
		logDebug("Error: could not retrieve invoice list: " + iListResult.getErrorMessage());
		return false;
	  }

	  
	//prepare payment
	//create paymentscriptmodel
	p = aa.finance.createPaymentScriptModel();
	p.setAuditDate(aa.date.getCurrentDate());
	p.setAuditStatus("A");
	p.setCapID(itemCap);
	p.setCashierID(p.getAuditID());
	p.setPaymentSeqNbr(p.getPaymentSeqNbr());
	p.setPaymentAmount(feeAmount);
	p.setAmountNotAllocated(feeAmount);
	p.setPaymentChange(0);
	p.setPaymentComment("Payment Made Via Script");
	p.setPaymentDate(aa.date.getCurrentDate());
	p.setPaymentMethod(methodType);
	p.setPaymentStatus("Paid");
	//p.setAcctID(tAccountID);
 
	//create payment
	presult = aa.finance.makePayment(p);
	if (presult.getSuccess()) 
	  {
		//get additional payment information
		pSeq = presult.getOutput();
		logDebug("Payment successful");
		pReturn = aa.finance.getPaymentByPK(itemCap,pSeq,currentUserID);
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
	feeSeqNbrArray = new Array() ; 
	feeSeqNbrArray.push(feeSeqNbr);
	
	invNbrArray = new Array();
	invNbrArray.push(invNbr);
	
	feeAllocArray = new Array();
	feeAllocArray.push(feeAmount);

	applyResult = aa.finance.applyPayment(itemCap,pR.getPaymentSeqNbr(),feeAmount,feeSeqNbrArray,invNbrArray,feeAllocArray,aa.date.getCurrentDate(),"Paid","Paid",pR.getCashierID(),null);
		
	if (applyResult.getSuccess()) 
	  {
		//get additional payment information
		apply = applyResult.getOutput();
		logDebug("Apply Payment Successful");
	  }
	else 
	  {
		logDebug("error applying funds: " + applyResult.getErrorMessage());
		return false;
	  }
	
	
	//generate receipt
	receiptResult = aa.finance.generateReceipt(itemCap,aa.date.getCurrentDate(),pR.getPaymentSeqNbr(),pR.getCashierID(),null);

	if (receiptResult.getSuccess())
	  {
		receipt = receiptResult.getOutput();
		logDebug("Receipt successfully created: ");// + receipt.getReceiptNbr());
	  }
	else 
	  {
		logDebug("error generating receipt: " + receiptResult.getErrorMessage());
		return false;
	  }
	   
	 //everything committed successfully
	 return true;
  }
function getTaskAssignUser(wfstr) // optional process name.

{

var useProcess = false;

var processName = "";

if (arguments.length == 2)

{

processName = arguments[1]; // subprocess

useProcess = true;

}

var workflowResult = aa.workflow.getTasks(capId);

if (workflowResult.getSuccess())

  wfObj = workflowResult.getOutput();

  else

    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

for (i in wfObj)

{

  var fTask = wfObj[i];

  if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*")  && (!useProcess || fTask.getProcessCode().equals(processName)))

{
var taskAssignUser = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();

if (taskAssignUser != null)
				{
				// re-grabbing for userid.
				wfUserObj = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
				return wfUserObj.getUserID();
				}

}

}

return false;

}
function loadCustomParcelAttributes(thisArr) {
	//
	// Returns an associative array of Parcel Attributes
	// Optional second parameter, cap ID to load from
	//
	
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var fcapParcelObj = null;
   	var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
   	if (capParcelResult.getSuccess())
   		var fcapParcelObj = capParcelResult.getOutput().toArray();
   	else
     		logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage())
  	
  	for (i in fcapParcelObj)
  		{
  		parcelAttrObj = fcapParcelObj[i].getParcelAttribute().toArray();
  		for (z in parcelAttrObj)
			thisArr["ParcelAttribute." + parcelAttrObj[z].getB1AttributeName()]=parcelAttrObj[z].getB1AttributeValue();
		}
	}
function updateInvoiceLevelZero(invoiceNbr) //optional: itemCap
  {
	// function  performs the following:
	// Checks the invoice number and updates the invoice level to 0

        invoiceNbr = invoiceNbr;
	itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
	
	//get fee details
	//retrieve a list of invoices by capID
	iListResult = aa.finance.getInvoiceByCapID(itemCap,null);
	if (iListResult.getSuccess())
	  {
		iList = iListResult.getOutput();
		iFound = false;
		
 		//find invoice by matching invoice with one passed in
		for (iNum in iList)
		  {
		  if (iList[iNum].getInvNbr() == invoiceNbr)
        	 	     {		   
				updateInvoiceLevel(capId,iList[iNum],0);
				iFound=true;
			     }
		  }
		if (iFound)
			{
			  logMessage("Invoice found and updated");
			  return true;
			}
		else
			{
			  logMessage("Invoice not found");
			  return false;
			} 
	   }
  }
function voidFee(fcode,fperiod,fstatus)
    {
    var feeFound=false;
    getFeeResult = aa.finance.getFeeItemByFeeCode(capId,fcode,fperiod);
    if (getFeeResult.getSuccess())
        {
        var feeList = getFeeResult.getOutput();
        for (feeNum in feeList)
	if (feeList[feeNum].getFeeitemStatus().equals(fstatus)) {
		var feeSeq = feeList[feeNum].getFeeSeqNbr();
		var feeVoidResult = aa.finance.voidFeeItem(capId, feeSeq);
		if (feeVoidResult.getSuccess()) {
			logDebug("Voided fee item " + feeSeq);
            return feeSeq;
		}
		else {
			logDebug("Error voiding fee item " + feeVoidResult.getErrorMessage());
			return false;
		}
        }
    }
    else
		{ logDebug( "**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())}
    return feeFound;
    }
function invoiceOneNow(feeSeq, paymentPeriod) 
{
 
 var feeSeqList = new Array();
 feeSeqList[0] = feeSeq;
 
 paymentPeriodList = new Array();
 if (paymentPeriod == null) 
  paymentPeriodList[0] = "FINAL";
 else 
  paymentPeriodList[0] = paymentPeriod;
 var invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
 if (!invoiceResult.getSuccess())
  logDebug("ERROR", "Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
}
function invoiceFeeAllVoided(fperiod)
    {
    //invoices all assessed fees having fcode and fperiod
    // SR5085 LL
    var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in argsvar 			
    feeFound=false;
    getFeeResult = aa.fee.getFeeItems(itemCap);
    if (getFeeResult.getSuccess())
        {
        var feeList = getFeeResult.getOutput();
        for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("VOIDED"))
				{
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
                feeFound=true;
                logDebug("Assessed fee "+feeSeq+" found and tagged for invoicing");
                }
        }
    else
		{ logDebug( "**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())}
    return feeFound;
    }
function runReportAttachCapID(aaReportName,aaReportParamName,aaReportParamValue,newCap)
{
	var reportName = aaReportName;
	
	report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput(); 
	cap = aa.cap.getCap(newCap).getOutput();
 	appTypeResult = cap.getCapType();
 	appTypeString = appTypeResult.toString(); 
 	appTypeArray = appTypeString.split("/");
	altID = newCap.getCustomID();
	
	report.setModule(appTypeArray[0]); 
	report.setCapId(newCap); 
	report.getReportInfoModel().getEDMSEntityIdModel().setAltId(altID);

	var parameters = aa.util.newHashMap();	
	//Make sure the parameters includes some key parameters. 
	parameters.put(aaReportParamName, aaReportParamValue);
	
	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
	{ 
		var reportResult = aa.reportManager.getReportResult(report); 
		
		if(reportResult) 
		{ 
			reportResult = reportResult.getOutput(); 
			var reportFile = aa.reportManager.storeReportToDisk(reportResult); 

			reportFile = reportFile.getOutput();
		}
		logDebug("Report has been run for " + altID);

	}
	else
		logDebug("No permission to report: "+ reportName + " for Admin" + systemUserObj);
}
function runReport(aaReportName,aaReportParamName,aaReportParamValue)
{
	var reportName = aaReportName;
	var reportmessage = "";
//	report = aa.reportManager.getReportInfoModelByName(reportName);
	report = aa.reportManager.getReportModelByName(reportName);
	report = report.getOutput(); 
	
	//report.setModule("BUILDING"); 
	//report.setCapId(capId); 
	
	var parameters = aa.util.newHashMap();	
	//Make sure the parameters includes some key parameters. 
	parameters.put(aaReportParamName, aaReportParamValue);
	
//	report.setReportParameters(parameters);
	var msg = aa.reportManager.runReport(parameters,report);
	aa.env.setValue("ScriptReturnCode","0");  
	if (reportmessage == "") 
	{
			reportmessage =  msg.getOutput();
	}
	else
	{
			reportmessage = reportmessage + ";" + msg.getOutput();
	}
	aa.env.setValue("ScriptReturnMessage", reportmessage);
/*
	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
	{ 
		var reportResult = aa.reportManager.getReportResult(report); 
		
		if(reportResult) 
		{ 
			reportResult = reportResult.getOutput(); 
			var reportFile = aa.reportManager.storeReportToDisk(reportResult); 

			reportFile = reportFile.getOutput();
			//var sendResult = aa.sendEmail(fromAddress,toAddress,ccAddress, reportSubject, reportContent, reportFile);
		}
		logDebug("Report has been run for " + altID);
//		if(sendResult.getSuccess()) 
//			logDebug("A copy of this report has been sent to the valid email addresses."); 
//		else 
//			logDebug("System failed send report to selected email addresses because mail server is broken or report file size is great than 5M."); 
	}
	else
		logDebug("No permission to report: "+ reportName + " for Admin" + systemUserObj);
*/
}
function feeQtyStatus(feestr) 
	{
    // optional statuses to check for
    //
    var checkStatus = false;
	var statusArray = new Array(); 

	//get optional arguments 
	if (arguments.length > 1)
		{
		checkStatus = true;
		for (var i=1; i<arguments.length; i++)
			statusArray.push(arguments[i]);
		}
        
	var feeQty = 0;
	var feeResult=aa.fee.getFeeItems(capId);
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + feeResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if ( feestr.equals(feeObjArr[ff].getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getFeeitemStatus(),statusArray)) )
			feeQty+=feeObjArr[ff].getFeeUnit()
			
	return feeQty;
	}
function countInspectionsToday()
	{
	var cntResult = 0;
	todayDate = new Date();
	
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();
		for (xx in inspList)
			{
			if (inspList[xx].getScheduledDate() != null) 
				if (jsDateToASIDate(convertDate(inspList[xx].getInspectionStatusDate())) == jsDateToASIDate(todayDate))
					if (!matches(inspList[xx].getInspectionType(),"Field Check","Zoning"))
						if (!matches(inspList[xx].getInspectionStatus(),"Scheduled","Rescheduled","Pending","Cancelled"))
							{cntResult++;
							}
			}
		}	
	logDebug("countInspectionsToday = " + cntResult);
	return cntResult;
	}
function setRelatedInvoicesLevel(itemCap,invNbr,invLevel,invDueDate,invBatchDate,udf1){
	var feeInvs = aa.finance.getFeeItemInvoiceByCapID(itemCap,null).getOutput(); 
	for(x in feeInvs){
		if(feeInvs[x].getFeeitemStatus().equals("VOIDED")){  //Only look for voided fee items
			if(feeInvs[x].getInvoiceNbr() == invNbr){		 //Filter for the current invoice
				for(l in feeInvs){
					if(feeInvs[l].getFeeitemStatus().equals("CREDITED") && feeInvs[x].getFeeSeqNbr() == feeInvs[l].getFeeSeqNbr()){ //get the CREDITED invoice
						invResult = aa.finance.getInvoiceByCapID(itemCap,null).getOutput();
						for(i in invResult){
							if(invResult[i].getInvNbr() == feeInvs[l].getInvoiceNbr()){  //find the credit invoice
								updateInvoiceLevel(itemCap,invResult[i],parseInt(invLevel),invDueDate,invBatchDate,udf1); //update the credit invoice
								break; 
							}
						} //end invoice loop
						break;
					}
				} //end credit loop
			}
		}// end voided loop
	} //end feeitem Invoice loop
}
function countInspectionsInspDate(inspDate)
	{
	var cntResult = 0;
	inspDateJS = new Date(inspDate);
	
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();
		for (xx in inspList)
			{
			if (inspList[xx].getScheduledDate() != null)
				if (inspList[xx].getInspectionDate() != null)
					if (jsDateToASIDate(convertDate(inspList[xx].getInspectionDate())) == jsDateToASIDate(inspDateJS))
						if (!matches(inspList[xx].getInspectionType(),"Field Check","Zoning Inspection","Zoning"))
							if (!matches(inspList[xx].getInspectionStatus(),"Scheduled","Rescheduled","Pending","Cancelled"))
								{cntResult++;
								}
			}
		}	
	logDebug("countInspectionsInspDate = " + cntResult);
	return cntResult;
	}
function IsStrInArry(eVal,argArr) {
                var x;
                for (x in argArr){
                                if (eVal == argArr[x]){
                                                return true;
                                }
                 }            
                return false;
}
function getSubGrpFeeAmt(subGrp){
/*---------------------------------------------------------------------------------------------------------/
| Function Intent: 
|              This function is intended to return the total fee amount for all "NEW" or "INVOICED" fees on 
|              the record that have the sub group configured. This can be used to apply surcharges where multiple 
|              subgroups exist and the SG-Percentage fee type will not work.
|
| Call Example 1 (Return total fee amount regardless of fee status for the "DEQ" subgroup):
|              getSubGrpFeeAmt("DEQ");
|
| Call Example 2 (Return total fee amount of NEW fees with the "DEQ" subgroup):
|              getSubGrpFeeAmt("DEQ","NEW")
|
| Call Example 3 (Return total fee amount of NEW fees with the "DEQ" subgroup excluding the "B_SEP_310" fee.):
|              getSubGrpFeeAmt("DEQ","NEW","B_SEP_310")
|
| Call Example 4 (Return total fee amount of all fees with the "DEQ" subgroup excluding the "B_SEP_310" fee.):
|              getSubGrpFeeAmt("DEQ","","B_SEP_310")
|
| 05/15/2012 - Ewylam
|              Version 1 Created
|
| Required paramaters in order:
|              subGrp - String - the subgroup that will be used to return the fee amounts
|
| Optional paramaters:
|              spStatus - String - The status of fees to return. NEW, CREDITED, INVOICED, VOIDED
|              excludedFeeCode - String - the fee code of any fee to exclude from the returned amount
|                              
/----------------------------------------------------------------------------------------------------------*/
 
                //Check for a specific status to use, optional argument 1
                var spStatus = "";
                if (arguments.length >= 2) {spStatus = arguments[1];}
                
                //Check for a specific FeeCode to exclude, optional argument 2
                var excludedFeeCode = "";
                if (arguments.length == 3) {excludedFeeCode = arguments[2];}
                
                var runFeeTot;
                var feeA;
                var thisFeeSubGrp;
                var thisFeeSubGrpAry;
                var x;
                
                if (spStatus !== "") {
                                logDebug("Getting total fees for Sub Group: " + subGrp + "; Having a status of: " + spStatus);
                                runFeeTot = 0;
                                feeA = loadFees();
                                for (x in feeA)    {
                                                thisFee = feeA[x];
                                                if (thisFee.subGroup !== null) {
                                                                thisFeeSubGrp = thisFee.subGroup;
                                                                thisFeeSubGrpAry = thisFeeSubGrp.split(",");
                                                                if (IsStrInArry(subGrp,thisFeeSubGrpAry) && (thisFee.status == spStatus)){
                                                                                //Check to see if fee should be excluded, if not then count it.
                                                                                if (excludedFeeCode == thisFee.code) {
                                                                                                logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status);
                                                                                                logDebug("Fee " + thisFee.code + " is excluded from the Running Total: " + runFeeTot);
                                                                                }
                                                                                //excludedFeeCode is not specified, so count all
                                                                                else {
                                                                                                logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status );
                                                                                                runFeeTot = runFeeTot + thisFee.amount;
                                                                                                logDebug("Fee: " + thisFee.code + " added to the running total. Running Total: " + runFeeTot);
                                                                                }
                                                                }
                                                }
                                }
                }
                else {
                                logDebug("Getting total fees for Sub Group: " + subGrp + "; Having a status of INVOICED or NEW.");
                                runFeeTot = 0;
                                feeA = loadFees();
                                for (x in feeA)    {
                                                thisFee = feeA[x];
                                                if (thisFee.subGroup !== null) {
                                                                thisFeeSubGrp = thisFee.subGroup;
                                                                thisFeeSubGrpAry = thisFeeSubGrp.split(",");
                                                                if (IsStrInArry(subGrp,thisFeeSubGrpAry) && (thisFee.status == "INVOICED" || thisFee.status == "NEW")) {
                                                        if (excludedFeeCode == thisFee.code) {
                                                                                                logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status );
                                                                                                logDebug("Fee " + thisFee.code + " is excluded from the Running Total: " + runFeeTot);
                                                                                }
                                                                                //excludedFeeCode is not specified, so count all
                                                                                else {
                                                                                                logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status );
                                                                                                runFeeTot = runFeeTot + thisFee.amount;
                                                                                                logDebug("Fee: " + thisFee.code + " added to the running total. Running Total: " + runFeeTot);
                                                                                }
                                                                }
                                                }
                                }
                }
                logDebug("Final returned amount: " + runFeeTot);
                return (runFeeTot);
}
