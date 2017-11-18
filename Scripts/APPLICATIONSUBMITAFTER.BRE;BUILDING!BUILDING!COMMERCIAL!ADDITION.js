/*------------------------------------------------------------------------------------------------------/
| Rule 			: 2:BuildingAdditionR1 V1.0.0
| Rule 			: 4:AdditionR2 V1.0.0
| Program		: APPLICATIONSUBMITAFTER.BRE:BUILDING/BUILDING/COMMERCIAL/ADDITION
| Event			: ApplicationSubmitAfter
|
| Usage			:
| Notes			: auto generated  Script by Business Rule Engine
| Published by	: ADMIN
| Published at	: 17/05/2017 16:07:19
|
/------------------------------------------------------------------------------------------------------*/


/**
 * RULE NAME: BuildingAdditionR1
 * RULE ID: 2
 * RULE VERSION: 1.0.0
 */
CTX.RULEID =2;
/** BRE GENERATED SCRIPT*/
if(this.Record.Contacts['Applicant'].firstName==Jerry){
//execute ADDFEE
	this.executeAction('ADDFEE',{"FeeItemCode":"BLDGPERM","Quantity":"1","AutoInvoice":"true","ID":"ADDFEE","CMD":"Add Fee","STOPONERROR":true,"CANCELEVENT":true});
}else{
}

/**
 * RULE NAME: AdditionR2
 * RULE ID: 4
 * RULE VERSION: 1.0.0
 */
CTX.RULEID =4;
/** BRE GENERATED SCRIPT*/
if(this.Record.Contacts['Applicant'].firstName==Jerry){
//execute ADDFEE
	this.executeAction('ADDFEE',{"FeeItemCode":"BLDGPERM","Quantity":"1","AutoInvoice":"true","ID":"ADDFEE","CMD":"Add Fee","STOPONERROR":true,"CANCELEVENT":true});
}else{
}